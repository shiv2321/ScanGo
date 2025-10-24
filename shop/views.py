from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Cart, CartItem, User, Order
from .serializers import ProductSerializer, CartItemSerializer, UserSerializer, OrderSerializer
from .services.utils import is_admin, is_customer, paginate_queryset, get_products, create_product
from .services.mail_util import otp_verify_service, mail_service
# Create your views here.



@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    if request.method == 'GET':
        data = get_products(Product, ProductSerializer)
        return Response(data)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def prduct_create(request):
    user = request.user
    if request.method == 'POST':
        if not is_admin(user):
            return Response({'error':'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)
        created, data = create_product(request, ProductSerializer)
        if created:
            return Response(data, status=status.HTTP_201_CREATED)
        else:
            return Response(data, status=status.HTTP_400_BAD_REQUEST)


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
        if not is_admin(user):
            return Response({'error':'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)
        

        if request.method == 'PUT':
            serializer = ProductSerializer(product, data = request.data, partial = True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':
            product.delete()
            return Response({'message':'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    print("Add to cart function called!!!!!!!!")
    if not is_customer(user):
        return Response({'error':'Permission Denied Only cutomer can access Cart'},status=status.HTTP_403_FORBIDDEN)
    try:
        product_id = request.data.get('product_id')
        qr_code = request.data.get('qr_code')
        quantity = int(request.data.get('quantity', 1))
        print(request.data)
        if quantity < 1:
            return Response(
                {
                    'message':f'quantity cannot be less than 1'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        if product_id:
            product = Product.objects.filter(id = product_id).first()
        elif qr_code:
            product = Product.objects.filter(qr_code_value=qr_code).first()
        else:
            return Response(
                {
                    'message':'product id or product qr is required'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        if not product:
            return Response({'message':'Product Not Found'},status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=user)        
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if request.method == 'POST':
            if created:
                cart_item.quantity = quantity
            else:
                cart_item.quantity += quantity
            
            cart_item.save()
            
            serializer = CartItemSerializer(cart_item)
            return Response(
                    {
                        'message':'Product Added to Cart',
                        'cart_item':serializer.data
                    },
                    status=status.HTTP_200_OK
                )
                
        elif request.method == 'PUT':
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
    if not is_customer(user):
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
    if not is_customer(user):
        return Response({'message: Only Customer can delete the items'}, status=status.HTTP_403_FORBIDDEN)
    try:

        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart,pk=pk)
        print(f"{cart_item} from delete cart")
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
    



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_all_users(request):
    user = request.user
    if not is_admin(user):
        return Response({'message':'Only Admin can access users this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all().order_by('-id')
    return paginate_queryset(users, request, UserSerializer)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_all_orders(request):
    user = request.user
    if not is_admin(user):
        return Response({'message':'Only Admin can access users this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    orders = Order.objects.all().order_by('-created_at')
    return paginate_queryset(orders, request, OrderSerializer)


from django.db import transaction
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def check_out(request):
    user = request.user
    if not is_customer(user):
        return Response({'message':'Only Customer can access users this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    try:
        with transaction.atomic():
            cart = Cart.objects.get(user=user)
            cart_items = CartItem.objects.filter(cart=cart)
            if not cart_items.exists():
                return Response(
                    {
                        'message':'Cart is Empty'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            """order_details = [
                {
                    "product":{
                        'name':item.product.name,
                        "quantity":item.quantity,
                        "price":item.product.price,
                        
                    },
                    "total":item.product.price * item.quantity
                } for item in cart_items 
            ]"""
            from .models import OrderItem
            #serializer = CartItemSerializer(cart_items, many=True)
            total_amount = sum([item.product.price * item.quantity for item in cart_items]) 
            #products = [item.product for item in cart_items]
            order = Order.objects.create(user=user, total_amount=total_amount,status='pending')
            #order.products.set(products)
            order_details = []
            for item in cart_items:
                order_item = OrderItem.objects.create(
                    order = order,
                    product = item.product,
                    quantity = item.quantity,
                    price = item.product.price
                )
                order_details.append(
                    {
                        "product":item.product.name,
                        "quantity":item.quantity,
                        "price":float(item.product.price),
                        "totaL":float(item.product.price * item.quantity)
                    }
                )
            cart_items.delete()

            return Response(
                {
                    'message':'Your Order Placed sucessfully', 
                    'order_id': order.id,
                    'total_amount': float(total_amount),
                    'items': order_details
                }, 
                status=status.HTTP_201_CREATED)
    except Cart.DoesNotExist:
        return Response(
            {
                'error':'Cart not Found'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {
                'error':f'There is an problem placing the order {str(e)}'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['POST'])
def send_email_otp(request):
    email = request.data.get('email')
    flag, message = mail_service(email)
    if not flag:
        return Response({"message":message}, status=status.HTTP_400_BAD_REQUEST)
    if flag:
        return Response({"message":message},status=status.HTTP_200_OK)
    

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    flag, message = otp_verify_service(email, otp)
    if not flag:
        return Response({'verified':flag, "message":message}, status=status.HTTP_400_BAD_REQUEST)
    
    if flag:
        return Response({'verified':flag, 'message':message})