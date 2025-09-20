from django.urls import path
from .views_simple import simple_api_login, simple_api_logout

urlpatterns = [
    path('login/', simple_api_login, name='simple_login'),
    path('logout/', simple_api_logout, name='simple_logout'),
]
