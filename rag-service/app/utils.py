from collections.abc import Iterable


def chunk_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []

    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    chunks: list[str] = []
    start = 0
    length = len(cleaned)

    while start < length:
        end = min(start + chunk_size, length)
        chunks.append(cleaned[start:end])
        if end == length:
            break
        start = end - chunk_overlap

    return chunks


def compact_metadata(metadata: dict) -> dict:
    return {
        key: value
        for key, value in metadata.items()
        if isinstance(value, (str, int, float, bool, list, dict)) and key != "text"
    }


def non_empty_texts(texts: Iterable[str]) -> list[str]:
    return [text for text in texts if text and text.strip()]
