from rest_framework import serializers
from .models import Product, Cart, CartItem, User, Order

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
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


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    products = ProductSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'products', 'total_amount', 'created_at']