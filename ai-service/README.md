# Lisan speech service (FastAPI)

Classifies one recorded word for sibilant errors. Only the Django backend calls it
(`backend/apps/common/ai_client.py`); browsers never do.

```bash
cd ai-service
uv venv -p 3.12 .venv && source .venv/bin/activate
uv pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8001    # docs at http://localhost:8001/docs
pytest && ruff check .
```

## Pipeline

`pipeline/analyse()` runs: `audio.load_audio` (wav via libsndfile, webm via ffmpeg) → `denoise` (spectral gating)
→ `align.find_frication` (locates the hiss) → `dsp` features → `classify`.

`classify.SibilantClassifier` loads `models/sibilant_classifier.pt` (TorchScript) when it exists. Without it, the
DSP baseline separates a crisp hiss from a flattened interdental one using spectral centroid and 4–8 kHz energy.
It does not detect lateral or palatal lisps; that needs the trained model.

## Training (ML team)

- Install `requirements-ml.txt` (torch, torchaudio, transformers, librosa).
- Labelled audio goes in `data/` (git-ignored). Therapist labels from the review queue are the ground truth:
  export them from the Django admin or `Attempt.objects.exclude(therapist_label="")`.
- Export the model with `torch.jit.script(model).save("models/sibilant_classifier.pt")`. Input: mono float32
  at 16 kHz. Output: logits over `[correct, interdental, dentalized, lateral, palatal]`.

## Agent

`agent/` holds the LLM prompts and the template fallback used for weekly parent reports and plan proposals.
Set `LISAN_AI_LLM_API_KEY` to enable the LLM; without it the deterministic templates are used.
