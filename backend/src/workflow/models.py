"""
Workflow models for MOPC Expropriation Management System.
This module defines the core workflow entities based on the 16-step expropriation process.
"""

import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from core.models import TimeStampedModel, SoftDeleteModel, Department, User, WorkflowState


class Expediente(TimeStampedModel, SoftDeleteModel):
    """
    Main entity representing an expropriation case/expediente.
    Follows the complete 16-step workflow process from the PRD analysis.
    """
    EXPEDIENTE_STATES = [
        ('iniciado', _('Iniciado')),
        ('en_revision', _('En Revisión')),
        ('aprobado', _('Aprobado')),
        ('rechazado', _('Rechazado')),
        ('completado', _('Completado')),
        ('en_apelacion', _('En Apelación')),
    ]

    numero_expediente = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Número de Expediente"),
        help_text=_("Unique identifier for the expediente")
    )
    estado_actual = models.CharField(
        max_length=50,
        choices=EXPEDIENTE_STATES,
        default='iniciado',
        verbose_name=_("Estado Actual")
    )
    departamento_actual = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='expedientes_activos',
        verbose_name=_("Departamento Actual")
    )
    estado_workflow = models.ForeignKey(
        WorkflowState,
        on_delete=models.PROTECT,
        verbose_name=_("Estado Workflow")
    )

    # Property Information
    propietario_nombre = models.CharField(max_length=255, verbose_name=_("Nombre del Propietario"))
    propietario_cedula = models.CharField(max_length=20, verbose_name=_("Cédula del Propietario"))
    ubicacion_direccion = models.TextField(verbose_name=_("Dirección"))
    ubicacion_municipio = models.CharField(max_length=100, verbose_name=_("Municipio"))
    ubicacion_provincia = models.CharField(max_length=100, verbose_name=_("Provincia"))
    area_terreno = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Área del Terreno (m²)"),
        help_text=_("Area of the land in square meters")
    )
    area_construccion = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Área de Construcción (m²)"),
        help_text=_("Area of construction in square meters")
    )
    valor_tasacion = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Valor de Tasación"),
        help_text=_("Property valuation amount")
    )

    # Metadata
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='expedientes_creados',
        verbose_name=_("Creado por")
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Metadata"),
        help_text=_("Additional metadata in JSON format")
    )

    # Tracking fields
    fecha_inicio = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de Inicio")
    )
    fecha_completado = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de Completado")
    )

    class Meta:
        db_table = 'expedientes'
        verbose_name = _("Expediente")
        verbose_name_plural = _("Expedientes")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['estado_actual']),
            models.Index(fields=['departamento_actual']),
            models.Index(fields=['propietario_cedula']),
            models.Index(fields=['created_at']),
            models.Index(fields=['numero_expediente']),
        ]

    def __str__(self):
        return f"Expediente {self.numero_expediente} - {self.propietario_nombre}"

    def clean(self):
        """Validate expediente data."""
        if self.valor_tasacion and self.valor_tasacion < 0:
            raise ValidationError(_("El valor de tasación no puede ser negativo"))

        if self.area_terreno and self.area_terreno < 0:
            raise ValidationError(_("El área del terreno no puede ser negativa"))

        if self.area_construccion and self.area_construccion < 0:
            raise ValidationError(_("El área de construcción no puede ser negativa"))

    def get_current_department_name(self):
        """Get the name of the current department."""
        return self.departamento_actual.name if self.departamento_actual else None

    def get_days_in_process(self):
        """Calculate how many days the expediente has been in process."""
        from django.utils import timezone
        if self.fecha_inicio:
            return (timezone.now() - self.fecha_inicio).days
        return (timezone.now() - self.created_at).days

    def get_workflow_progress_percentage(self):
        """Calculate workflow progress based on current state order."""
        if not self.estado_workflow:
            return 0

        total_states = WorkflowState.objects.filter(is_final=False).count()
        current_order = self.estado_workflow.order

        if current_order and total_states > 0:
            return min(int((current_order / total_states) * 100), 100)
        return 0


