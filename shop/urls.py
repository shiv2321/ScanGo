from django.urls import path
from . import views, views_auth


urlpatterns = [
    path('signup/' ,views_auth.signup ,name='signup'),
    path('login/' ,views_auth.CustomAuthToken.as_view(), name='login'),
    path('logout/' ,views_auth.logout, name='logout'),
    path('send-admin-otp/', views.send_email_otp, name='send-otp'),
    path('verify-admin-otp/', views.verify_otp, name='verify-otp'),
    

    path('products/', views.product_list, name='product-list'),
    path('new_product/', views.prduct_create, name='new-product'),
    path('products_details/<int:pk>/', views.product_details, name='product-details'),



    path('addtocart/',views.add_to_cart, name='add-to-cart'),
    path('scanned_product/', views.add_to_cart, name='scanned-product'),
    path('getcart/', views.get_cart_items, name='get-cart'),
    path('deletecart/<int:pk>', views.delete_cart_item, name='delete-cart'),
    path('checkout/', views.check_out, name='check-out'),


    path('admin/users/', views.get_all_users, name='get-all-users'),    
    path('admin/orders/', views.get_all_orders, name='get-all-orders'),
    path('management/', views.qr_code_list, name='get-all-qrs'),
    
]
