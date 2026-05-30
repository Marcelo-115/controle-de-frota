from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class MaquinaBase(BaseModel):
    nome: str
    tipo: Optional[str] = None
    localizacao: Optional[str] = None
    ano_fabricacao: Optional[int] = None
    placa_ou_serie: Optional[str] = None
    alerta_manutencao_horas: Optional[int] = 250
    ativa: Optional[bool] = True


class MaquinaCreate(MaquinaBase):
    horimetro_atual: Optional[Decimal] = Decimal("0")


class MaquinaUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    localizacao: Optional[str] = None
    ano_fabricacao: Optional[int] = None
    placa_ou_serie: Optional[str] = None
    horimetro_atual: Optional[Decimal] = None
    alerta_manutencao_horas: Optional[int] = None
    ativa: Optional[bool] = None


class MaquinaResponse(MaquinaBase):
    id: UUID
    horimetro_atual: Decimal
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}
