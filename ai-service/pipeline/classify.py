import logging

import numpy as np

from app.config import settings
from app.schemas import Features

logger = logging.getLogger(__name__)

# Expected centroid (Hz) of a correct sibilant per target sound; ز is voiced so it sits a little lower.
CORRECT_CENTROID = {"س": 6000.0, "ز": 5200.0, "ش": 3800.0, "ص": 5000.0}


class SibilantClassifier:
    """Loads the TorchScript model from models/ when present; otherwise uses the DSP baseline.

    The baseline is deliberately simple and honest: it only separates a crisp hiss from a flattened,
    lower-pitched one (interdental). Lateral/palatal need the trained model.
    """

    def __init__(self) -> None:
        self.model = None
        self.version = "dsp-baseline-0.1"
        if settings.model_path.exists():
            try:
                import torch

                self.model = torch.jit.load(str(settings.model_path)).eval()
                self.version = f"torch-{settings.model_path.stem}"
            except Exception:  # noqa: BLE001 - any load failure means "use the baseline"
                logger.exception("Could not load %s; falling back to DSP baseline", settings.model_path)

    def predict(
        self, segment: np.ndarray, sr: int, *, features: Features, target_sound: str
    ) -> tuple[str, float]:
        if self.model is not None:
            return self._predict_torch(segment)
        return self._predict_baseline(features, target_sound)

    def _predict_torch(self, segment: np.ndarray) -> tuple[str, float]:
        import torch

        labels = ["correct", "interdental", "dentalized", "lateral", "palatal"]
        with torch.no_grad():
            probs = torch.softmax(self.model(torch.from_numpy(segment).unsqueeze(0)), dim=-1)[0]
        idx = int(probs.argmax())
        return labels[idx], float(probs[idx])

    def _predict_baseline(self, f: Features, target_sound: str) -> tuple[str, float]:
        if f.frication_s < 0.04:
            return "correct", 0.35
        expected = CORRECT_CENTROID.get(target_sound, 5500.0)
        # Distance below the expected centroid, scaled so ~2 kHz lower is a confident interdental call.
        drop = (expected - f.spectral_centroid_hz) / 2000.0
        score = float(np.clip(0.5 + drop * 0.5 - (f.high_band_ratio - 0.4) * 0.5, 0.0, 1.0))
        if score >= 0.5:
            return "interdental", 0.5 + (score - 0.5)
        return "correct", 0.5 + (0.5 - score)


classifier = SibilantClassifier()
