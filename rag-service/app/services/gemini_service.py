from google import genai
from google.genai import types

from app.config import get_settings

settings = get_settings()
client = genai.Client(api_key=settings.gemini_api_key)


def embed_texts(texts: list[str]) -> list[list[float]]:
    contents = [
        types.Content(parts=[types.Part.from_text(text=text)]) for text in texts
    ]
    result = client.models.embed_content(
        model=settings.embedding_model,
        contents=contents,
        config=types.EmbedContentConfig(
            output_dimensionality=settings.embedding_dimensions
        ),
    )
    return [embedding.values for embedding in result.embeddings]


import time

def generate_grounded_answer(
  *,
  message: str,
  question_title: str,
  question_description: str,
  retrieved_chunks: list[str],
) -> str:
    context = "\n\n".join(
        f"[Chunk {index + 1}]\n{chunk}"
        for index, chunk in enumerate(retrieved_chunks)
    )

    prompt = f"""
You are a DSA preparation assistant for a coding interview platform.
Answer the user's question using the retrieved context first. If the context is
insufficient, say what is missing and then give the best limited answer you can.
Do not invent problem constraints or examples that are not grounded in the context.

Question title:
{question_title}

Question description:
{question_description}

Retrieved context:
{context or "No relevant context found."}

User message:
{message}
""".strip()

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=settings.llm_model,
                contents=prompt,
            )
            return response.text or "I could not generate a response."
        except Exception as e:
            if "503" in str(e) and attempt < 2:
                print(f"503 error, retrying in 10 seconds (attempt {attempt + 1}/3)...")
                time.sleep(10)
            else:
                return "AI service is temporarily unavailable. Please try again in a moment."