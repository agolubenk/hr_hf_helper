from django.urls import path
from . import views

app_name = 'wiki'

urlpatterns = [
    path('', views.wiki_list, name='list'),
    path('page/<slug:slug>/', views.wiki_page_detail, name='page_detail'),
    path('page/<slug:slug>/edit/', views.wiki_page_edit, name='page_edit'),
    path('page/<slug:slug>/delete/', views.wiki_page_delete, name='page_delete'),
    path('create/', views.wiki_page_edit, name='page_create'),
    path('tags/create/', views.wiki_tag_create_api, name='tag_create_api'),
]

