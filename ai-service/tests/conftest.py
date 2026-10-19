import io

import numpy as np
import pytest
import soundfile as sf

SR = 16_000


def _band_noise(low_hz: float, high_hz: float, seconds: float = 0.4, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    noise = rng.standard_normal(int(SR * seconds))
    spec = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(noise.size, 1 / SR)
    spec[(freqs < low_hz) | (freqs > high_hz)] = 0
    return np.fft.irfft(spec, n=noise.size)


def make_word(low_hz: float, high_hz: float) -> bytes:
    """A vowel-ish tone, a band-limited hiss, then another tone: a crude 'a-s-a'."""
    t = np.arange(int(SR * 0.25)) / SR
    vowel = 0.3 * np.sin(2 * np.pi * 220 * t)
    hiss = _band_noise(low_hz, high_hz)
    hiss = 0.5 * hiss / np.max(np.abs(hiss))
    signal = np.concatenate([vowel, hiss, vowel]).astype(np.float32)
    buf = io.BytesIO()
    sf.write(buf, signal, SR, format="WAV")
    return buf.getvalue()


@pytest.fixture
def crisp_s() -> bytes:
    return make_word(4500, 7900)


@pytest.fixture
def lisped_s() -> bytes:
    return make_word(1200, 3500)
