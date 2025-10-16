"""
API views for authentication and user management.
Handles login, logout, user CRUD operations, and permissions.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import login, logout
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db import transaction

from core.models import User, Department, Permission, UserPermission
from .serializers import (
    LoginSerializer, UserSerializer, UserCreateSerializer,
    UserUpdateSerializer, UserProfileSerializer, ChangePasswordSerializer,
    DepartmentSerializer, PermissionSerializer, LogoutSerializer
)
from .permissions import IsOwnerOrAdmin, HasDepartmentPermission


class LoginView(TokenObtainPairView):
    """Custom login view that uses email instead of username."""
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        """Handle user login and return JWT tokens."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        # Log the user in
        login(request, user)

        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user, context={'request': request}).data
        })


class LogoutView(generics.GenericAPIView):
    """Logout view that blacklists the refresh token."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        """Handle user logout."""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            logout(request)
            return Response(
                {'message': _('Successfully logged out.')},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': _('Error during logout.')},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View and update current user profile."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        """Return current user."""
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """Change user password."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        """Handle password change."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {'message': _('Password changed successfully.')},
            status=status.HTTP_200_OK
        )


class UserListView(generics.ListCreateAPIView):
    """List and create users."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all().select_related('department')

    def get_serializer_class(self):
        """Return appropriate serializer based on request method."""
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        """Set permissions based on request method."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), HasDepartmentPermission('user', 'crear')]
        return [permissions.IsAuthenticated(), HasDepartmentPermission('user', 'leer')]

    def get_queryset(self):
        """Filter users based on department permissions."""
        user = self.request.user

        # Superusers can see all users
        if user.is_superuser:
            return User.objects.all().select_related('department')

        # Department heads can see users from their department
        if user.role in ['department_head', 'supervisor']:
            return User.objects.filter(department=user.department).select_related('department')

        # Regular users can only see themselves
        return User.objects.filter(id=user.id).select_related('department')


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve, update, or delete a specific user."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all().select_related('department')

    def get_serializer_class(self):
        """Return appropriate serializer based on request method."""
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        """Set permissions based on request method."""
        if self.request.method in ['PUT', 'PATCH']:
            if self.request.user.id == self.get_object().id:
                return [permissions.IsAuthenticated()]
            return [permissions.IsAuthenticated(), HasDepartmentPermission('user', 'actualizar')]

        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), HasDepartmentPermission('user', 'eliminar')]

        return [permissions.IsAuthenticated(), HasDepartmentPermission('user', 'leer')]


class DepartmentListView(generics.ListCreateAPIView):
    """List and create departments."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        """Set permissions based on request method."""
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), HasDepartmentPermission('department', 'crear')]
        return [permissions.IsAuthenticated(), HasDepartmentPermission('department', 'leer')]


class DepartmentDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve, update, or delete a specific department."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        """Set permissions based on request method."""
        if self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated(), HasDepartmentPermission('department', 'actualizar')]

        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), HasDepartmentPermission('department', 'eliminar')]

        return [permissions.IsAuthenticated(), HasDepartmentPermission('department', 'leer')]


class PermissionListView(generics.ListAPIView):
    """List all available permissions."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Permission.objects.filter(is_active=True)
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated, HasDepartmentPermission('permission', 'leer')]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_permissions(request):
    """Get current user's permissions."""
    user = request.user
    user_permissions = user.userpermission_set.select_related('permission').all()

    permissions_data = [
        {
            'id': perm.permission.id,
            'name': perm.permission.name,
            'resource': perm.permission.resource,
            'action': perm.permission.action
        }
        for perm in user_permissions
    ]

    return Response({
        'permissions': permissions_data,
        'role': user.role,
        'department': {
            'id': user.department.id,
            'name': user.department.name,
            'code': user.department.code
        } if user.department else None
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def department_users(request, department_id=None):
    """Get users in a specific department."""
    if department_id:
        # Get users for specific department
        try:
            department = Department.objects.get(id=department_id)
            users = User.objects.filter(department=department, is_active=True)
        except Department.DoesNotExist:
            return Response(
                {'error': _('Department not found.')},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        # Get users in current user's department
        users = User.objects.filter(
            department=request.user.department,
            is_active=True
        )

    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics for dashboard."""
    user = request.user

    # Basic stats
    total_users = User.objects.filter(is_active=True).count()
    department_users = User.objects.filter(
        department=user.department,
        is_active=True
    ).count() if user.department else 0

    # Department breakdown
    department_stats = []
    if user.role in ['admin', 'supervisor']:
        departments = Department.objects.filter(is_active=True)
        for dept in departments:
            dept_users = User.objects.filter(department=dept, is_active=True).count()
            department_stats.append({
                'department': dept.name,
                'users': dept_users
            })

    return Response({
        'total_users': total_users,
        'department_users': department_users,
        'department_stats': department_stats
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_permissions(request, user_id):
    """Assign permissions to a user."""
    if not HasDepartmentPermission('user', 'actualizar').has_permission(request, None):
        return Response(
            {'error': _('Permission denied.')},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = User.objects.get(id=user_id)
        permission_ids = request.data.get('permissions', [])

        with transaction.atomic():
            # Remove existing permissions
            user.userpermission_set.all().delete()

            # Add new permissions
            for permission_id in permission_ids:
                try:
                    permission = Permission.objects.get(id=permission_id, is_active=True)
                    UserPermission.objects.create(user=user, permission=permission)
                except Permission.DoesNotExist:
                    continue

        return Response({
            'message': _('Permissions assigned successfully.'),
            'user': UserSerializer(user, context={'request': request}).data
        })

    except User.DoesNotExist:
        return Response(
            {'error': _('User not found.')},
            status=status.HTTP_404_NOT_FOUND
        )