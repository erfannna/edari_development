from django.urls import path
from . import views


app_name = 'shop'

urlpatterns = [
    path('product-buy-order', views.buy_order, name='buy_order'),
    path('product-buy-orders', views.buy_orders, name='buy_orders'),
    path('product-buy-orders/<int:pk>', views.buy_order_review, name='buy_order_review'),
    path('product-buy-orders-logs', views.buy_order_logs, name='buy_order_logs'),
    path('product-from-stockroom', views.stockroom_order, name='stockroom_order'),
    path('product-requests-stockroom', views.stockroom_orders, name='stockroom_orders'),
    path('product-requests-stockroom/<int:pk>', views.stockroom_order_review, name='stockroom_order_review'),
    path('product-from-stockroom-logs', views.stockroom_order_logs, name='stockroom_order_logs'),
    path('product-buy-orders-card', views.buy_orders_card, name='buy_orders_card'),
    path('product-stockroom-orders-card', views.stockroom_orders_card, name='stockroom_orders_card'),
]
