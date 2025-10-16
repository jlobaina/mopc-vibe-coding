"""
URL configuration for Workflow API endpoints.
Defines URL patterns for the complete 16-step expropriation workflow.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'expedientes', views.ExpedienteViewSet, basename='expediente')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'transitions', views.WorkflowTransitionViewSet, basename='workflow-transition')
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'workflow-states', views.WorkflowStateViewSet, basename='workflow-state')

app_name = 'workflow'

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),

    # Custom action routes are automatically included by the router
    # expedientes/<pk>/workflow_context/
    # expedientes/<pk>/transition/
    # expedientes/<pk>/history/
    # expedientes/<pk>/assign_task/
    # expedientes/<pk>/tasks/
    # expedientes/analytics/
    # tasks/<pk>/complete/
    # tasks/<pk>/assign/
    # tasks/<pk>/dependencies/
    # tasks/<pk>/add_dependency/
    # tasks/my_tasks/
    # tasks/department_tasks/
    # departments/<pk>/statistics/
]

# Add format suffix patterns for API
urlpatterns = format_suffix_patterns(urlpatterns)