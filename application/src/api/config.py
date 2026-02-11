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
    debug: bool = False

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

    # CORS (env var: comma-separated string, e.g. "https://a.com,https://b.com")
    cors_origins: str = "http://localhost:3000"

    def get_cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def is_production(self) -> bool:
        return not self.debug

    def validate_production(self) -> None:
        if self.is_production() and self.secret_key == "dev-secret-key-change-in-production":
            raise ValueError("SECRET_KEY must be changed from default in production (set DEBUG=false)")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
