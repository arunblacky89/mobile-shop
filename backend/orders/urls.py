from django.urls import path

from .views import (
    OrderViewSet,
    create_razorpay_payment,
    razorpay_webhook,
    shipping_estimate,
    order_tracking,
)

order_list = OrderViewSet.as_view({'get': 'list'})
order_detail = OrderViewSet.as_view({'get': 'retrieve'})

urlpatterns = [
    path('', order_list, name='order-list'),
    path('checkout/', OrderViewSet.as_view({'post': 'checkout'}), name='order-checkout'),
    path('razorpay/create/', create_razorpay_payment, name='razorpay-create'),
    path('razorpay/webhook/', razorpay_webhook, name='razorpay-webhook'),
    path('shipping/estimate/', shipping_estimate, name='shipping-estimate'),
    path('<uuid:id>/tracking/', order_tracking, name='order-tracking'),
    path('<uuid:id>/', order_detail, name='order-detail'),
]

