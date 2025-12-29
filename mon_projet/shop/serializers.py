from rest_framework import serializers
from .models import Category, Product, Cart, CartItem, Like
from django.contrib.auth.models import User
from .models import Category, Product, Cart, CartItem, Like, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 
            'category', 'category_name', 'image', 'stock', 
            'is_featured', 'is_active', 'created_at', 
            'is_liked', 'likes_count'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, product=obj).exists()
        return False
    
    def get_likes_count(self, obj):
        return obj.likes.count()


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items', 'created_at', 'updated_at']


class LikeSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'product', 'created_at']



# Ajoutez ces nouveaux serializers après LikeSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_username', 'total_price',
            'payment_method', 'status', 'full_name', 'phone', 'address',
            'city', 'postal_code', 'card_last4', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'user', 'total_price', 'card_last4']


class CreateOrderSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=['delivery', 'card'])
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20)
    
    # Card payment fields (optional, required only if payment_method is 'card')
    card_number = serializers.CharField(max_length=16, required=False, write_only=True)
    card_expiry = serializers.CharField(max_length=5, required=False, write_only=True)
    card_cvv = serializers.CharField(max_length=4, required=False, write_only=True)
    
    def validate(self, attrs):
        if attrs['payment_method'] == 'card':
            if not all([attrs.get('card_number'), attrs.get('card_expiry'), attrs.get('card_cvv')]):
                raise serializers.ValidationError({
                    'card_details': 'Card number, expiry, and CVV are required for card payment'
                })
        return attrs