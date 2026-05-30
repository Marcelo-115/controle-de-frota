from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal
from app.models.manutencao import TipoManutencaoEnum, StatusManutencaoEnum


class ManutencaoBase(BaseModel):
    maquina_id: UUID
    tipo: TipoManutencaoEnum
    descricao: str
    horimetro_na_manutencao: Optional[Decimal] = None
    data_realizada: Optional[date] = None
    data_prevista: Optional[date] = None
    custo: Optional[Decimal] = None
    pecas_substituidas: Optional[str] = None
    status: Optional[StatusManutencaoEnum] = StatusManutencaoEnum.pendente


class ManutencaoCreate(ManutencaoBase):
    pass


class ManutencaoUpdate(BaseModel):
    tipo: Optional[TipoManutencaoEnum] = None
    descricao: Optional[str] = None
    horimetro_na_manutencao: Optional[Decimal] = None
    data_realizada: Optional[date] = None
    data_prevista: Optional[date] = None
    custo: Optional[Decimal] = None
    pecas_substituidas: Optional[str] = None
    status: Optional[StatusManutencaoEnum] = None


class ManutencaoResponse(ManutencaoBase):
    id: UUID
    usuario_id: UUID
    criado_em: datetime

    model_config = {"from_attributes": True}
