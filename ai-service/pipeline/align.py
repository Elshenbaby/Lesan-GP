import numpy as np

from .dsp import FRAME, HOP, zero_crossing_rate


def find_frication(signal: np.ndarray, sr: int, *, position: str, min_ms: float = 40) -> np.ndarray:
    """Locate the sibilant: the longest run of loud, noisy (high zero-crossing) frames.

    Stand-in for forced alignment (e.g. Montreal Forced Aligner with an Egyptian Arabic lexicon), which will
    also use `position` to pick the right segment. Falls back to the whole signal when nothing stands out.
    """
    if signal.size < FRAME:
        return signal
    frames = np.lib.stride_tricks.sliding_window_view(signal, FRAME)[::HOP]
    energy = np.sqrt((frames**2).mean(axis=1))
    zcr = zero_crossing_rate(frames)
    mask = (energy > 0.25 * energy.max()) & (zcr > 0.25)

    best, start = (0, 0), None
    for i, on in enumerate([*mask, False]):
        if on and start is None:
            start = i
        elif not on and start is not None:
            if i - start > best[1] - best[0]:
                best = (start, i)
            start = None

    if (best[1] - best[0]) * HOP / sr * 1000 < min_ms:
        return signal
    return signal[best[0] * HOP : best[1] * HOP + FRAME]
