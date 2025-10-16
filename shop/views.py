from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Cart, CartItem
from .serializers import ProductSerializer, CartItemSerializer, CartSerializer

# Create your views here.

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def product_list(request):
    user = request.user
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if user.role != 'Admin':
            return Response({'error':'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def product_details(request, pk):
    user = request.user
    try:
        product = Product.objects.get(pk=pk)

    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'DELETE']:
        if user.role != 'Admin':
            return Response({'error':'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)
        

        if request.method == 'PUT':
            serializer = ProductSerializer(product, data = request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':
            product.delete()
            return Response({'message':'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    print("Request hit to cart")
    print(f"user {user}")
    print(f"Request Type: {request.method}")
    if request.method == 'POST':
        try:
            if user.role != 'customer':
                return Response({'error':'Permission Denied Only cutomer can access Cart'},status=status.HTTP_403_FORBIDDEN)
            product_id = request.data.get('product_id')
            print(f"product ID ;- {product_id}")
            if not product_id:
                return Response({'err':'producyt_id is required'},status=status.HTTP_400_BAD_REQUEST)
            quantity = int(request.data.get('quantity', 1))
            product = Product.objects.filter(id = product_id).first()
            if not product:
                return Response({'meesage':'Product Not Found'},status=status.HTTP_404_NOT_FOUND)

            cart, created = Cart.objects.get_or_create(user=user)
            print(f"Cart found/created: {cart}")
            cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()
            print(f"Whats in cart item{cart_item}")
            if cart_item:
                print(f"Inside If cart_item!!")

                new_quantity = cart_item.quantity + int(quantity)
                if new_quantity <= 0:
                    cart_item.delete()
                    cart_items_data = []
                else:
                    cart_item.quantity = new_quantity
                    cart_item.save()
                    cart_items_data = CartItemSerializer(cart_item).data
                
            else:
                cart_item=CartItem.objects.create(cart=cart,product_id=product_id,quantity=quantity)
                cart_items_data = CartItemSerializer(cart_item).data
            
            return Response({'message':'product added to Cart','cart_items':cart_items_data},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error':str(e)}, status=status.HTTP_400_BAD_REQUEST)