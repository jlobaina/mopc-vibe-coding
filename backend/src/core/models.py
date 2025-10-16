"""
Core Django models for MOPC Expropriation Management System.
This module defines the base models and shared functionality.
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """
    Abstract base class that provides self-updating created and modified fields.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated at"))

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    Abstract base class that provides soft delete functionality.
    """
    is_deleted = models.BooleanField(default=False, verbose_name=_("Is deleted"))
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Deleted at"))

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """Override delete to perform soft delete."""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self, using=None, keep_parents=False):
        """Perform actual database deletion."""
        super().delete(using=using, keep_parents=keep_parents)


class Department(TimeStampedModel):
    """
    Represents a government department in the expropriation process.
    Based on the 16-step workflow analysis from PRD.
    """
    name = models.CharField(max_length=100, verbose_name=_("Department Name"))
    code = models.CharField(max_length=20, unique=True, verbose_name=_("Department Code"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    workflow_order = models.PositiveIntegerField(verbose_name=_("Workflow Order"))
    can_process_parallel = models.BooleanField(
        default=False,
        verbose_name=_("Can Process Parallel"),
        help_text=_("Whether this department can process simultaneously with others")
    )
    response_time_hours = models.PositiveIntegerField(
        default=48,
        verbose_name=_("Response Time (Hours)"),
        help_text=_("Standard time limit for this department to respond")
    )
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))

    class Meta:
        db_table = 'departamentos'
        verbose_name = _("Department")
        verbose_name_plural = _("Departments")
        ordering = ['workflow_order']

    def __str__(self):
        return self.name


class User(AbstractUser, TimeStampedModel):
    """
    Custom user model with department and role-based access control.
    Extends Django's AbstractUser for authentication.
    """
    first_name = models.CharField(max_length=100, verbose_name=_("First Name"))
    last_name = models.CharField(max_length=100, verbose_name=_("Last Name"))
    email = models.EmailField(unique=True, verbose_name=_("Email"))
    cedula = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("Cedula"),
        help_text=_("Dominican Republic identification number")
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_("Department")
    )
    role = models.CharField(
        max_length=50,
        verbose_name=_("Role"),
        help_text=_("User role within the department")
    )
    last_login = models.DateTimeField(null=True, blank=True, verbose_name=_("Last Login"))
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'cedula']

    class Meta:
        db_table = 'usuarios'
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class Permission(TimeStampedModel):
    """
    Defines granular permissions for role-based access control.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name=_("Permission Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    resource = models.CharField(
        max_length=50,
        verbose_name=_("Resource"),
        help_text=_("Resource this permission applies to (e.g., expediente, documento)")
    )
    action = models.CharField(
        max_length=50,
        verbose_name=_("Action"),
        help_text=_("Action allowed (e.g., crear, leer, actualizar, eliminar)")
    )
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))

    class Meta:
        db_table = 'permisos'
        verbose_name = _("Permission")
        verbose_name_plural = _("Permissions")
        unique_together = ['resource', 'action']

    def __str__(self):
        return f"{self.action} {self.resource}"


class UserPermission(TimeStampedModel):
    """
    Junction table for user-permission relationships.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("User"))
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, verbose_name=_("Permission"))

    class Meta:
        db_table = 'usuario_permisos'
        verbose_name = _("User Permission")
        verbose_name_plural = _("User Permissions")
        unique_together = ['user', 'permission']

    def __str__(self):
        return f"{self.user.email} - {self.permission.name}"


class WorkflowState(TimeStampedModel):
    """
    Defines the possible states in the expropriation workflow.
    """
    name = models.CharField(max_length=50, unique=True, verbose_name=_("State Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    is_final = models.BooleanField(
        default=False,
        verbose_name=_("Is Final State"),
        help_text=_("Whether this is a final state in the workflow")
    )
    color = models.CharField(
        max_length=7,
        default="#6B7280",
        verbose_name=_("Color"),
        help_text=_("Hex color code for UI representation")
    )
    order = models.PositiveIntegerField(verbose_name=_("Display Order"))

    class Meta:
        db_table = 'workflow_estados'
        verbose_name = _("Workflow State")
        verbose_name_plural = _("Workflow States")
        ordering = ['order']

    def __str__(self):
        return self.name


class Notification(TimeStampedModel):
    """
    System notifications for users about expedientes and tasks.
    """
    NOTIFICATION_TYPES = [
        ('task_assigned', _('Task Assigned')),
        ('document_required', _('Document Required')),
        ('workflow_update', _('Workflow Update')),
        ('deadline_approaching', _('Deadline Approaching')),
        ('approval_required', _('Approval Required')),
        ('system_alert', _('System Alert')),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_("User")
    )
    expediente = models.ForeignKey(
        'workflow.Expediente',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_("Expediente")
    )
    type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        verbose_name=_("Notification Type")
    )
    title = models.CharField(max_length=255, verbose_name=_("Title"))
    message = models.TextField(verbose_name=_("Message"))
    is_read = models.BooleanField(default=False, verbose_name=_("Is Read"))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Read At"))

    class Meta:
        db_table = 'notificaciones'
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"

    def mark_as_read(self):
        """Mark notification as read."""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])


class AuditLog(TimeStampedModel):
    """
    Comprehensive audit logging for all system operations.
    """
    ACTION_TYPES = [
        ('CREATE', _('Create')),
        ('UPDATE', _('Update')),
        ('DELETE', _('Delete')),
        ('LOGIN', _('Login')),
        ('LOGOUT', _('Logout')),
        ('VIEW', _('View')),
        ('DOWNLOAD', _('Download')),
        ('APPROVE', _('Approve')),
        ('REJECT', _('Reject')),
    ]

    table_name = models.CharField(max_length=100, verbose_name=_("Table Name"))
    record_id = models.UUIDField(verbose_name=_("Record ID"))
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES, verbose_name=_("Action Type"))
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("User")
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name=_("IP Address"))
    user_agent = models.TextField(blank=True, verbose_name=_("User Agent"))
    old_values = models.JSONField(null=True, blank=True, verbose_name=_("Old Values"))
    new_values = models.JSONField(null=True, blank=True, verbose_name=_("New Values"))
    additional_data = models.JSONField(null=True, blank=True, verbose_name=_("Additional Data"))

    class Meta:
        db_table = 'auditoria'
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['table_name', 'record_id']),
            models.Index(fields=['user']),
            models.Index(fields=['action_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.action_type} {self.table_name} by {self.user} at {self.created_at}"


# Database views and materialized views can be created using Django migrations
# For complex reporting and analytics queries