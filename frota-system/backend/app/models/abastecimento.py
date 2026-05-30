import uuid
from sqlalchemy import Column, String, DateTime, Numeric, Date, ForeignKey, Text, Computed
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Abastecimento(Base):
    __tablename__ = "abastecimentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    maquina_id = Column(UUID(as_uuid=True), ForeignKey("maquinas.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    data_inicial = Column(Date, nullable=False)
    horimetro_inicial = Column(Numeric(10, 1), nullable=False)
    data_final = Column(Date, nullable=False)
    horimetro_final = Column(Numeric(10, 1), nullable=False)
    litros = Column(Numeric(8, 2), nullable=False)
    horas_trabalhadas = Column(
        Numeric(8, 1),
        Computed("horimetro_final - horimetro_inicial", persisted=True),
    )
    media_lh = Column(
        Numeric(6, 2),
        Computed("litros / NULLIF(horimetro_final - horimetro_inicial, 0)", persisted=True),
    )
    observacao = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)

    maquina = relationship("Maquina", back_populates="abastecimentos")
    usuario = relationship("Usuario", back_populates="abastecimentos")
