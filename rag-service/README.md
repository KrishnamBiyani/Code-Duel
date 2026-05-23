# DSA Duel RAG Service

FastAPI microservice for retrieval-augmented chat in the DSA Duel project.

## Endpoints

- `POST /ingest`
  - Body: `{ "text": "...", "metadata": { ... } }`
  - Chunks text, creates embeddings, and stores them in Pinecone.

- `POST /chat`
  - Body: `{ "message": "...", "questionTitle": "...", "questionDescription": "..." }`
  - Retrieves relevant chunks from Pinecone and returns a grounded Gemini answer.

- `GET /health`
  - Basic health check.

## Environment

Set these in `rag-service/.env` locally or in Render:

```env
GEMINI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
```

## Local Run

```bash
cd rag-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Notes

- The service uses the official Google GenAI Python SDK.
- The originally requested models `gemini-1.5-flash` and `text-embedding-004` are no longer active as of September 29, 2025 and January 14, 2026 respectively, so the service is wired to supported replacements:
  - LLM: `gemini-2.5-flash`
  - Embeddings: `gemini-embedding-2` with `768` dimensions
- Your Pinecone index must use the same embedding dimension configured by the service.
