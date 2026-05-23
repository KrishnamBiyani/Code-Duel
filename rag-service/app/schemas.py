from typing import Any

from pydantic import BaseModel, Field


class IngestRequest(BaseModel):
  text: str = Field(min_length=1)
  metadata: dict[str, Any] = Field(default_factory=dict)


class ChatRequest(BaseModel):
  message: str = Field(min_length=1)
  questionTitle: str = Field(min_length=1)
  questionDescription: str = Field(min_length=1)


class IngestResponse(BaseModel):
  status: str
  chunksStored: int
  namespace: str


class SourceChunk(BaseModel):
  id: str
  score: float
  text: str
  metadata: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
  answer: str
  sources: list[SourceChunk]
