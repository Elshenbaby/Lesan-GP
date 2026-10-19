from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from pipeline import AudioDecodeError, analyse
from pipeline.classify import classifier

from .schemas import ClassifyResponse, Health, Position, TargetSound

app = FastAPI(
    title="Lisan speech service",
    description="Classifies one recorded word for sibilant (lisp) errors. Called only by the Django backend.",
    version="0.1.0",
)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", model_version=classifier.version)


@app.post("/classify", response_model=ClassifyResponse)
async def classify(
    audio: Annotated[UploadFile, File()],
    word: Annotated[str, Form()],
    target_sound: Annotated[TargetSound, Form()],
    position: Annotated[Position, Form()],
) -> ClassifyResponse:
    data = await audio.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty_audio")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="audio_too_large")
    try:
        return analyse(data, word=word, target_sound=target_sound, position=position)
    except AudioDecodeError as exc:
        raise HTTPException(status_code=422, detail="undecodable_audio") from exc
