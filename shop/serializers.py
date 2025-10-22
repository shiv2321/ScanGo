from rest_framework import serializers
from .models import Product, Cart, CartItem, User, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class OrderItemSerializer(serializers.ModelSerializer):
    Product = ProductSerializer(read_only=True)
    class Meta:
        model = OrderItem
        fileds = ['product', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    order_items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'total_amount', 'status','created_at', 'order_items']