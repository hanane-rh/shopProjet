from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CartViewSet, LikeViewSet
from .views import CategoryViewSet, ProductViewSet, CartViewSet, LikeViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'orders', OrderViewSet, basename='order') 

urlpatterns = [
    path('', include(router.urls)),
]