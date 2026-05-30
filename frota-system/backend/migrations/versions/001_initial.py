"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-27

"""
from typing import Sequence, Union
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TYPE perfil_enum AS ENUM ('admin', 'mecanico', 'gerente', 'diretoria');
        CREATE TYPE tipo_manutencao_enum AS ENUM ('preventiva', 'corretiva', 'revisao');
        CREATE TYPE status_manutencao_enum AS ENUM ('pendente', 'realizada', 'cancelada');
        CREATE TYPE tipo_custo_enum AS ENUM ('aluguel', 'peca', 'mao_de_obra', 'outro');
    """)

    op.execute("""
        CREATE TABLE usuarios (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            perfil perfil_enum NOT NULL,
            ativo BOOLEAN DEFAULT true,
            criado_em TIMESTAMP DEFAULT now(),
            atualizado_em TIMESTAMP DEFAULT now()
        );
    """)

    op.execute("""
        CREATE TABLE maquinas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nome VARCHAR(100) NOT NULL,
            tipo VARCHAR(50),
            localizacao VARCHAR(100),
            ano_fabricacao INT,
            placa_ou_serie VARCHAR(50),
            horimetro_atual DECIMAL(10,1) DEFAULT 0,
            ativa BOOLEAN DEFAULT true,
            alerta_manutencao_horas INT DEFAULT 250,
            criado_em TIMESTAMP DEFAULT now(),
            atualizado_em TIMESTAMP DEFAULT now()
        );
    """)

    op.execute("""
        CREATE TABLE operadores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nome VARCHAR(100) NOT NULL,
            cpf VARCHAR(14),
            telefone VARCHAR(20),
            ativo BOOLEAN DEFAULT true,
            criado_em TIMESTAMP DEFAULT now()
        );
    """)

    op.execute("""
        CREATE TABLE abastecimentos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            maquina_id UUID NOT NULL REFERENCES maquinas(id) ON DELETE CASCADE,
            usuario_id UUID NOT NULL REFERENCES usuarios(id),
            data_inicial DATE NOT NULL,
            horimetro_inicial DECIMAL(10,1) NOT NULL,
            data_final DATE NOT NULL,
            horimetro_final DECIMAL(10,1) NOT NULL,
            litros DECIMAL(8,2) NOT NULL,
            horas_trabalhadas DECIMAL(8,1) GENERATED ALWAYS AS (horimetro_final - horimetro_inicial) STORED,
            media_lh DECIMAL(6,2) GENERATED ALWAYS AS (litros / NULLIF(horimetro_final - horimetro_inicial, 0)) STORED,
            observacao TEXT,
            criado_em TIMESTAMP DEFAULT now()
        );
    """)

    op.execute("""
        CREATE TABLE manutencoes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            maquina_id UUID NOT NULL REFERENCES maquinas(id) ON DELETE CASCADE,
            usuario_id UUID NOT NULL REFERENCES usuarios(id),
            tipo tipo_manutencao_enum NOT NULL,
            descricao TEXT NOT NULL,
            horimetro_na_manutencao DECIMAL(10,1),
            data_realizada DATE,
            data_prevista DATE,
            custo DECIMAL(10,2),
            pecas_substituidas TEXT,
            status status_manutencao_enum DEFAULT 'pendente',
            criado_em TIMESTAMP DEFAULT now()
        );
    """)

    op.execute("""
        CREATE TABLE operador_maquina (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            operador_id UUID NOT NULL REFERENCES operadores(id),
            maquina_id UUID NOT NULL REFERENCES maquinas(id),
            data_inicio DATE NOT NULL,
            data_fim DATE,
            horas_trabalhadas DECIMAL(8,1),
            observacao TEXT,
            criado_em TIMESTAMP DEFAULT now()
        );
    """)

    op.execute("""
        CREATE TABLE custos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            maquina_id UUID NOT NULL REFERENCES maquinas(id),
            tipo tipo_custo_enum NOT NULL,
            descricao VARCHAR(255),
            valor DECIMAL(10,2) NOT NULL,
            data DATE NOT NULL,
            criado_em TIMESTAMP DEFAULT now()
        );
    """)

    op.execute("""
        CREATE INDEX idx_abastecimentos_maquina ON abastecimentos(maquina_id);
        CREATE INDEX idx_abastecimentos_data ON abastecimentos(data_final);
        CREATE INDEX idx_manutencoes_maquina ON manutencoes(maquina_id);
        CREATE INDEX idx_manutencoes_status ON manutencoes(status);
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS custos;
        DROP TABLE IF EXISTS operador_maquina;
        DROP TABLE IF EXISTS manutencoes;
        DROP TABLE IF EXISTS abastecimentos;
        DROP TABLE IF EXISTS operadores;
        DROP TABLE IF EXISTS maquinas;
        DROP TABLE IF EXISTS usuarios;
        DROP TYPE IF EXISTS tipo_custo_enum;
        DROP TYPE IF EXISTS status_manutencao_enum;
        DROP TYPE IF EXISTS tipo_manutencao_enum;
        DROP TYPE IF EXISTS perfil_enum;
    """)
