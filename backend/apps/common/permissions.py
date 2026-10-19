from rest_framework.permissions import BasePermission


class IsTherapist(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "therapist")


class IsGuardian(BasePermission):
    """Parents and adult learners own child profiles."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role in ("parent", "adult")
        )


def can_access_child(user, child) -> bool:
    return child.parent_id == user.id or (child.therapist_id is not None and child.therapist_id == user.id)
