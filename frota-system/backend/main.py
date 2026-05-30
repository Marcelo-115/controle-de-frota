from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.routes import auth, maquinas, abastecimentos, manutencoes, operadores, relatorios, dashboard, usuarios

app = FastAPI(
    title="Sistema de Gestão de Frota",
    version="1.0.0",
    description="Sistema para gestão de máquinas pesadas",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(maquinas.router, prefix="/api/v1/maquinas", tags=["maquinas"])
app.include_router(abastecimentos.router, prefix="/api/v1/abastecimentos", tags=["abastecimentos"])
app.include_router(manutencoes.router, prefix="/api/v1/manutencoes", tags=["manutencoes"])
app.include_router(operadores.router, prefix="/api/v1/operadores", tags=["operadores"])
app.include_router(relatorios.router, prefix="/api/v1/relatorios", tags=["relatorios"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(usuarios.router, prefix="/api/v1/usuarios", tags=["usuarios"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
