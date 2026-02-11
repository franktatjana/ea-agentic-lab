"""
Configuration for EA Agentic Lab API
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """API Settings"""

    # API
    api_title: str = "EA Agentic Lab API"
    api_version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    debug: bool = True

    # Paths
    # __file__ = application/src/api/config.py
    # .parent = api, .parent.parent = src, .parent.parent.parent = application, .parent*4 = ea-agentic-lab
    project_root: Path = Path(__file__).parent.parent.parent.parent  # ea-agentic-lab/
    vault_path: Path = project_root / "vault"
    domain_path: Path = project_root / "domain"
    config_path: Path = project_root / "domain" / "config"
    user_profiles_path: Path = config_path / "user_profiles"

    # Authentication
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # CORS
    cors_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
