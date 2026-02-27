import uuid

from django.conf import settings
from django.db import models

from catalog.models import ProductVariant


class Cart(models.Model):
    """
    Minimal cart that supports both authenticated and guest users.
    - Authenticated users are linked via user FK.
    - Guests are tracked via a cart_session_id (front-end generated UUID stored in cookie/header).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="carts",
    )
    cart_session_id = models.CharField(max_length=64, db_index=True, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["cart_session_id"]),
        ]

    def __str__(self) -> str:
        ident = self.user or self.cart_session_id or self.pk
        return f"Cart({ident})"

    @property
    def item_count(self) -> int:
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        from decimal import Decimal

        total = Decimal("0.00")
        for item in self.items.all():
            total += item.quantity * item.price_snapshot
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(default=1)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    mrp_snapshot = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("cart", "product_variant")

    def __str__(self) -> str:
        return f"{self.product_variant.sku} x {self.quantity}"

