from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal


class OperadorBase(BaseModel):
    nome: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    ativo: Optional[bool] = True


class OperadorCreate(OperadorBase):
    pass


class OperadorUpdate(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    ativo: Optional[bool] = None


class OperadorResponse(OperadorBase):
    id: UUID
    criado_em: datetime

    model_config = {"from_attributes": True}


class OperadorMaquinaBase(BaseModel):
    operador_id: UUID
    maquina_id: UUID
    data_inicio: date
    data_fim: Optional[date] = None
    horas_trabalhadas: Optional[Decimal] = None
    observacao: Optional[str] = None


class OperadorMaquinaCreate(OperadorMaquinaBase):
    pass


class OperadorMaquinaResponse(OperadorMaquinaBase):
    id: UUID
    criado_em: datetime

    model_config = {"from_attributes": True}
