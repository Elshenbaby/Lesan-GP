import io
import shutil
import subprocess

import numpy as np
import soundfile as sf

from app.config import settings


class AudioDecodeError(ValueError):
    pass


def _resample(signal: np.ndarray, sr: int, target: int) -> np.ndarray:
    if sr == target:
        return signal
    duration = len(signal) / sr
    t_new = np.linspace(0, duration, int(duration * target), endpoint=False)
    t_old = np.linspace(0, duration, len(signal), endpoint=False)
    return np.interp(t_new, t_old, signal).astype(np.float32)


def _ffmpeg_decode(data: bytes, sr: int) -> np.ndarray:
    """Browsers record webm/opus, which libsndfile can't read; ffmpeg converts it to raw PCM."""
    if not shutil.which("ffmpeg"):
        raise AudioDecodeError("ffmpeg not installed")
    proc = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            "pipe:0",
            "-ac",
            "1",
            "-ar",
            str(sr),
            "-f",
            "f32le",
            "pipe:1",
        ],
        input=data,
        capture_output=True,
        timeout=15,
        check=False,
    )
    if proc.returncode != 0 or not proc.stdout:
        raise AudioDecodeError(proc.stderr.decode(errors="ignore")[:200])
    return np.frombuffer(proc.stdout, dtype=np.float32)


def load_audio(data: bytes) -> tuple[np.ndarray, int]:
    """Decode any browser recording to mono float32 at settings.sample_rate, capped at max_seconds."""
    sr = settings.sample_rate
    try:
        signal, native_sr = sf.read(io.BytesIO(data), dtype="float32", always_2d=True)
        signal = _resample(signal.mean(axis=1), native_sr, sr)
    except (sf.LibsndfileError, RuntimeError, TypeError):
        signal = _ffmpeg_decode(data, sr)
    if signal.size < sr * 0.1:
        raise AudioDecodeError("recording too short")
    return signal[: int(sr * settings.max_seconds)], sr
