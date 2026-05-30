import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import date
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.usuario import Usuario, PerfilEnum
from app.models.maquina import Maquina
from app.models.abastecimento import Abastecimento


async def seed():
    async with AsyncSessionLocal() as db:
        print("Inserindo usuários...")
        admin = Usuario(
            nome="Administrador",
            email="admin@frota.com",
            senha_hash=get_password_hash("Admin@123"),
            perfil=PerfilEnum.admin,
            ativo=True,
        )
        mecanico = Usuario(
            nome="Mecânico",
            email="mecanico@frota.com",
            senha_hash=get_password_hash("Mec@123"),
            perfil=PerfilEnum.mecanico,
            ativo=True,
        )
        gerente = Usuario(
            nome="Gerente",
            email="gerente@frota.com",
            senha_hash=get_password_hash("Ger@123"),
            perfil=PerfilEnum.gerente,
            ativo=True,
        )
        db.add_all([admin, mecanico, gerente])
        await db.flush()

        print("Inserindo máquinas...")
        trator_samambaia = Maquina(
            nome="Trator Samambaia",
            tipo="Trator",
            localizacao="Samambaia",
            horimetro_atual=16.7,
            alerta_manutencao_horas=250,
            ativa=True,
        )
        trator_vp = Maquina(
            nome="Trator Vicente Pires",
            tipo="Trator",
            localizacao="Vicente Pires",
            horimetro_atual=12.2,
            alerta_manutencao_horas=250,
            ativa=True,
        )
        bob_cat = Maquina(
            nome="Bob Cat",
            tipo="Bob Cat",
            localizacao="Alugada",
            horimetro_atual=7301.0,
            alerta_manutencao_horas=250,
            ativa=True,
        )
        db.add_all([trator_samambaia, trator_vp, bob_cat])
        await db.flush()

        print("Inserindo abastecimentos...")
        abast1 = Abastecimento(
            maquina_id=trator_samambaia.id,
            usuario_id=admin.id,
            data_inicial=date(2026, 5, 21),
            horimetro_inicial=6.0,
            data_final=date(2026, 5, 26),
            horimetro_final=16.7,
            litros=39,
            observacao="Abastecimento inicial - Trator Samambaia",
        )
        abast2 = Abastecimento(
            maquina_id=trator_vp.id,
            usuario_id=admin.id,
            data_inicial=date(2026, 5, 21),
            horimetro_inicial=6.6,
            data_final=date(2026, 5, 26),
            horimetro_final=12.2,
            litros=17,
            observacao="Abastecimento inicial - Trator Vicente Pires",
        )
        abast3 = Abastecimento(
            maquina_id=bob_cat.id,
            usuario_id=admin.id,
            data_inicial=date(2026, 5, 21),
            horimetro_inicial=7281.1,
            data_final=date(2026, 5, 26),
            horimetro_final=7301.0,
            litros=72,
            observacao="Abastecimento inicial - Bob Cat (Alugada)",
        )
        db.add_all([abast1, abast2, abast3])
        await db.commit()

        print("\n✓ Seed concluído com sucesso!")
        print("\nCredenciais criadas:")
        print("  Admin:   admin@frota.com   / Admin@123")
        print("  Mecânico: mecanico@frota.com / Mec@123")
        print("  Gerente:  gerente@frota.com  / Ger@123")


if __name__ == "__main__":
    asyncio.run(seed())
