import uuid

from django.conf import settings
from django.db import models

from catalog.models import ProductVariant
from cart.models import Cart


class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    full_name = models.CharField(max_length=255)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=2, default="IN")
    phone = models.CharField(max_length=32, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.full_name} - {self.city}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "PENDING_PAYMENT", "Pending payment"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="orders",
    )
    cart = models.ForeignKey(
        Cart,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="orders",
    )
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.PENDING_PAYMENT,
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="INR")
    shipping_address = models.ForeignKey(
        Address,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="orders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Order {self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    quantity = models.PositiveIntegerField()
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    mrp_snapshot = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    def __str__(self) -> str:
        return f"{self.product_variant.sku} x {self.quantity}"


class Payment(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="payments"
    )
    gateway = models.CharField(max_length=20, default="razorpay")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="INR")
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.CREATED
    )
    razorpay_order_id = models.CharField(max_length=128, blank=True, default="")
    razorpay_payment_id = models.CharField(max_length=128, blank=True, default="")
    razorpay_signature = models.CharField(max_length=256, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Payment {self.id} ({self.status})"


class Shipment(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"
        PAID = "PAID", "Payment confirmed"
        PACKED = "PACKED", "Packed"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="shipment",
    )
    carrier = models.CharField(max_length=32, default="mock")
    tracking_number = models.CharField(max_length=64, blank=True, default="")
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.CREATED,
    )
    estimated_delivery_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Shipment {self.id} for order {self.order_id}"


class TrackingEvent(models.Model):
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
        related_name="events",
    )
    status = models.CharField(max_length=32)
    description = models.CharField(max_length=255)
    location = models.CharField(max_length=120, blank=True, default="")
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["occurred_at"]

    def __str__(self) -> str:
        return f"{self.status} @ {self.occurred_at}"


def create_default_shipment_for_order(order: Order) -> Shipment:
    """Auto-create a Shipment + seed tracking events when order is paid."""
    from datetime import date, timedelta

    est = date.today() + timedelta(days=3)
    shipment, _ = Shipment.objects.get_or_create(
        order=order,
        defaults={
            "status": (
                Shipment.Status.PAID
                if order.status == Order.Status.PAID
                else Shipment.Status.CREATED
            ),
            "estimated_delivery_date": est,
        },
    )
    if not shipment.events.exists():
        TrackingEvent.objects.bulk_create(
            [
                TrackingEvent(
                    shipment=shipment,
                    status="ORDER_PLACED",
                    description="Order placed",
                    occurred_at=order.created_at,
                ),
                TrackingEvent(
                    shipment=shipment,
                    status="PAYMENT_CONFIRMED",
                    description="Payment confirmed",
                    occurred_at=order.updated_at,
                ),
            ]
        )
    return shipment

