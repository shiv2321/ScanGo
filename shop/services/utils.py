from rest_framework.pagination import PageNumberPagination

def is_admin(user):
    return user.role.lower() == "admin"


def is_customer(user):
    return user.role.lower() == "customer"

def paginate_queryset(queryset, request, serializer_class, page_size = 5):
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    result_page = paginator.paginate_queryset(queryset,request)    
    serializer = serializer_class(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def get_products(db_obj, serializer_class):
    products = db_obj.objects.all()
    serializer = serializer_class(products, many=True)
    return serializer.data

def create_product(request, class_serializer):
    serializer = class_serializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        data = serializer.data
        status = True
        return status, data
    status = False
    return status, serializer.error
    