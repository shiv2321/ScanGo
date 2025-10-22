from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['POST'])
def signup(request):

    data = request.data
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'customer')
    phone = data.get('phone', '')

    if not username or not password:
        return Response({'error':'Username and password required!'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error':'Username already exists!'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username,password=password,role=role,phone=phone)
    token , created = Token.objects.get_or_create(user=user)

    return Response({'message':'user created successfully','user': {
        'id':user.id,
        'username':user.username,
        'role':user.role,
        'phone':user.phone
        },
        'token':token.key,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()
    return Response({'message':'Loggedout sucessfully'},status=status.HTTP_200_OK)



class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args,**kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token']) 
        return Response({
            'token':token.key,
            'user_id':token.user_id,
            'name':token.user.username,
            'email':token.user.email,
            'role':token.user.role,
        })
    