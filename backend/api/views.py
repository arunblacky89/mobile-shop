from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Brand, Category, Product
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "mobile-shop-api"})


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = "slug"


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Category.objects.filter(is_active=True, parent__isnull=True)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related("brand", "category")

        # Filter by category slug
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__slug=category)

        # Filter by brand slug
        brand = self.request.query_params.get("brand")
        if brand:
            qs = qs.filter(brand__slug=brand)

        # Filter featured only
        featured = self.request.query_params.get("featured")
        if featured == "true":
            qs = qs.filter(is_featured=True)

        # Search by name
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        # Ordering
        ordering = self.request.query_params.get("ordering", "-created_at")
        allowed = {"price", "-price", "rating", "-rating", "name", "-name", "-created_at"}
        if ordering in allowed:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer
