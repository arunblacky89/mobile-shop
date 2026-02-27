from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"brands", views.BrandViewSet, basename="brand")
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"products", views.ProductViewSet, basename="product")

urlpatterns = [
    path("health/", views.health, name="health"),
    path("auth/register/", views.register, name="auth-register"),
    path("", include(router.urls)),
]
