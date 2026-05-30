import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Operador(Base):
    __tablename__ = "operadores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False)
    cpf = Column(String(14))
    telefone = Column(String(20))
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    maquinas = relationship("OperadorMaquina", back_populates="operador")


class OperadorMaquina(Base):
    __tablename__ = "operador_maquina"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operador_id = Column(UUID(as_uuid=True), ForeignKey("operadores.id"), nullable=False)
    maquina_id = Column(UUID(as_uuid=True), ForeignKey("maquinas.id"), nullable=False)
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date)
    horas_trabalhadas = Column(Numeric(8, 1))
    observacao = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)

    operador = relationship("Operador", back_populates="maquinas")
    maquina = relationship("Maquina", back_populates="operadores_maquina")
