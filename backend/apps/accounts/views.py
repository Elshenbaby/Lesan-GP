from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    SessionSerializer,
    SignupSerializer,
    UserSerializer,
    session_for,
)


class SignupView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=SignupSerializer, responses={201: SessionSerializer})
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(session_for(serializer.save()), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses=SessionSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(session_for(serializer.validated_data["user"]))


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ForgotPasswordView(APIView):
    """Always answers ok so the endpoint can't be used to discover which emails have accounts."""

    permission_classes = [AllowAny]

    @extend_schema(request=ForgotPasswordSerializer, responses=OpenApiTypes.OBJECT)
    def post(self, request):
        ForgotPasswordSerializer(data=request.data).is_valid(raise_exception=True)
        return Response({"ok": True})
