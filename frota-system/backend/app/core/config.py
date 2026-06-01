from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def get_allowed_origins(self) -> List[str]:
        """
        Aceita qualquer formato:
        - "*"
        - "https://meusite.com"
        - "https://site1.com,https://site2.com"
        - '["https://site1.com","https://site2.com"]'
        """
        value = self.ALLOWED_ORIGINS.strip()
        # Tenta JSON primeiro
        if value.startswith("["):
            try:
                return json.loads(value)
            except Exception:
                pass
        # Senão, separa por vírgula
        return [v.strip() for v in value.split(",") if v.strip()]


settings = Settings()
