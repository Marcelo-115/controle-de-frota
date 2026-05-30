from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.deps import require_perfil
from app.models.usuario import Usuario, PerfilEnum
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse

router = APIRouter()


@router.get("/", response_model=List[UsuarioResponse])
async def list_usuarios(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin)),
):
    result = await db.execute(select(Usuario).order_by(Usuario.nome))
    return result.scalars().all()


@router.post("/", response_model=UsuarioResponse, status_code=201)
async def create_usuario(
    data: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin)),
):
    result = await db.execute(select(Usuario).where(Usuario.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    usuario = Usuario(
        nome=data.nome,
        email=data.email,
        perfil=data.perfil,
        ativo=data.ativo,
        senha_hash=get_password_hash(data.senha),
    )
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario


@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def get_usuario(
    usuario_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin)),
):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
async def update_usuario(
    usuario_id: UUID,
    data: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin)),
):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if "senha" in update_data:
        update_data["senha_hash"] = get_password_hash(update_data.pop("senha"))

    for key, value in update_data.items():
        setattr(usuario, key, value)
    usuario.atualizado_em = datetime.utcnow()

    await db.commit()
    await db.refresh(usuario)
    return usuario


@router.patch("/{usuario_id}/toggle-ativo", response_model=UsuarioResponse)
async def toggle_ativo(
    usuario_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_perfil(PerfilEnum.admin)),
):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="Não é possível desativar a si mesmo")

    usuario.ativo = not usuario.ativo
    usuario.atualizado_em = datetime.utcnow()
    await db.commit()
    await db.refresh(usuario)
    return usuario
