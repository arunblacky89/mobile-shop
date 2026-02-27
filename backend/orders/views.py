from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from cart.views import _get_or_create_cart

from .models import Order
from .serializers import CheckoutSerializer, OrderSerializer


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

