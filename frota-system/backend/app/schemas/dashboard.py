from pydantic import BaseModel
from typing import List, Optional


class MaquinaAlerta(BaseModel):
    id: str
    nome: str
    horas_vencidas: float


class ConsumoMaquina(BaseModel):
    id: str
    nome: str
    media_lh: Optional[float] = None
    status: str
    ultima_media: Optional[float] = None
    total_litros: Optional[float] = None
    total_horas: Optional[float] = None


class HistoricoMensal(BaseModel):
    mes: str
    litros: float
    horas: float
    media: Optional[float] = None


class DashboardResumo(BaseModel):
    total_maquinas_ativas: int
    total_horas_periodo: float
    total_litros_periodo: float
    media_geral_frota: Optional[float]
    maquinas_em_alerta_manutencao: List[MaquinaAlerta]
    consumo_por_maquina: List[ConsumoMaquina]
    historico_consumo_mensal: List[HistoricoMensal]
