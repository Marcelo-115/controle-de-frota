from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal


class AbastecimentoBase(BaseModel):
    maquina_id: UUID
    data_inicial: date
    horimetro_inicial: Decimal
    data_final: date
    horimetro_final: Decimal
    litros: Decimal
    observacao: Optional[str] = None


class AbastecimentoCreate(AbastecimentoBase):
    pass


class AbastecimentoUpdate(BaseModel):
    data_inicial: Optional[date] = None
    horimetro_inicial: Optional[Decimal] = None
    data_final: Optional[date] = None
    horimetro_final: Optional[Decimal] = None
    litros: Optional[Decimal] = None
    observacao: Optional[str] = None


class AbastecimentoResponse(AbastecimentoBase):
    id: UUID
    usuario_id: UUID
    horas_trabalhadas: Optional[Decimal] = None
    media_lh: Optional[Decimal] = None
    criado_em: datetime

    model_config = {"from_attributes": True}


class AbastecimentoComMaquina(AbastecimentoResponse):
    maquina_nome: Optional[str] = None
