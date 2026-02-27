from rest_framework import viewsets
from rest_framework import filters

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related(
        'brand',
        'category',
    ).prefetch_related('variants', 'images')
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category_slug = self.request.query_params.get('category')
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        brand_slug = self.request.query_params.get('brand')
        if brand_slug:
            qs = qs.filter(brand__slug=brand_slug)
        ordering = self.request.query_params.get('ordering', '-created_at')
        allowed = {'price', '-price', 'title', '-title', '-created_at'}
        if ordering in allowed:
            qs = qs.order_by(ordering)
        return qs
