from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """Normalise errors to the frontend's ApiError shape: {code, message, fields?}."""
    response = exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, ValidationError) and isinstance(response.data, dict):
        response.data = {"code": "validation_error", "message": "Invalid input.", "fields": response.data}
    else:
        detail = response.data.get("detail", "") if isinstance(response.data, dict) else response.data
        code = getattr(exc, "default_code", "error")
        response.data = {"code": code, "message": str(detail)}
    return response
