import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/vendorbridge"
    JWT_SECRET_KEY: str = "supersecretkey"
    JWT_REFRESH_SECRET_KEY: str = "superrefreshsecretkey"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SMTP_SERVER: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")

settings = Settings()
