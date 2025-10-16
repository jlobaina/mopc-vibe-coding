"""
Custom permission classes for role-based access control.
Implements department-based permissions for the MOPC system.
"""

from rest_framework import permissions
from django.utils.translation import gettext_lazy as _
from core.models import User, Permission, UserPermission


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to object owners or administrators.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner or admins.
        return obj == request.user or request.user.is_superuser


class HasDepartmentPermission(permissions.BasePermission):
    """
    Checks if user has specific permission for a resource in their department.
    """

    def __init__(self, resource, action):
        self.resource = resource
        self.action = action

    def has_permission(self, request, view):
        """
        Return `True` if permission is granted, `False` otherwise.
        """
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers have all permissions
        if request.user.is_superuser:
            return True

        # Check if user has the specific permission
        user_permissions = UserPermission.objects.filter(
            user=request.user,
            permission__resource=self.resource,
            permission__action=self.action,
            permission__is_active=True
        ).select_related('permission')

        return user_permissions.exists()

    def has_object_permission(self, request, view, obj):
        """
        Object-level permission check.
        """
        # First check basic permission
        if not self.has_permission(request, view):
            return False

        # Superusers have all permissions
        if request.user.is_superuser:
            return True

        # Check department-specific permissions
        if hasattr(obj, 'department'):
            # User can only access objects in their department
            # unless they're a department head or supervisor
            if obj.department != request.user.department:
                if request.user.role not in ['department_head', 'supervisor', 'admin']:
                    return False

        elif hasattr(obj, 'departamento_actual'):
            # For workflow objects
            if obj.departamento_actual != request.user.department:
                if request.user.role not in ['department_head', 'supervisor', 'admin']:
                    return False

        elif hasattr(obj, 'departamento'):
            # For task objects
            if obj.departamento != request.user.department:
                if request.user.role not in ['department_head', 'supervisor', 'admin']:
                    return False

        return True


class IsDepartmentHead(permissions.BasePermission):
    """
    Allows access only to department heads or administrators.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return (
            request.user.is_superuser or
            request.user.role in ['department_head', 'admin', 'supervisor']
        )


class IsInSameDepartment(permissions.BasePermission):
    """
    Allows access only to users in the same department or administrators.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers have all permissions
        if request.user.is_superuser:
            return True

        # Check if object has department
        obj_department = None
        if hasattr(obj, 'department'):
            obj_department = obj.department
        elif hasattr(obj, 'departamento'):
            obj_department = obj.departamento
        elif hasattr(obj, 'departamento_actual'):
            obj_department = obj.departamento_actual
        elif hasattr(obj, 'user') and hasattr(obj.user, 'department'):
            obj_department = obj.user.department

        # If no department found, deny access
        if not obj_department:
            return False

        # Allow access if same department
        return obj_department == request.user.department


class CanManageUsers(permissions.BasePermission):
    """
    Allows user management based on role and department.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers can manage all users
        if request.user.is_superuser:
            return True

        # Department heads can manage users in their department
        if request.user.role in ['department_head', 'supervisor']:
            return True

        # Check specific permission
        return UserPermission.objects.filter(
            user=request.user,
            permission__resource='user',
            permission__action__in=['crear', 'actualizar', 'eliminar'],
            permission__is_active=True
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers can manage all users
        if request.user.is_superuser:
            return True

        # Users can always manage their own profile
        if obj == request.user:
            return True

        # Department heads can manage users in their department
        if request.user.role in ['department_head', 'supervisor']:
            return obj.department == request.user.department

        return False


class CanManageExpedientes(permissions.BasePermission):
    """
    Allows expediente management based on role and department.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers can manage all expedientes
        if request.user.is_superuser:
            return True

        # Check if user has expediente permissions
        return UserPermission.objects.filter(
            user=request.user,
            permission__resource='expediente',
            permission__action__in=['crear', 'leer', 'actualizar', 'eliminar'],
            permission__is_active=True
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers can manage all expedientes
        if request.user.is_superuser:
            return True

        # Users can access expedientes in their current department
        if obj.departamento_actual == request.user.department:
            return True

        # Department heads can access all expedientes in their department
        if request.user.role in ['department_head', 'supervisor']:
            return True

        # Check for read permissions on completed expedientes
        if request.method in permissions.SAFE_METHODS:
            return UserPermission.objects.filter(
                user=request.user,
                permission__resource='expediente',
                permission__action='leer',
                permission__is_active=True
            ).exists()

        return False


class CanManageDocuments(permissions.BasePermission):
    """
    Allows document management based on role and department.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers can manage all documents
        if request.user.is_superuser:
            return True

        # Check if user has document permissions
        return UserPermission.objects.filter(
            user=request.user,
            permission__resource='documento',
            permission__action__in=['crear', 'leer', 'actualizar', 'eliminar'],
            permission__is_active=True
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers can manage all documents
        if request.user.is_superuser:
            return True

        # Users can access documents from expedientes in their department
        if obj.expediente.departamento_actual == request.user.department:
            return True

        # Department heads can access all documents in their department
        if request.user.role in ['department_head', 'supervisor']:
            return True

        # Document uploaders can always access their own documents
        if obj.uploaded_by == request.user:
            return True

        return False


class CanAccessReports(permissions.BasePermission):
    """
    Allows access to reports and analytics.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers can access all reports
        if request.user.is_superuser:
            return True

        # Department heads and supervisors can access reports
        if request.user.role in ['department_head', 'supervisor', 'admin']:
            return True

        # Check specific permission
        return UserPermission.objects.filter(
            user=request.user,
            permission__resource='report',
            permission__action='leer',
            permission__is_active=True
        ).exists()


class IsAuthenticatedActive(permissions.BasePermission):
    """
    Allows access only to authenticated and active users.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_active
        )


def get_user_permissions(user):
    """
    Get all permissions for a user.
    """
    return UserPermission.objects.filter(
        user=user,
        permission__is_active=True
    ).select_related('permission')


def has_permission(user, resource, action):
    """
    Check if a user has a specific permission.
    """
    if user.is_superuser:
        return True

    return UserPermission.objects.filter(
        user=user,
        permission__resource=resource,
        permission__action=action,
        permission__is_active=True
    ).exists()


def can_access_department(user, department):
    """
    Check if a user can access a specific department.
    """
    if user.is_superuser:
        return True

    if user.role in ['department_head', 'supervisor', 'admin']:
        return True

    return user.department == department