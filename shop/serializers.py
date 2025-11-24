from rest_framework import serializers
from .models import Product, Cart, CartItem, User, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    qr_code_img_url = serializers.SerializerMethodField()
    product_image_url = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = '__all__'

    def get_qr_code_img_url(self, obj):
        request = self.context.get("request")
        if obj.qr_code_img:
            if request:
                return request.build_absolute_uri(obj.qr_code_img.url)
            return obj.qr_code_img.url
        return None
    
    def get_product_image_url(self, obj):
        request = self.context.get("request")
        if obj.product_image:
            if request:
                return request.build_absolute_uri(obj.product_image.url)
            return obj.product_image.url
        return None


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