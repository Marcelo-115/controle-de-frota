from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from app.core.database import get_db
from app.api.deps import get_current_user, require_perfil
from app.models.usuario import Usuario, PerfilEnum
from app.models.operador import Operador, OperadorMaquina
from app.schemas.operador import (
    OperadorCreate, OperadorUpdate, OperadorResponse,
    OperadorMaquinaCreate, OperadorMaquinaResponse,
)

router = APIRouter()


@router.get("/", response_model=List[OperadorResponse])
async def list_operadores(
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = select(Operador).order_by(Operador.nome)
    if ativo is not None:
        query = query.where(Operador.ativo == ativo)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=OperadorResponse, status_code=201)
async def create_operador(
    data: OperadorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin, PerfilEnum.gerente)),
):
    operador = Operador(**data.model_dump())
    db.add(operador)
    await db.commit()
    await db.refresh(operador)
    return operador


@router.get("/{operador_id}", response_model=OperadorResponse)
async def get_operador(
    operador_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Operador).where(Operador.id == operador_id))
    operador = result.scalar_one_or_none()
    if not operador:
        raise HTTPException(status_code=404, detail="Operador não encontrado")
    return operador


@router.put("/{operador_id}", response_model=OperadorResponse)
async def update_operador(
    operador_id: UUID,
    data: OperadorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin, PerfilEnum.gerente)),
):
    result = await db.execute(select(Operador).where(Operador.id == operador_id))
    operador = result.scalar_one_or_none()
    if not operador:
        raise HTTPException(status_code=404, detail="Operador não encontrado")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(operador, key, value)

    await db.commit()
    await db.refresh(operador)
    return operador


@router.delete("/{operador_id}", status_code=204)
async def delete_operador(
    operador_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin)),
):
    result = await db.execute(select(Operador).where(Operador.id == operador_id))
    operador = result.scalar_one_or_none()
    if not operador:
        raise HTTPException(status_code=404, detail="Operador não encontrado")
    await db.delete(operador)
    await db.commit()


@router.post("/alocacoes/", response_model=OperadorMaquinaResponse, status_code=201)
async def create_alocacao(
    data: OperadorMaquinaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin, PerfilEnum.gerente)),
):
    alocacao = OperadorMaquina(**data.model_dump())
    db.add(alocacao)
    await db.commit()
    await db.refresh(alocacao)
    return alocacao


@router.get("/alocacoes/", response_model=List[OperadorMaquinaResponse])
async def list_alocacoes(
    operador_id: Optional[UUID] = None,
    maquina_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = select(OperadorMaquina).order_by(OperadorMaquina.data_inicio.desc())
    if operador_id:
        query = query.where(OperadorMaquina.operador_id == operador_id)
    if maquina_id:
        query = query.where(OperadorMaquina.maquina_id == maquina_id)
    result = await db.execute(query)
    return result.scalars().all()