class WorkflowTransition(TimeStampedModel):
    """
    Tracks all transitions of expedientes through the workflow.
    Implements event sourcing for complete audit trail.
    """
    expediente = models.ForeignKey(
        Expediente,
        on_delete=models.CASCADE,
        related_name='transiciones',
        verbose_name=_("Expediente")
    )
    desde_estado = models.ForeignKey(
        WorkflowState,
        on_delete=models.PROTECT,
        related_name='transiciones_desde',
        null=True,
        blank=True,
        verbose_name=_("Desde Estado")
    )
    hacia_estado = models.ForeignKey(
        WorkflowState,
        on_delete=models.PROTECT,
        related_name='transiciones_hacia',
        verbose_name=_("Hacia Estado")
    )
    desde_departamento = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='transiciones_desde',
        null=True,
        blank=True,
        verbose_name=_("Desde Departamento")
    )
    hacia_departamento = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='transiciones_hacia',
        verbose_name=_("Hacia Departamento")
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        verbose_name=_("Usuario")
    )
    comentarios = models.TextField(
        blank=True,
        verbose_name=_("Comentarios"),
        help_text=_("Comments about the transition")
    )
    motivo_rechazo = models.TextField(
        blank=True,
        verbose_name=_("Motivo de Rechazo"),
        help_text=_("Reason for rejection if applicable")
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Metadata")
    )

    class Meta:
        db_table = 'workflow_transiciones'
        verbose_name = _("Workflow Transition")
        verbose_name_plural = _("Workflow Transitions")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['expediente']),
            models.Index(fields=['usuario']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Transición {self.expediente.numero_expediente}: {self.desde_estado} → {self.hacia_estado}"


class Task(TimeStampedModel):
    """
    Represents tasks assigned to departments/users for expediente processing.
    Supports the optimization suggestions for parallel processing.
    """
    TASK_TYPES = [
        ('revision', _('Revisión')),
        ('aprobacion', _('Aprobación')),
        ('coordinacion', _('Coordinación')),
        ('verificacion', _('Verificación')),
        ('notificacion', _('Notificación')),
        ('documentacion', _('Documentación')),
    ]

    TASK_PRIORITIES = [
        ('baja', _('Baja')),
        ('media', _('Media')),
        ('alta', _('Alta')),
        ('urgente', _('Urgente')),
    ]

    TASK_STATUS = [
        ('pendiente', _('Pendiente')),
        ('en_progreso', _('En Progreso')),
        ('completada', _('Completada')),
        ('cancelada', _('Cancelada')),
        ('bloqueada', _('Bloqueada')),
    ]

    expediente = models.ForeignKey(
        Expediente,
        on_delete=models.CASCADE,
        related_name='tareas',
        verbose_name=_("Expediente")
    )
    departamento = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='tareas',
        verbose_name=_("Departamento")
    )
    usuario_asignado = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tareas_asignadas',
        verbose_name=_("Usuario Asignado")
    )
    titulo = models.CharField(max_length=255, verbose_name=_("Título"))
    descripcion = models.TextField(verbose_name=_("Descripción"))
    tipo = models.CharField(
        max_length=50,
        choices=TASK_TYPES,
        verbose_name=_("Tipo de Tarea")
    )
    prioridad = models.CharField(
        max_length=20,
        choices=TASK_PRIORITIES,
        default='media',
        verbose_name=_("Prioridad")
    )
    estado = models.CharField(
        max_length=20,
        choices=TASK_STATUS,
        default='pendiente',
        verbose_name=_("Estado")
    )
    fecha_vencimiento = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de Vencimiento")
    )
    fecha_completacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Fecha de Completación")
    )
    resultado = models.TextField(
        blank=True,
        verbose_name=_("Resultado"),
        help_text=_("Result of task completion")
    )

    # Dependencies for parallel processing
    depende_de = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='dependientes',
        verbose_name=_("Depende de"),
        help_text=_("Tasks that must be completed before this one")
    )

    class Meta:
        db_table = 'tareas'
        verbose_name = _("Task")
        verbose_name_plural = _("Tasks")
        ordering = ['prioridad', 'fecha_vencimiento', 'created_at']
        indexes = [
            models.Index(fields=['expediente']),
            models.Index(fields=['departamento']),
            models.Index(fields=['usuario_asignado']),
            models.Index(fields=['estado']),
            models.Index(fields=['prioridad']),
            models.Index(fields=['fecha_vencimiento']),
        ]

    def __str__(self):
        return f"{self.titulo} - {self.expediente.numero_expediente}"

    def is_overdue(self):
        """Check if task is overdue."""
        from django.utils import timezone
        return self.fecha_vencimiento and self.fecha_vencimiento < timezone.now() and self.estado != 'completada'

    def get_days_until_due(self):
        """Get days until task is due."""
        from django.utils import timezone
        if self.fecha_vencimiento:
            return (self.fecha_vencimiento - timezone.now()).days
        return None

    def can_be_started(self):
        """Check if all dependencies are completed."""
        return not self.depende_de.filter(estado__in=['pendiente', 'en_progreso']).exists()

    def mark_as_completed(self, usuario, resultado=""):
        """Mark task as completed."""
        from django.utils import timezone
        self.estado = 'completada'
        self.fecha_completacion = timezone.now()
        self.resultado = resultado
        self.usuario_asignado = usuario
        self.save()


class TaskDependency(TimeStampedModel):
    """
    Explicit dependency relationships between tasks for workflow optimization.
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='dependency_forward',
        verbose_name=_("Task")
    )
    depends_on = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='dependency_backward',
        verbose_name=_("Depends On")
    )
    dependency_type = models.CharField(
        max_length=50,
        choices=[
            ('finish_to_start', _('Finish to Start')),
            ('start_to_start', _('Start to Start')),
        ],
        default='finish_to_start',
        verbose_name=_("Dependency Type")
    )

    class Meta:
        db_table = 'task_dependencies'
        verbose_name = _("Task Dependency")
        verbose_name_plural = _("Task Dependencies")
        unique_together = ['task', 'depends_on']

    def __str__(self):
        return f"{self.task} depends on {self.depends_on}"