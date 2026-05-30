from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user, require_perfil
from app.models.usuario import Usuario, PerfilEnum
from app.models.maquina import Maquina
from app.schemas.maquina import MaquinaCreate, MaquinaUpdate, MaquinaResponse

router = APIRouter()


@router.get("/", response_model=List[MaquinaResponse])
async def list_maquinas(
    ativa: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = select(Maquina).order_by(Maquina.nome)
    if ativa is not None:
        query = query.where(Maquina.ativa == ativa)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=MaquinaResponse, status_code=201)
async def create_maquina(
    data: MaquinaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin, PerfilEnum.gerente)),
):
    maquina = Maquina(**data.model_dump())
    db.add(maquina)
    await db.commit()
    await db.refresh(maquina)
    return maquina


@router.get("/{maquina_id}", response_model=MaquinaResponse)
async def get_maquina(
    maquina_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Maquina).where(Maquina.id == maquina_id))
    maquina = result.scalar_one_or_none()
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return maquina


@router.put("/{maquina_id}", response_model=MaquinaResponse)
async def update_maquina(
    maquina_id: UUID,
    data: MaquinaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin, PerfilEnum.gerente)),
):
    result = await db.execute(select(Maquina).where(Maquina.id == maquina_id))
    maquina = result.scalar_one_or_none()
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(maquina, key, value)
    maquina.atualizado_em = datetime.utcnow()

    await db.commit()
    await db.refresh(maquina)
    return maquina


@router.delete("/{maquina_id}", status_code=204)
async def delete_maquina(
    maquina_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin)),
):
    result = await db.execute(select(Maquina).where(Maquina.id == maquina_id))
    maquina = result.scalar_one_or_none()
    if not maquina:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    await db.delete(maquina)
    await db.commit()
