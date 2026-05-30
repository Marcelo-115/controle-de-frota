import uuid
import enum
from sqlalchemy import Column, DateTime, Numeric, Date, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class TipoManutencaoEnum(str, enum.Enum):
    preventiva = "preventiva"
    corretiva = "corretiva"
    revisao = "revisao"


class StatusManutencaoEnum(str, enum.Enum):
    pendente = "pendente"
    realizada = "realizada"
    cancelada = "cancelada"


class Manutencao(Base):
    __tablename__ = "manutencoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    maquina_id = Column(UUID(as_uuid=True), ForeignKey("maquinas.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(Enum(TipoManutencaoEnum, name="tipo_manutencao_enum"), nullable=False)
    descricao = Column(Text, nullable=False)
    horimetro_na_manutencao = Column(Numeric(10, 1))
    data_realizada = Column(Date)
    data_prevista = Column(Date)
    custo = Column(Numeric(10, 2))
    pecas_substituidas = Column(Text)
    status = Column(
        Enum(StatusManutencaoEnum, name="status_manutencao_enum"),
        default=StatusManutencaoEnum.pendente,
    )
    criado_em = Column(DateTime, default=datetime.utcnow)

    maquina = relationship("Maquina", back_populates="manutencoes")
    usuario = relationship("Usuario", back_populates="manutencoes")
