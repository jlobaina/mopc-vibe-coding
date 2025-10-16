"""
URL configuration for document management API.
Defines RESTful endpoints for document operations.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'types', views.DocumentTypeViewSet, basename='document-type')
router.register(r'documents', views.DocumentViewSet, basename='document')
router.register(r'reviews', views.DocumentReviewViewSet, basename='document-review')
router.register(r'templates', views.DocumentTemplateViewSet, basename='document-template')
router.register(r'access-logs', views.DocumentAccessLogViewSet, basename='document-access-log')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]

# Add format suffix patterns for API documentation
urlpatterns = format_suffix_patterns(urlpatterns)