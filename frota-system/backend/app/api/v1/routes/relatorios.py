from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import Optional, List
from uuid import UUID
from datetime import date, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user, require_perfil
from app.models.usuario import Usuario, PerfilEnum
from app.models.maquina import Maquina
from app.models.abastecimento import Abastecimento
from app.services.relatorio import gerar_excel, gerar_pdf

router = APIRouter()

PERFIS_RELATORIO = (PerfilEnum.admin, PerfilEnum.gerente, PerfilEnum.diretoria)


async def _montar_dados_relatorio(db: AsyncSession, maquina_ids: Optional[List[UUID]], data_inicio: date, data_fim: date):
    query_maquinas = select(Maquina).where(Maquina.ativa == True)
    if maquina_ids:
        query_maquinas = query_maquinas.where(Maquina.id.in_(maquina_ids))
    maquinas_result = await db.execute(query_maquinas)
    maquinas = maquinas_result.scalars().all()

    maquinas_dados = []
    total_litros = 0
    total_horas = 0

    for maquina in maquinas:
        result = await db.execute(
            select(
                func.sum(Abastecimento.litros),
                func.sum(Abastecimento.horas_trabalhadas),
                func.count(Abastecimento.id),
            ).where(
                and_(
                    Abastecimento.maquina_id == maquina.id,
                    Abastecimento.data_final >= data_inicio,
                    Abastecimento.data_final <= data_fim,
                )
            )
        )
        row = result.one()
        litros = float(row[0] or 0)
        horas = float(row[1] or 0)
        qtd = int(row[2] or 0)
        media = round(litros / horas, 2) if horas > 0 else None

        status = "sem_dados"
        if media is not None:
            if media < 3.0:
                status = "Econômico"
            elif media <= 4.0:
                status = "Normal"
            else:
                status = "Alto"

        total_litros += litros
        total_horas += horas

        maquinas_dados.append({
            "nome": maquina.nome,
            "tipo": maquina.tipo or "-",
            "horas": horas,
            "litros": litros,
            "media": media,
            "status": status,
            "qtd_abastecimentos": qtd,
        })

    return {
        "periodo": f"{data_inicio.strftime('%d/%m/%Y')} a {data_fim.strftime('%d/%m/%Y')}",
        "total_maquinas": len(maquinas),
        "total_horas": total_horas,
        "total_litros": total_litros,
        "media_geral": round(total_litros / total_horas, 2) if total_horas > 0 else 0,
        "maquinas": maquinas_dados,
    }


@router.get("/excel")
async def exportar_excel(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    maquina_ids: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(*PERFIS_RELATORIO)),
):
    if not data_inicio:
        data_inicio = date.today() - timedelta(days=30)
    if not data_fim:
        data_fim = date.today()

    ids_list = None
    if maquina_ids:
        try:
            ids_list = [UUID(uid.strip()) for uid in maquina_ids.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="IDs de máquinas inválidos")

    dados = await _montar_dados_relatorio(db, ids_list, data_inicio, data_fim)
    excel_bytes = gerar_excel(dados)

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=relatorio_frota_{data_fim}.xlsx"},
    )


@router.get("/pdf")
async def exportar_pdf(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    maquina_ids: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(*PERFIS_RELATORIO)),
):
    if not data_inicio:
        data_inicio = date.today() - timedelta(days=30)
    if not data_fim:
        data_fim = date.today()

    ids_list = None
    if maquina_ids:
        try:
            ids_list = [UUID(uid.strip()) for uid in maquina_ids.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="IDs de máquinas inválidos")

    dados = await _montar_dados_relatorio(db, ids_list, data_inicio, data_fim)
    pdf_bytes = gerar_pdf(dados)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=relatorio_frota_{data_fim}.pdf"},
    )


@router.get("/preview")
async def preview_relatorio(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    maquina_ids: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(*PERFIS_RELATORIO)),
):
    if not data_inicio:
        data_inicio = date.today() - timedelta(days=30)
    if not data_fim:
        data_fim = date.today()

    ids_list = None
    if maquina_ids:
        try:
            ids_list = [UUID(uid.strip()) for uid in maquina_ids.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="IDs de máquinas inválidos")

    return await _montar_dados_relatorio(db, ids_list, data_inicio, data_fim)
