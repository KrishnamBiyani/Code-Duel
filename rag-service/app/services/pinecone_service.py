import uuid
from typing import Any

from pinecone import Pinecone

from app.config import get_settings

settings = get_settings()
pc = Pinecone(api_key=settings.pinecone_api_key)
index = pc.Index(settings.pinecone_index_name)


def upsert_chunks(
  *,
  chunks: list[str],
  embeddings: list[list[float]],
  metadata: dict[str, Any],
  namespace: str,
) -> int:
    vectors = []

    for chunk, embedding in zip(chunks, embeddings, strict=True):
        chunk_metadata = {
            **metadata,
            "text": chunk,
        }
        vectors.append(
            {
                "id": str(uuid.uuid4()),
                "values": embedding,
                "metadata": chunk_metadata,
            }
        )

    index.upsert(vectors=vectors, namespace=namespace)
    return len(vectors)


def query_chunks(
  *,
  embedding: list[float],
  top_k: int,
  namespace: str,
  filter_by: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    response = index.query(
        vector=embedding,
        top_k=top_k,
        namespace=namespace,
        include_metadata=True,
        filter=filter_by,
    )

    matches = getattr(response, "matches", None)
    if matches is None and isinstance(response, dict):
        matches = response.get("matches", [])

    normalized_matches = []
    for match in matches or []:
        if isinstance(match, dict):
            normalized_matches.append(match)
            continue

        normalized_matches.append(
            {
                "id": getattr(match, "id", ""),
                "score": getattr(match, "score", 0.0),
                "metadata": getattr(match, "metadata", {}) or {},
            }
        )

    return normalized_matches
