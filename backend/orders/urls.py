from django.urls import path

from .views import OrderViewSet, create_razorpay_payment, razorpay_webhook

order_list = OrderViewSet.as_view({'get': 'list'})
order_detail = OrderViewSet.as_view({'get': 'retrieve'})

urlpatterns = [
    path('', order_list, name='order-list'),
    path('<uuid:id>/', order_detail, name='order-detail'),
    path('checkout/', OrderViewSet.as_view({'post': 'checkout'}), name='order-checkout'),
    path('razorpay/create/', create_razorpay_payment, name='razorpay-create'),
    path('razorpay/webhook/', razorpay_webhook, name='razorpay-webhook'),
]

