"""Speech pipeline: decode -> denoise -> align (find the sibilant) -> features -> classify."""

from app.schemas import ClassifyResponse, Features

from .align import find_frication
from .audio import AudioDecodeError, load_audio
from .classify import classifier
from .denoise import denoise
from .dsp import band_energy_ratio, spectral_centroid


def analyse(data: bytes, *, word: str, target_sound: str, position: str) -> ClassifyResponse:
    signal, sr = load_audio(data)
    clean = denoise(signal, sr)
    segment = find_frication(clean, sr, position=position)
    features = Features(
        duration_s=round(len(clean) / sr, 3),
        frication_s=round(len(segment) / sr, 3),
        spectral_centroid_hz=round(spectral_centroid(segment, sr), 1),
        high_band_ratio=round(band_energy_ratio(segment, sr, low_hz=4000, high_hz=8000), 3),
    )
    label, confidence = classifier.predict(segment, sr, features=features, target_sound=target_sound)
    return ClassifyResponse(
        label=label, confidence=round(confidence, 3), model_version=classifier.version, features=features
    )


__all__ = ["AudioDecodeError", "analyse"]
