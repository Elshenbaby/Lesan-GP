from django.http import Http404
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.children.models import Child
from apps.common.permissions import can_access_child

from .services import progress_overview


class ProgressView(APIView):
    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request, child_id):
        child = get_object_or_404(Child, id=child_id)
        if not can_access_child(request.user, child):
            raise Http404
        lang = "en" if request.LANGUAGE_CODE.startswith("en") else "ar"
        return Response(progress_overview(child, lang))
