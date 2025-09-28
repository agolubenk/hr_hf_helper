from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import NotionSettings, NotionPage, NotionSyncLog, NotionBulkImport
from .serializers import (
    NotionSettingsSerializer, NotionPageSerializer, NotionSyncLogSerializer,
    NotionBulkImportSerializer, NotionStatsSerializer
)
from logic.integration.notion.notion_api import (
    NotionSettingsViewSet as LogicNotionSettingsViewSet,
    NotionPageViewSet as LogicNotionPageViewSet,
    NotionSyncLogViewSet as LogicNotionSyncLogViewSet,
    NotionBulkImportViewSet as LogicNotionBulkImportViewSet
)

User = get_user_model()


class NotionSettingsViewSet(LogicNotionSettingsViewSet):
    """ViewSet для управления настройками Notion - расширенная версия"""
    permission_classes = [permissions.IsAuthenticated]


class NotionPageViewSet(LogicNotionPageViewSet):
    """ViewSet для управления страницами Notion - расширенная версия"""
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    search_fields = ['title', 'content']
    ordering_fields = ['created_time', 'last_edited_time']
    ordering = ['-last_edited_time']


class NotionSyncLogViewSet(LogicNotionSyncLogViewSet):
    """ViewSet для просмотра логов синхронизации Notion - расширенная версия"""
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    search_fields = ['message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class NotionBulkImportViewSet(LogicNotionBulkImportViewSet):
    """ViewSet для управления массовым импортом Notion - расширенная версия"""
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']