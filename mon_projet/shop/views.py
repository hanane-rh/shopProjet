from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Category, Product, Cart, CartItem, Like
from .serializers import (
    CategorySerializer, ProductSerializer, 
    CartSerializer, CartItemSerializer, LikeSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        is_featured = self.request.query_params.get('featured', None)
        if is_featured:
            queryset = queryset.filter(is_featured=True)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.queryset.filter(is_featured=True)[:10]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
        
        if product.stock < quantity:
            return Response({'error': 'Insufficient stock'}, status=400)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        
        if not item_id or quantity is None:
            return Response({'error': 'item_id and quantity are required'}, status=400)
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        
        if int(quantity) <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response({'error': 'item_id is required'}, status=400)
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class LikeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        likes = Like.objects.filter(user=request.user).select_related('product')
        serializer = LikeSerializer(likes, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
        
        like, created = Like.objects.get_or_create(user=request.user, product=product)
        
        if not created:
            like.delete()
            return Response({'liked': False, 'message': 'Product unliked'})
        
        return Response({'liked': True, 'message': 'Product liked'})
    
    # Ajoutez ces imports en haut du fichier avec les autres imports
import random
import string
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer

# Ajoutez ce ViewSet à la fin du fichier

class OrderViewSet(viewsets.ViewSet):
    """
    Order management - requires authentication
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get user's orders"""
        orders = Order.objects.filter(user=request.user).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Get single order details"""
        order = get_object_or_404(Order, id=pk, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """Create new order from cart"""
        serializer = CreateOrderSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user's cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check stock for all items
        for cart_item in cart.items.all():
            if cart_item.product.stock < cart_item.quantity:
                return Response({
                    'error': f'Insufficient stock for {cart_item.product.name}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate order number
        order_number = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        # Process card payment if needed
        card_last4 = None
        if serializer.validated_data['payment_method'] == 'card':
            card_number = serializer.validated_data.get('card_number')
            # Simulate card payment (in production, integrate with Stripe/PayPal)
            card_last4 = card_number[-4:] if card_number else None
            
            # Here you would integrate with payment gateway
            # payment_successful = process_card_payment(card_details)
            # if not payment_successful:
            #     return Response({'error': 'Payment failed'}, status=400)
  
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_price=cart.total_price,
            payment_method=serializer.validated_data['payment_method'],
            full_name=serializer.validated_data['full_name'],
            phone=serializer.validated_data['phone'],
            address=serializer.validated_data['address'],
            city=serializer.validated_data['city'],
            postal_code=serializer.validated_data['postal_code'],
            card_last4=card_last4,
            status='pending'
        )
        
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            
            # Update product stock
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()
        
        # Clear cart
        cart.items.all().delete()
        
        # Return order details
        order_serializer = OrderSerializer(order)
        return Response({
            'message': 'Order created successfully',
            'order': order_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """Cancel an order"""
        order = get_object_or_404(Order, id=pk, user=request.user)
        
        if order.status not in ['pending', 'processing']:
            return Response({
                'error': 'Cannot cancel order in current status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Restore stock
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()
        
        order.status = 'cancelled'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response({
            'message': 'Order cancelled successfully',
            'order': serializer.data
        })


# MODIFIER ProductViewSet - Ajouter cette action après la méthode featured()
@action(detail=False, methods=['get'])
def by_category(self, request):
    """Get products by category slug"""
    category_slug = request.query_params.get('slug')
    
    if not category_slug:
        return Response({
            'error': 'Category slug is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        category = Category.objects.get(slug=category_slug)
    except Category.DoesNotExist:
        return Response({
            'error': 'Category not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    products = self.queryset.filter(category=category)
    
    # Pagination
    page = self.paginate_queryset(products)
    if page is not None:
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    
    serializer = self.get_serializer(products, many=True)
    return Response({
        'category': CategorySerializer(category).data,
        'products': serializer.data
    })