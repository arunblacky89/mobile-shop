from django.urls import path

from .views import CartViewSet


cart_list = CartViewSet.as_view({'get': 'list'})
cart_add_item = CartViewSet.as_view({'post': 'add_item'})
cart_update_item = CartViewSet.as_view({'patch': 'update_item', 'delete': 'delete_item'})

urlpatterns = [
    path('', cart_list, name='cart-detail'),
    path('items/', cart_add_item, name='cart-add-item'),
    path('items/<int:pk>/', cart_update_item, name='cart-update-item'),
]

