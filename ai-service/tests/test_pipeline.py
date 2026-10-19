import numpy as np

from agent.report_writer import template_report
from pipeline.align import find_frication
from pipeline.audio import load_audio
from pipeline.dsp import band_energy_ratio, spectral_centroid

SR = 16_000


def test_find_frication_isolates_the_hiss(crisp_s):
    signal, sr = load_audio(crisp_s)
    segment = find_frication(signal, sr, position="initial")
    assert 0.25 < len(segment) / sr < 0.5


def test_centroid_and_band_ratio_track_frequency():
    t = np.arange(SR) / SR
    high = np.sin(2 * np.pi * 6000 * t)
    low = np.sin(2 * np.pi * 1000 * t)
    assert spectral_centroid(high, SR) > spectral_centroid(low, SR)
    assert band_energy_ratio(high, SR, low_hz=4000, high_hz=8000) > 0.9
    assert band_energy_ratio(low, SR, low_hz=4000, high_hz=8000) < 0.1


def test_template_report_is_bilingual():
    copy = template_report(name="Youssef", sound="س", before=45, after=72)
    assert "72" in copy.headline_en and "Youssef" in copy.tip_en and copy.tip_ar
