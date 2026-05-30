from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from app.core.database import get_db
from app.api.deps import get_current_user, require_perfil
from app.models.usuario import Usuario, PerfilEnum
from app.models.manutencao import Manutencao, StatusManutencaoEnum
from app.schemas.manutencao import ManutencaoCreate, ManutencaoUpdate, ManutencaoResponse

router = APIRouter()


@router.get("/", response_model=List[ManutencaoResponse])
async def list_manutencoes(
    maquina_id: Optional[UUID] = None,
    status: Optional[StatusManutencaoEnum] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = select(Manutencao).order_by(Manutencao.criado_em.desc())
    if maquina_id:
        query = query.where(Manutencao.maquina_id == maquina_id)
    if status:
        query = query.where(Manutencao.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ManutencaoResponse, status_code=201)
async def create_manutencao(
    data: ManutencaoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.perfil == PerfilEnum.diretoria:
        raise HTTPException(status_code=403, detail="Sem permissão para registrar manutenções")

    manutencao = Manutencao(**data.model_dump(), usuario_id=current_user.id)
    db.add(manutencao)
    await db.commit()
    await db.refresh(manutencao)
    return manutencao


@router.get("/{manutencao_id}", response_model=ManutencaoResponse)
async def get_manutencao(
    manutencao_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Manutencao).where(Manutencao.id == manutencao_id))
    manutencao = result.scalar_one_or_none()
    if not manutencao:
        raise HTTPException(status_code=404, detail="Manutenção não encontrada")
    return manutencao


@router.put("/{manutencao_id}", response_model=ManutencaoResponse)
async def update_manutencao(
    manutencao_id: UUID,
    data: ManutencaoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.perfil == PerfilEnum.diretoria:
        raise HTTPException(status_code=403, detail="Sem permissão")

    result = await db.execute(select(Manutencao).where(Manutencao.id == manutencao_id))
    manutencao = result.scalar_one_or_none()
    if not manutencao:
        raise HTTPException(status_code=404, detail="Manutenção não encontrada")

    if current_user.perfil == PerfilEnum.mecanico and manutencao.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Mecânico só pode editar suas próprias manutenções")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(manutencao, key, value)

    await db.commit()
    await db.refresh(manutencao)
    return manutencao


@router.delete("/{manutencao_id}", status_code=204)
async def delete_manutencao(
    manutencao_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin, PerfilEnum.gerente)),
):
    result = await db.execute(select(Manutencao).where(Manutencao.id == manutencao_id))
    manutencao = result.scalar_one_or_none()
    if not manutencao:
        raise HTTPException(status_code=404, detail="Manutenção não encontrada")
    await db.delete(manutencao)
    await db.commit()
