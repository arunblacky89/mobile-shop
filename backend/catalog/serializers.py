from rest_framework import serializers

from .models import Brand, Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'sort_order']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'price', 'mrp', 'attributes', 'stock_qty']


class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    price = serializers.SerializerMethodField()
    mrp = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'title', 'slug', 'brand', 'category', 'is_active', 'price', 'mrp', 'image_url']

    def get_price(self, obj):
        variant = obj.variants.first()
        return float(variant.price) if variant else None

    def get_mrp(self, obj):
        variant = obj.variants.first()
        return float(variant.mrp) if variant and variant.mrp else None

    def get_image_url(self, obj):
        image = obj.images.order_by('sort_order').first()
        return image.image_url if image else None


class ProductDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'brand',
            'category',
            'is_active',
            'variants',
            'images',
        ]

