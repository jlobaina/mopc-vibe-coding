"""
URL configuration for the authentication app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change_password'),

    # User management endpoints
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/permissions/', views.user_permissions, name='user-permissions'),
    path('users/<uuid:userId>/permissions/', views.assign_permissions, name='assign-permissions'),
    path('users/stats/', views.user_stats, name='user-stats'),

    # Department endpoints
    path('departments/', views.DepartmentListView.as_view(), name='department-list'),
    path('departments/<uuid:pk>/', views.DepartmentDetailView.as_view(), name='department-detail'),
    path('departments/<uuid:department_id>/users/', views.department_users, name='department-users'),
    path('departments/users/', views.department_users, name='my-department-users'),

    # Permission endpoints
    path('permissions/', views.PermissionListView.as_view(), name='permission-list'),
]