import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()


class Settings(BaseModel):
    gemini_api_key: str = Field(alias="GEMINI_API_KEY")
    pinecone_api_key: str = Field(alias="PINECONE_API_KEY")
    pinecone_index_name: str = Field(alias="PINECONE_INDEX_NAME")
    llm_model: str = "gemini-2.5-flash"
    embedding_model: str = "gemini-embedding-2"
    embedding_dimensions: int = 768
    chunk_size: int = 1200
    chunk_overlap: int = 200
    top_k: int = 5
    namespace: str = "default"


@lru_cache
def get_settings() -> Settings:
    return Settings(
        GEMINI_API_KEY=os.getenv("GEMINI_API_KEY", ""),
        PINECONE_API_KEY=os.getenv("PINECONE_API_KEY", ""),
        PINECONE_INDEX_NAME=os.getenv("PINECONE_INDEX_NAME", ""),
    )


def validate_settings(settings: Settings) -> None:
    missing = []

    if not settings.gemini_api_key:
        missing.append("GEMINI_API_KEY")
    if not settings.pinecone_api_key:
        missing.append("PINECONE_API_KEY")
    if not settings.pinecone_index_name:
        missing.append("PINECONE_INDEX_NAME")

    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
