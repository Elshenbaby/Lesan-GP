from .base import *  # noqa: F403
from .base import BASE_DIR

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
CELERY_TASK_ALWAYS_EAGER = True
MEDIA_ROOT = BASE_DIR / ".test-media"
# Tests never reach the AI service; apps.common.ai_client falls back to the heuristic.
AI_SERVICE_URL = ""
