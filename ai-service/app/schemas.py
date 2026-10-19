from typing import Literal

from pydantic import BaseModel

SoundLabel = Literal["correct", "interdental", "dentalized", "lateral", "palatal"]
TargetSound = Literal["س", "ز", "ش", "ص"]
Position = Literal["initial", "medial", "final"]


class Features(BaseModel):
    duration_s: float
    frication_s: float
    spectral_centroid_hz: float
    high_band_ratio: float


class ClassifyResponse(BaseModel):
    label: SoundLabel
    confidence: float
    model_version: str
    features: Features | None = None


class Health(BaseModel):
    status: Literal["ok"]
    model_version: str
