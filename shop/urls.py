from django.urls import path
from . import views, views_auth


urlpatterns = [
    path('signup/' ,views_auth.signup ,name='signup'),
    path('login/' ,views_auth.CustomAuthToken.as_view(), name='login'),
    path('logout/' ,views_auth.logout, name='logout'),

    path('products/', views.product_list, name='product-list'),
    path('products/<int:pk>', views.product_details, name='product-details'),
]
