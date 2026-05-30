from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.usuario import Usuario
from app.models.maquina import Maquina
from app.models.abastecimento import Abastecimento
from app.models.manutencao import Manutencao, StatusManutencaoEnum
from app.schemas.dashboard import DashboardResumo, MaquinaAlerta, ConsumoMaquina, HistoricoMensal
from app.services.combustivel import calcular_status_consumo

router = APIRouter()


@router.get("/resumo", response_model=DashboardResumo)
async def get_dashboard_resumo(
    periodo_dias: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    data_inicio = date.today() - timedelta(days=periodo_dias)

    result = await db.execute(
        select(func.count(Maquina.id)).where(Maquina.ativa == True)
    )
    total_maquinas_ativas = result.scalar() or 0

    result = await db.execute(
        select(
            func.sum(Abastecimento.horas_trabalhadas),
            func.sum(Abastecimento.litros),
        ).where(Abastecimento.data_final >= data_inicio)
    )
    row = result.one()
    total_horas = float(row[0] or 0)
    total_litros = float(row[1] or 0)
    media_geral = round(total_litros / total_horas, 2) if total_horas > 0 else None

    maquinas_result = await db.execute(select(Maquina).where(Maquina.ativa == True))
    maquinas = maquinas_result.scalars().all()

    alertas = []
    for maquina in maquinas:
        ultima_manutencao_result = await db.execute(
            select(func.max(Manutencao.horimetro_na_manutencao))
            .where(
                and_(
                    Manutencao.maquina_id == maquina.id,
                    Manutencao.status == StatusManutencaoEnum.realizada,
                )
            )
        )
        ultimo_horimetro_manut = ultima_manutencao_result.scalar()

        if ultimo_horimetro_manut is not None:
            horimetro_atual = float(maquina.horimetro_atual or 0)
            limite = float(ultimo_horimetro_manut) + maquina.alerta_manutencao_horas
            if horimetro_atual >= limite:
                alertas.append(
                    MaquinaAlerta(
                        id=str(maquina.id),
                        nome=maquina.nome,
                        horas_vencidas=round(horimetro_atual - limite, 1),
                    )
                )

    consumo_por_maquina = []
    for maquina in maquinas:
        consumo_result = await db.execute(
            select(
                func.sum(Abastecimento.litros),
                func.sum(Abastecimento.horas_trabalhadas),
            ).where(
                and_(
                    Abastecimento.maquina_id == maquina.id,
                    Abastecimento.data_final >= data_inicio,
                )
            )
        )
        consumo_row = consumo_result.one()
        litros_maq = float(consumo_row[0] or 0)
        horas_maq = float(consumo_row[1] or 0)
        media_maq = round(litros_maq / horas_maq, 2) if horas_maq > 0 else None

        ultima_media_result = await db.execute(
            select(Abastecimento.media_lh)
            .where(Abastecimento.maquina_id == maquina.id)
            .order_by(Abastecimento.data_final.desc())
            .limit(1)
        )
        ultima_media_val = ultima_media_result.scalar()

        consumo_por_maquina.append(
            ConsumoMaquina(
                id=str(maquina.id),
                nome=maquina.nome,
                media_lh=media_maq,
                status=calcular_status_consumo(media_maq),
                ultima_media=float(ultima_media_val) if ultima_media_val else None,
                total_litros=litros_maq,
                total_horas=horas_maq,
            )
        )

    historico = []
    for i in range(5, -1, -1):
        mes_inicio = date.today().replace(day=1) - timedelta(days=i * 30)
        mes_fim = (mes_inicio.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        hist_result = await db.execute(
            select(
                func.sum(Abastecimento.litros),
                func.sum(Abastecimento.horas_trabalhadas),
            ).where(
                and_(
                    Abastecimento.data_final >= mes_inicio,
                    Abastecimento.data_final <= mes_fim,
                )
            )
        )
        hist_row = hist_result.one()
        lit = float(hist_row[0] or 0)
        hrs = float(hist_row[1] or 0)
        historico.append(
            HistoricoMensal(
                mes=mes_inicio.strftime("%b/%Y"),
                litros=lit,
                horas=hrs,
                media=round(lit / hrs, 2) if hrs > 0 else None,
            )
        )

    return DashboardResumo(
        total_maquinas_ativas=total_maquinas_ativas,
        total_horas_periodo=total_horas,
        total_litros_periodo=total_litros,
        media_geral_frota=media_geral,
        maquinas_em_alerta_manutencao=alertas,
        consumo_por_maquina=consumo_por_maquina,
        historico_consumo_mensal=historico,
    )
