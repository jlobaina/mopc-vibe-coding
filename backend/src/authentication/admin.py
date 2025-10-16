from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from core.models import User, Department, Permission, UserPermission


# Custom User admin that extends the base Django User admin
@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = [
        'email', 'first_name', 'last_name', 'cedula',
        'department', 'role', 'is_active', 'last_login', 'created_at'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'cedula', 'role']
    list_filter = ['is_active', 'department', 'role', 'created_at', 'last_login']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_login']

    fieldsets = (
        (None, {
            'fields': ('email', 'first_name', 'last_name', 'cedula', 'password')
        }),
        ('Employment', {
            'fields': ('department', 'role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
        ('System', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'cedula', 'password1', 'password2'),
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('department')


# If you want to manage permissions through the authentication admin interface
@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'resource', 'action', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'resource', 'action']
    list_filter = ['resource', 'action', 'is_active', 'created_at']
    ordering = ['resource', 'action']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(UserPermission)
class UserPermissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'permission', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'permission__name']
    list_filter = ['permission__resource', 'permission__action', 'created_at']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'permission')