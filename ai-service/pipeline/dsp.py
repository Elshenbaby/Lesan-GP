import numpy as np

FRAME = 512
HOP = 128


def stft(signal: np.ndarray) -> np.ndarray:
    window = np.hanning(FRAME)
    frames = [signal[i : i + FRAME] * window for i in range(0, len(signal) - FRAME + 1, HOP)]
    return np.fft.rfft(np.array(frames), axis=1)


def istft(spec: np.ndarray, length: int) -> np.ndarray:
    window = np.hanning(FRAME)
    out = np.zeros(length + FRAME)
    norm = np.zeros(length + FRAME)
    for k, frame in enumerate(np.fft.irfft(spec, n=FRAME, axis=1)):
        start = k * HOP
        out[start : start + FRAME] += frame * window
        norm[start : start + FRAME] += window**2
    return (out / np.maximum(norm, 1e-8))[:length]


def spectral_centroid(signal: np.ndarray, sr: int) -> float:
    """Centre of mass of the spectrum. A clear /s/ sits around 5-8 kHz; interdental /θ/ is lower, flatter."""
    if signal.size == 0:
        return 0.0
    mag = np.abs(np.fft.rfft(signal * np.hanning(len(signal))))
    freqs = np.fft.rfftfreq(len(signal), 1 / sr)
    total = mag.sum()
    return float((freqs * mag).sum() / total) if total else 0.0


def band_energy_ratio(signal: np.ndarray, sr: int, *, low_hz: float, high_hz: float) -> float:
    if signal.size == 0:
        return 0.0
    power = np.abs(np.fft.rfft(signal)) ** 2
    freqs = np.fft.rfftfreq(len(signal), 1 / sr)
    total = power.sum()
    band = power[(freqs >= low_hz) & (freqs < high_hz)].sum()
    return float(band / total) if total else 0.0


def zero_crossing_rate(frames: np.ndarray) -> np.ndarray:
    return np.mean(np.abs(np.diff(np.sign(frames), axis=1)) > 0, axis=1)
