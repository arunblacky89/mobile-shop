from rest_framework import serializers

from .models import Brand, Category, Product


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "logo_url", "is_active"]


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "image_url", "is_active", "children"]

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True).data


class ProductListSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source="brand.name", read_only=True, default="")
    category_name = serializers.CharField(source="category.name", read_only=True, default="")
    sale_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "brand_name",
            "category_name",
            "price",
            "discount_percent",
            "sale_price",
            "image_url",
            "rating",
            "review_count",
            "is_featured",
            "stock",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    sale_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "category",
            "description",
            "price",
            "discount_percent",
            "sale_price",
            "image_url",
            "rating",
            "review_count",
            "stock",
            "is_featured",
            "is_active",
            "created_at",
            "updated_at",
        ]
