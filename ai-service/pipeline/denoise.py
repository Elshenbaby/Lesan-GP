import numpy as np

from .dsp import FRAME, istft, stft


def denoise(
    signal: np.ndarray, sr: int, *, noise_percentile: float = 10, reduction: float = 1.5
) -> np.ndarray:
    """Spectral gating: estimate the noise floor from the quietest frames and subtract it.

    Kids record in noisy homes; this is the cheap first pass. A learned denoiser can replace it later.
    """
    if signal.size < FRAME:
        return signal
    spec = stft(signal)
    mag, phase = np.abs(spec), np.angle(spec)
    frame_energy = mag.sum(axis=1)
    quiet = mag[frame_energy <= np.percentile(frame_energy, noise_percentile)]
    noise = quiet.mean(axis=0) if len(quiet) else np.zeros(mag.shape[1])
    cleaned = np.maximum(mag - reduction * noise, 0.0)
    out = istft(cleaned * np.exp(1j * phase), length=len(signal))
    peak = np.max(np.abs(out)) or 1.0
    return (out / peak * 0.95).astype(np.float32)
