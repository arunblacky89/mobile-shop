from decimal import Decimal

from rest_framework import serializers

from catalog.models import ProductVariant

from .models import Cart, CartItem


class ProductVariantMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'price', 'mrp', 'attributes', 'stock_qty']


class CartItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantMiniSerializer(read_only=True)
    product_variant_id = serializers.PrimaryKeyRelatedField(
        source='product_variant',
        queryset=ProductVariant.objects.all(),
        write_only=True,
    )

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product_variant',
            'product_variant_id',
            'quantity',
            'price_snapshot',
            'mrp_snapshot',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['price_snapshot', 'mrp_snapshot', 'created_at', 'updated_at']

    def validate_quantity(self, value: int) -> int:
        if value <= 0:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

    def create(self, validated_data):
        product_variant: ProductVariant = validated_data['product_variant']
        validated_data.setdefault('price_snapshot', Decimal(product_variant.price))
        validated_data.setdefault('mrp_snapshot', product_variant.mrp)
        return super().create(validated_data)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = [
            'id',
            'item_count',
            'subtotal',
            'items',
            'created_at',
            'updated_at',
        ]

