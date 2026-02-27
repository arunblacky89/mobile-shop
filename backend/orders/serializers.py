from decimal import Decimal

from rest_framework import serializers

from cart.models import Cart
from cart.serializers import CartItemSerializer, ProductVariantMiniSerializer

from .models import Address, Order, OrderItem, Shipment, TrackingEvent


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'full_name',
            'line1',
            'line2',
            'city',
            'state',
            'postal_code',
            'country',
            'phone',
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantMiniSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['product_variant', 'quantity', 'price_snapshot', 'mrp_snapshot']


class TrackingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingEvent
        fields = ['status', 'description', 'location', 'occurred_at']


class ShipmentSerializer(serializers.ModelSerializer):
    events = TrackingEventSerializer(many=True, read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'carrier',
            'tracking_number',
            'status',
            'estimated_delivery_date',
            'events',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    payment_status = serializers.SerializerMethodField()
    shipment = ShipmentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'status',
            'subtotal',
            'currency',
            'items',
            'shipping_address',
            'payment_status',
            'shipment',
            'created_at',
        ]

    def get_payment_status(self, obj):
        payment = obj.payments.order_by('-created_at').first()
        return payment.status if payment else None


class OrderTrackingSerializer(serializers.ModelSerializer):
    shipment = ShipmentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'shipment']


class CheckoutSerializer(serializers.Serializer):
    """
    Very minimal checkout payload for now.
    """

    full_name = serializers.CharField(max_length=255)
    line1 = serializers.CharField(max_length=255)
    line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=120)
    state = serializers.CharField(max_length=120)
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=2, default="IN")
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)

    def validate(self, attrs):
        request = self.context.get('request')
        cart: Cart | None = self.context.get('cart')
        if not cart or cart.items.count() == 0:
            raise serializers.ValidationError('Cart is empty.')
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        cart: Cart = self.context['cart']

        address = Address.objects.create(
            user=request.user if request.user.is_authenticated else None,
            **validated_data,
        )

        subtotal: Decimal = cart.subtotal
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            cart=cart,
            subtotal=subtotal,
            currency='INR',
            shipping_address=address,
        )

        items = []
        for item in cart.items.all():
            items.append(
                OrderItem(
                    order=order,
                    product_variant=item.product_variant,
                    quantity=item.quantity,
                    price_snapshot=item.price_snapshot,
                    mrp_snapshot=item.mrp_snapshot,
                )
            )
        OrderItem.objects.bulk_create(items)

        # Simple strategy: keep cart but clear items after checkout
        cart.items.all().delete()

        return order

