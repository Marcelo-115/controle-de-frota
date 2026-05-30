from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.usuario import Usuario, PerfilEnum
from app.models.maquina import Maquina
from app.models.abastecimento import Abastecimento
from app.schemas.abastecimento import AbastecimentoCreate, AbastecimentoUpdate, AbastecimentoResponse

router = APIRouter()


@router.get("/", response_model=List[AbastecimentoResponse])
async def list_abastecimentos(
    maquina_id: Optional[UUID] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = select(Abastecimento).order_by(Abastecimento.data_final.desc())
    if maquina_id:
        query = query.where(Abastecimento.maquina_id == maquina_id)
    if data_inicio:
        query = query.where(Abastecimento.data_final >= data_inicio)
    if data_fim:
        query = query.where(Abastecimento.data_final <= data_fim)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=AbastecimentoResponse, status_code=201)
async def create_abastecimento(
    data: AbastecimentoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.perfil == PerfilEnum.diretoria:
        raise HTTPException(status_code=403, detail="Sem permissão para registrar abastecimentos")

    result = await db.execute(select(Maquina).where(Maquina.id == data.maquina_id))
    maquina = result.scalar_one_or_none()
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")

    if data.horimetro_final <= data.horimetro_inicial:
        raise HTTPException(status_code=400, detail="Horímetro final deve ser maior que o inicial")

    abastecimento = Abastecimento(**data.model_dump(), usuario_id=current_user.id)
    db.add(abastecimento)

    if float(data.horimetro_final) > float(maquina.horimetro_atual):
        maquina.horimetro_atual = data.horimetro_final
        maquina.atualizado_em = datetime.utcnow()

    await db.commit()
    await db.refresh(abastecimento)
    return abastecimento


@router.get("/{abastecimento_id}", response_model=AbastecimentoResponse)
async def get_abastecimento(
    abastecimento_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Abastecimento).where(Abastecimento.id == abastecimento_id))
    abastecimento = result.scalar_one_or_none()
    if not abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")
    return abastecimento


@router.put("/{abastecimento_id}", response_model=AbastecimentoResponse)
async def update_abastecimento(
    abastecimento_id: UUID,
    data: AbastecimentoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.perfil == PerfilEnum.diretoria:
        raise HTTPException(status_code=403, detail="Sem permissão")

    result = await db.execute(select(Abastecimento).where(Abastecimento.id == abastecimento_id))
    abastecimento = result.scalar_one_or_none()
    if not abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")

    if current_user.perfil == PerfilEnum.mecanico and abastecimento.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Mecânico só pode editar seus próprios registros")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(abastecimento, key, value)

    await db.commit()
    await db.refresh(abastecimento)
    return abastecimento


@router.delete("/{abastecimento_id}", status_code=204)
async def delete_abastecimento(
    abastecimento_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.perfil not in [PerfilEnum.admin, PerfilEnum.gerente]:
        raise HTTPException(status_code=403, detail="Sem permissão")

    result = await db.execute(select(Abastecimento).where(Abastecimento.id == abastecimento_id))
    abastecimento = result.scalar_one_or_none()
    if not abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")

    await db.delete(abastecimento)
    await db.commit()
