from django.contrib import admin
from .models import Department, User, Permission, UserPermission, WorkflowState, Notification, AuditLog


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'workflow_order', 'can_process_parallel', 'response_time_hours', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    list_filter = ['is_active', 'can_process_parallel', 'created_at']
    ordering = ['workflow_order', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'cedula', 'department', 'role', 'is_active', 'last_login', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'cedula', 'role']
    list_filter = ['is_active', 'department', 'role', 'created_at', 'last_login']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_login']
    fieldsets = (
        (None, {
            'fields': ('email', 'first_name', 'last_name', 'cedula')
        }),
        ('Employment', {
            'fields': ('department', 'role', 'is_active')
        }),
        ('System', {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


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


@admin.register(WorkflowState)
class WorkflowStateAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'is_final', 'color', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['is_final', 'created_at']
    ordering = ['order', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'type', 'is_read', 'expediente', 'created_at']
    search_fields = ['title', 'message', 'user__email', 'user__first_name', 'user__last_name']
    list_filter = ['type', 'is_read', 'created_at']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'read_at']
    date_hierarchy = 'created_at'


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action_type', 'table_name', 'record_id', 'user', 'ip_address', 'created_at']
    search_fields = ['table_name', 'user__email', 'user__first_name', 'user__last_name', 'ip_address']
    list_filter = ['action_type', 'table_name', 'created_at']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False