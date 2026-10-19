from django.contrib.auth import authenticate, password_validation
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "locale", "created_at"]
        read_only_fields = ["id", "email", "role", "created_at"]


class TokensSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class SessionSerializer(serializers.Serializer):
    user = UserSerializer()
    tokens = TokensSerializer()


def session_for(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "user": UserSerializer(user).data,
        "tokens": {"access": str(refresh.access_token), "refresh": str(refresh)},
    }


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    clinic_name = serializers.CharField(required=False, allow_blank=True)
    license_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "full_name", "role", "locale", "clinic_name", "license_number"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("email_taken")
        return value.lower()

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate(self, attrs):
        if attrs.get("role") == User.Role.THERAPIST and not attrs.get("license_number"):
            raise serializers.ValidationError({"license_number": "required_for_therapists"})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            self.context.get("request"), email=attrs["email"].lower(), password=attrs["password"]
        )
        if not user:
            raise serializers.ValidationError({"password": "invalid_credentials"})
        attrs["user"] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
