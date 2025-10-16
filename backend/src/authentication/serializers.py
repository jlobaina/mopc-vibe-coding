"""
Serializers for the authentication app.
Handles data serialization for API responses and requests.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from core.models import User, Department, Permission, UserPermission


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )

            if not user:
                msg = _('Invalid credentials provided.')
                raise serializers.ValidationError(msg, code='authorization')

            if not user.is_active:
                msg = _('User account is disabled.')
                raise serializers.ValidationError(msg, code='authorization')

            attrs['user'] = user
            return attrs
        else:
            msg = _('Must include email and password.')
            raise serializers.ValidationError(msg, code='authorization')


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model."""
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description', 'workflow_order',
            'can_process_parallel', 'response_time_hours', 'is_active'
        ]
        read_only_fields = ['id']


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for Permission model."""
    class Meta:
        model = Permission
        fields = [
            'id', 'name', 'description', 'resource', 'action', 'is_active'
        ]
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with basic information."""
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    permissions = PermissionSerializer(many=True, read_only=True, source='userpermission_set.permission')

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'cedula', 'department', 'department_name', 'role', 'is_active',
            'last_login', 'created_at', 'permissions'
        ]
        read_only_fields = [
            'id', 'last_login', 'created_at', 'full_name', 'department_name'
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    permissions = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        allow_empty=True
    )

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'cedula',
            'department', 'role', 'password', 'password_confirm',
            'permissions', 'is_active'
        ]

    def validate_email(self, value):
        """Validate email uniqueness."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists."))
        return value

    def validate_cedula(self, value):
        """Validate cedula uniqueness."""
        if User.objects.filter(cedula=value).exists():
            raise serializers.ValidationError(_("A user with this cedula already exists."))
        return value

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': _("Password confirmation doesn't match.")
            })
        return attrs

    def create(self, validated_data):
        """Create user with permissions."""
        permissions_data = validated_data.pop('permissions', [])
        validated_data.pop('password_confirm')

        user = User.objects.create_user(**validated_data)

        # Assign permissions
        for permission_id in permissions_data:
            try:
                permission = Permission.objects.get(id=permission_id, is_active=True)
                UserPermission.objects.create(user=user, permission=permission)
            except Permission.DoesNotExist:
                continue

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing users."""
    permissions = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    current_password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'cedula', 'department', 'role',
            'is_active', 'permissions', 'current_password', 'new_password',
            'new_password_confirm'
        ]

    def validate(self, attrs):
        """Validate password change."""
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')
        current_password = attrs.get('current_password')

        if new_password or new_password_confirm:
            if not current_password:
                raise serializers.ValidationError({
                    'current_password': _("Current password is required to change password.")
                })

            if new_password != new_password_confirm:
                raise serializers.ValidationError({
                    'new_password_confirm': _("Password confirmation doesn't match.")
                })

            # Validate current password
            if not self.instance.check_password(current_password):
                raise serializers.ValidationError({
                    'current_password': _("Current password is incorrect.")
                })

        return attrs

    def update(self, instance, validated_data):
        """Update user and permissions."""
        permissions_data = validated_data.pop('permissions', None)

        # Handle password change
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('new_password_confirm', None)
        validated_data.pop('current_password', None)

        if new_password:
            instance.set_password(new_password)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update permissions if provided
        if permissions_data is not None:
            # Remove existing permissions
            instance.userpermission_set.all().delete()

            # Add new permissions
            for permission_id in permissions_data:
                try:
                    permission = Permission.objects.get(id=permission_id, is_active=True)
                    UserPermission.objects.create(user=instance, permission=permission)
                except Permission.DoesNotExist:
                    continue

        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile view/update."""
    department_name = serializers.CharField(source='department.name', read_only=True)
    permissions = PermissionSerializer(many=True, read_only=True, source='userpermission_set.permission')

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'cedula',
            'department', 'department_name', 'role', 'is_active',
            'last_login', 'created_at', 'permissions'
        ]
        read_only_fields = [
            'id', 'email', 'cedula', 'department', 'role',
            'is_active', 'last_login', 'created_at'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    current_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_current_password(self, value):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Current password is incorrect."))
        return value

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs.get('new_password') != attrs.get('new_password_confirm'):
            raise serializers.ValidationError({
                'new_password_confirm': _("Password confirmation doesn't match.")
            })
        return attrs

    def save(self):
        """Change user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class TokenRefreshSerializer(serializers.Serializer):
    """Serializer for token refresh."""
    refresh_token = serializers.CharField(required=True)


class LogoutSerializer(serializers.Serializer):
    """Serializer for logout."""
    refresh_token = serializers.CharField(required=True)