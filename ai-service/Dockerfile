FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# libsndfile reads wav/ogg/flac; ffmpeg decodes the webm/opus that browsers record.
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ARG REQUIREMENTS=requirements.txt
COPY requirements*.txt ./
RUN pip install -r ${REQUIREMENTS}

COPY . .

EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
