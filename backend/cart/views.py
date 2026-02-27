from django.utils.crypto import get_random_string

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cart, CartItem
from .serializers import CartItemSerializer, CartSerializer


def _get_or_create_cart(request) -> Cart:
    """
    Resolve the current cart for the request.
    - If user is authenticated, use (or create) user cart.
    - Else, use cart_session_id from header X-Cart-Session or cookie cart_session.
    """
    user = request.user if request.user.is_authenticated else None

    if user:
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    session_id = request.headers.get('X-Cart-Session') or request.COOKIES.get('cart_session')
    if not session_id:
        session_id = get_random_string(32)

    cart, _ = Cart.objects.get_or_create(cart_session_id=session_id)
    request.cart_session_id = session_id  # type: ignore[attr-defined]
    return cart


class CartViewSet(viewsets.ViewSet):
    """
    Simple cart API:
    - GET /api/cart/ → current cart
    - POST /api/cart/items/ → add/update item
    - PATCH /api/cart/items/<id>/ → update quantity
    - DELETE /api/cart/items/<id>/ → remove item
    """

    def list(self, request):
        cart = _get_or_create_cart(request)
        serializer = CartSerializer(cart)
        response = Response(serializer.data)
        # For guests, ensure session cookie is set
        session_id = getattr(request, 'cart_session_id', None)
        if session_id:
            response.set_cookie('cart_session', session_id, httponly=False, samesite='Lax')
        return response

    @action(detail=False, methods=['post'], url_path='items')
    def add_item(self, request):
        cart = _get_or_create_cart(request)
        payload = request.data.copy()
        payload['cart'] = str(cart.id)

        existing = CartItem.objects.filter(
            cart=cart,
            product_variant_id=payload.get('product_variant_id'),
        ).first()

        if existing:
            try:
                delta = int(payload.get('quantity', 1))
            except (TypeError, ValueError):
                delta = 1
            existing.quantity += max(delta, 1)
            existing.save(update_fields=['quantity', 'updated_at'])
            serializer = CartItemSerializer(existing, context={'request': request})
            status_code = status.HTTP_200_OK
        else:
            serializer = CartItemSerializer(
                data=payload,
                context={'request': request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(cart=cart)
            status_code = status.HTTP_201_CREATED

        response = Response(serializer.data, status=status_code)
        session_id = getattr(request, 'cart_session_id', None)
        if session_id:
            response.set_cookie('cart_session', session_id, httponly=False, samesite='Lax')
        return response

    @action(detail=True, methods=['patch'], url_path='items')
    def update_item(self, request, pk=None):
        cart = _get_or_create_cart(request)
        try:
            item = cart.items.get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartItemSerializer(
            item,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='items')
    def delete_item(self, request, pk=None):
        cart = _get_or_create_cart(request)
        try:
            item = cart.items.get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

