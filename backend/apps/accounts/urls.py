from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import ForgotPasswordView, LoginView, MeView, SignupView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("password/forgot/", ForgotPasswordView.as_view(), name="password-forgot"),
]
