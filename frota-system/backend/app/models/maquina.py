import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Maquina(Base):
    __tablename__ = "maquinas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False)
    tipo = Column(String(50))
    localizacao = Column(String(100))
    ano_fabricacao = Column(Integer)
    placa_ou_serie = Column(String(50))
    horimetro_atual = Column(Numeric(10, 1), default=0)
    ativa = Column(Boolean, default=True)
    alerta_manutencao_horas = Column(Integer, default=250)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    abastecimentos = relationship("Abastecimento", back_populates="maquina", cascade="all, delete-orphan")
    manutencoes = relationship("Manutencao", back_populates="maquina", cascade="all, delete-orphan")
    operadores_maquina = relationship("OperadorMaquina", back_populates="maquina")
    custos = relationship("Custo", back_populates="maquina")
