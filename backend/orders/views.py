import hashlib
import hmac

import razorpay
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from cart.views import _get_or_create_cart

from .models import Order, Payment
from .serializers import CheckoutSerializer, OrderSerializer


def _get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise RuntimeError("Razorpay keys not configured")
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Minimal orders API:
    - POST /api/orders/checkout/  → create order from current cart
    - GET  /api/orders/           → list user orders
    - GET  /api/orders/<id>/      → order detail
    """

    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    lookup_field = 'id'

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            return qs.filter(user=user)
        # Guest: allow viewing orders linked to their cart session
        session_id = (
            self.request.headers.get("X-Cart-Session")
            or self.request.COOKIES.get("cart_session")
        )
        if session_id:
            return qs.filter(cart__cart_session_id=session_id)
        return qs.none()

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        cart = _get_or_create_cart(request)
        serializer = CheckoutSerializer(
            data=request.data,
            context={'request': request, 'cart': cart},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


# ── Razorpay: create order ────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def create_razorpay_payment(request):
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"detail": "order_id required"}, status=400)

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found"}, status=404)

    if order.status != Order.Status.PENDING_PAYMENT:
        return Response({"detail": "Order is not pending payment"}, status=400)

    try:
        client = _get_razorpay_client()
    except RuntimeError as exc:
        return Response({"detail": str(exc)}, status=503)

    amount_paise = int(order.subtotal * 100)
    rzp_order = client.order.create(
        {
            "amount": amount_paise,
            "currency": order.currency,
            "receipt": str(order.id),
            "payment_capture": 1,
        }
    )

    payment = Payment.objects.create(
        order=order,
        amount=order.subtotal,
        currency=order.currency,
        status=Payment.Status.CREATED,
        razorpay_order_id=rzp_order["id"],
    )

    return Response(
        {
            "order_id": str(order.id),
            "payment_id": str(payment.id),
            "razorpay_order_id": rzp_order["id"],
            "amount": amount_paise,
            "currency": order.currency,
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        }
    )


# ── Razorpay: webhook ─────────────────────────────────────────────
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    signature = request.headers.get("X-Razorpay-Signature", "")
    body = request.body

    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        return Response({"detail": "Invalid signature"}, status=400)

    event = request.data.get("event")
    payload = request.data.get("payload", {})

    if event == "payment.captured":
        entity = payload.get("payment", {}).get("entity", {})
        rzp_order_id = entity.get("order_id")
        rzp_payment_id = entity.get("id")

        payment = Payment.objects.filter(
            razorpay_order_id=rzp_order_id
        ).first()

        if payment:
            payment.status = Payment.Status.PAID
            payment.razorpay_payment_id = rzp_payment_id
            payment.save(update_fields=["status", "razorpay_payment_id", "updated_at"])

            payment.order.status = Order.Status.PAID
            payment.order.save(update_fields=["status", "updated_at"])

    return Response({"status": "ok"})

