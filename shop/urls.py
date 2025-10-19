from django.urls import path
from . import views, views_auth


urlpatterns = [
    path('signup/' ,views_auth.signup ,name='signup'),
    path('login/' ,views_auth.CustomAuthToken.as_view(), name='login'),
    path('logout/' ,views_auth.logout, name='logout'),

    path('products/', views.product_list, name='product-list'),
    path('products/<int:pk>', views.product_details, name='product-details'),



    path('addtocart/',views.add_to_cart, name='add-to-cart'),
    path('scanned_product/', views.add_to_cart, name='scanned-product'),
    path('getcart/', views.get_cart_items, name='get-cart'),
    path('deletecart/<int:pk>', views.delete_cart_item, name='delete-cart'),
    path('checkout/', views.check_out, name='check-out'),


    path('admin/users/', views.get_all_users, name='get-all-users'),    
    path('admin/orders/', views.get_all_orders, name='get-all-orders'),
]
