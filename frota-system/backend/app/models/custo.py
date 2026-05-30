import uuid
import enum
from sqlalchemy import Column, String, DateTime, Numeric, Date, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class TipoCustoEnum(str, enum.Enum):
    aluguel = "aluguel"
    peca = "peca"
    mao_de_obra = "mao_de_obra"
    outro = "outro"


class Custo(Base):
    __tablename__ = "custos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    maquina_id = Column(UUID(as_uuid=True), ForeignKey("maquinas.id"), nullable=False)
    tipo = Column(Enum(TipoCustoEnum, name="tipo_custo_enum"), nullable=False)
    descricao = Column(String(255))
    valor = Column(Numeric(10, 2), nullable=False)
    data = Column(Date, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    maquina = relationship("Maquina", back_populates="custos")
