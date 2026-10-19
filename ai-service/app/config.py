from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="LISAN_AI_", env_file=".env", extra="ignore")

    sample_rate: int = 16_000
    max_seconds: float = 6.0
    model_path: Path = ROOT / "models" / "sibilant_classifier.pt"
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"


settings = Settings()
