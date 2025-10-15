from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer

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


