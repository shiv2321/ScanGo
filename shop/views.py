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

@api_view(['POST', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    print("Request hit to cart")
    print(f"user {user}")
    print(f"Request Type: {request.method}")
    if user.role != 'customer':
        return Response({'error':'Permission Denied Only cutomer can access Cart'},status=status.HTTP_403_FORBIDDEN)
    try:
        product_id = request.data.get('product_id')
        print(f"product ID ;- {product_id}")
        if not product_id:
            return Response({'err':'producyt_id is required'},status=status.HTTP_400_BAD_REQUEST)
        quantity = int(request.data.get('quantity', 1))
        if quantity < 0:
            return Response(
                {
                    'message':f'quantity cannot be less than 0'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        product = Product.objects.filter(id = product_id).first()
        if not product:
            return Response({'meesage':'Product Not Found'},status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=user)
        print(f"Cart found/created: {cart}")
        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()
        print(f"Whats in cart item{cart_item}")
        if request.method == 'POST':
            if cart_item:
                cart_item.quantity += quantity
                cart_item.save()
            else:
                cart_item = CartItem.objects.create(cart=cart, product=product, quantity=quantity)
                serializer = CartItemSerializer(cart_item)
            return Response(
                    {
                        'message':'Product Added to Cart',
                        'cart_item':serializer.data
                    },
                    status=status.HTTP_200_OK
                )
                
        elif request.method == 'PUT':
                print("Inside Put condition block")
                if not cart_item:
                    return Response(
                        {'message':'Product Not found in cart'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity += 1
                cart_item.save()
                serializer = CartItemSerializer(cart_item)
                
                return Response({'message':'product quantity increased by 1','cart_items':serializer.data},status=status.HTTP_200_OK)
    except Exception as e:
            print(f"Error from addcart: {e}")
            return Response({'error':str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_cart_items(request):
    user = request.user
    if user.role != 'customer':
        return Response({'message: Only Customer can view cart'}, status=status.HTTP_403_FORBIDDEN)
    try:
        cart = Cart.objects.get(user=user)
        cart_items = CartItem.objects.filter(cart=cart)

    except Cart.DoesNotExist as e:
        return Response({'error':'Cart is Empty'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = CartItemSerializer(cart_items, many=True)
    total = sum([item.product.price * item.quantity for item in cart_items]) 
    return Response({'cart items':serializer.data, 'total':total})


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def delete_cart_item(request, pk):
    user = request.user
    print(user)
    if user.role != 'customer':
        return Response({'message: Only Customer can delete the items'}, status=status.HTTP_403_FORBIDDEN)
    try:
        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart,pk=pk)
        product_name = cart_item.product.name
        print(cart_item)
        if request.method == 'PUT':
            if cart_item.quantity > 1:
                print(cart_item.quantity)
                cart_item.quantity -=1 
                cart_item.save()
                
                return Response({'message':f'Item quantity of {product_name} reduced by 1'}, status=status.HTTP_200_OK)
            else:
                cart_item.delete()
                return Response({
                    'message':f'{product_name} deleted coz it as 1'
                }, status=status.HTTP_200_OK)
        elif request.method == 'DELETE':
                print("Got a delete request")
                cart_item.delete()
        return Response({'message':f'{product_name} deleted successfully from cart'}, status=status.HTTP_100_CONTINUE)
    except Cart.DoesNotExist:
        return Response({'messgae':'cart not found'})
    except CartItem.DoesNotExist:
        return Response({'messgae':'cart item not found'})
    except Exception as e:
        print(f"Error in deleting cart: {e}")
        return Response({'error':f'{str(e)}'})