from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.usuario import PerfilEnum


class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    perfil: PerfilEnum
    ativo: Optional[bool] = True


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    perfil: Optional[PerfilEnum] = None
    ativo: Optional[bool] = None
    senha: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    id: UUID
    criado_em: datetime

    model_config = {"from_attributes": True}
