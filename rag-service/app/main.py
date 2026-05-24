from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings, validate_settings
from app.schemas import (
    ChatRequest,
    ChatResponse,
    IngestRequest,
    IngestResponse,
    SourceChunk,
)
from app.services.gemini_service import embed_texts, generate_grounded_answer
from app.services.pinecone_service import query_chunks, upsert_chunks
from app.utils import chunk_text, compact_metadata, non_empty_texts

settings = get_settings()
validate_settings(settings)

app = FastAPI(title="DSA Duel RAG Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest) -> IngestResponse:
    if request.metadata.get("pre_chunked"):
        chunks = [request.text] if request.text.strip() else []
    else:
        chunks = chunk_text(
            text=request.text,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )

    if not chunks:
        raise HTTPException(status_code=400, detail="No ingestible text provided.")

    embeddings = embed_texts(chunks)
    namespace = str(request.metadata.get("namespace") or settings.namespace)
    stored = upsert_chunks(
        chunks=chunks,
        embeddings=embeddings,
        metadata=compact_metadata(request.metadata),
        namespace=namespace,
    )

    return IngestResponse(
        status="success",
        chunksStored=stored,
        namespace=namespace,
    )


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    namespace = settings.namespace
    retrieval_query = "\n".join(
        [
            f"Question title: {request.questionTitle}",
            f"Question description: {request.questionDescription}",
            f"User message: {request.message}",
        ]
    )

    [query_embedding] = embed_texts([retrieval_query])

    filter_by = {"questionTitle": {"$eq": request.questionTitle}}
    matches = query_chunks(
        embedding=query_embedding,
        top_k=settings.top_k,
        namespace=namespace,
        filter_by=filter_by,
    )

    if not matches:
        matches = query_chunks(
            embedding=query_embedding,
            top_k=settings.top_k,
            namespace=namespace,
            filter_by=None,
        )

    source_chunks = [
        SourceChunk(
            id=match["id"],
            score=float(match.get("score", 0.0)),
            text=str(match.get("metadata", {}).get("text", "")),
            metadata=compact_metadata(match.get("metadata", {})),
        )
        for match in matches
    ]

    answer = generate_grounded_answer(
        message=request.message,
        question_title=request.questionTitle,
        question_description=request.questionDescription,
        retrieved_chunks=non_empty_texts(chunk.text for chunk in source_chunks),
    )

    return ChatResponse(answer=answer, sources=source_chunks)
