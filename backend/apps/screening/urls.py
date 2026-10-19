from rest_framework.routers import SimpleRouter

from .views import ScreeningViewSet

router = SimpleRouter()
router.register("screenings", ScreeningViewSet, basename="screening")

urlpatterns = router.urls
