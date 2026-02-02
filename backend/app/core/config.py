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

    # Tencent COS Configuration
    TENCENT_COS_SECRET_ID: str = ""
    TENCENT_COS_SECRET_KEY: str = ""
    TENCENT_COS_REGION: str = ""
    TENCENT_COS_BUCKET: str = ""
    
    # Amap Configuration
    AMAP_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"
        # Environment variables take precedence over .env file
        case_sensitive = True
    
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
                        "app.models.notifications",
                        "app.models.search",
                        "app.models.chat",
                        "app.models.direct_chat"
                    ],
                    "default_connection": "default",
                },
            },
        }

settings = Settings()
