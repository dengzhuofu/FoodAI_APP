from pydantic_settings import BaseSettings
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SILICONFLOW_API_KEY: str
    SILICONFLOW_BASE_URL: str

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"
    
    @property
    def TORTOISE_ORM(self) -> Dict[str, Any]:
        return {
            "connections": {"default": self.DATABASE_URL},
            "apps": {
                "models": {
                    "models": [
                        "aerich.models", 
                        "app.models.users",
                        "app.models.recipes",
                        "app.models.restaurants",
                        "app.models.inventory",
                        "app.models.ai_logs",
                        "app.models.notifications"
                    ],
                    "default_connection": "default",
                },
            },
        }

settings = Settings()
