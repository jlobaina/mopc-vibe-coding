"""
Workflow serializers for MOPC Expropriation Management System.
This module defines serializers for all workflow models and implements
validation logic for the 16-step expropriation process.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from core.models import Department, User, WorkflowState
from .models import Expediente, WorkflowTransition, Task, TaskDependency

User = get_user_model()


class WorkflowStateSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowState model."""

    class Meta:
        model = WorkflowState
        fields = [
            'id', 'name', 'description', 'is_final',
            'color', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model."""

    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description', 'workflow_order',
            'can_process_parallel', 'response_time_hours', 'is_active',
            'user_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_count(self, obj):
        """Get number of active users in this department."""
        return User.objects.filter(department=obj, is_active=True).count()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Simple user serializer for basic information."""

    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'cedula', 'role', 'department', 'department_name'
        ]
        read_only_fields = ['id']


class ExpedienteSerializer(serializers.ModelSerializer):
    """Main serializer for Expediente model with workflow management."""

    creado_por_info = UserSimpleSerializer(source='creado_por', read_only=True)
    departamento_actual_info = DepartmentSerializer(source='departamento_actual', read_only=True)
    estado_workflow_info = WorkflowStateSerializer(source='estado_workflow', read_only=True)

    # Computed fields
    days_in_process = serializers.ReadOnlyField()
    workflow_progress_percentage = serializers.ReadOnlyField()
    current_department_name = serializers.ReadOnlyField()

    # Task statistics
    total_tasks = serializers.SerializerMethodField()
    pending_tasks = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    overdue_tasks = serializers.SerializerMethodField()

    # Transition history count
    transition_count = serializers.SerializerMethodField()

    class Meta:
        model = Expediente
        fields = [
            'id', 'numero_expediente', 'estado_actual', 'departamento_actual',
            'departamento_actual_info', 'estado_workflow', 'estado_workflow_info',
            'propietario_nombre', 'propietario_cedula', 'ubicacion_direccion',
            'ubicacion_municipio', 'ubicacion_provincia', 'area_terreno',
            'area_construccion', 'valor_tasacion', 'creado_por', 'creado_por_info',
            'metadata', 'fecha_inicio', 'fecha_completado', 'days_in_process',
            'workflow_progress_percentage', 'current_department_name', 'total_tasks',
            'pending_tasks', 'completed_tasks', 'overdue_tasks', 'transition_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'creado_por', 'days_in_process', 'workflow_progress_percentage',
            'current_department_name', 'created_at', 'updated_at'
        ]

    def get_total_tasks(self, obj):
        """Get total number of tasks for this expediente."""
        return obj.tareas.count()

    def get_pending_tasks(self, obj):
        """Get number of pending tasks."""
        return obj.tareas.filter(estado='pendiente').count()

    def get_completed_tasks(self, obj):
        """Get number of completed tasks."""
        return obj.tareas.filter(estado='completada').count()

    def get_overdue_tasks(self, obj):
        """Get number of overdue tasks."""
        return sum(1 for task in obj.tareas.all() if task.is_overdue())

    def get_transition_count(self, obj):
        """Get number of workflow transitions."""
        return obj.transiciones.count()

    def validate_valor_tasacion(self, value):
        """Validate property valuation."""
        if value and value < 0:
            raise serializers.ValidationError(_("El valor de tasación no puede ser negativo"))
        return value

    def validate_area_terreno(self, value):
        """Validate land area."""
        if value and value < 0:
            raise serializers.ValidationError(_("El área del terreno no puede ser negativa"))
        return value

    def validate_area_construccion(self, value):
        """Validate construction area."""
        if value and value < 0:
            raise serializers.ValidationError(_("El área de construcción no puede ser negativa"))
        return value

    def validate_numero_expediente(self, value):
        """Validate expediente number format."""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError(_("El número de expediente debe tener al menos 3 caracteres"))
        return value.strip().upper()

    def validate_propietario_cedula(self, value):
        """Validate owner's cedula format."""
        if not value or len(value.strip()) < 11:
            raise serializers.ValidationError(_("La cédula debe tener al menos 11 caracteres"))
        return value.strip()

    def create(self, validated_data):
        """Create expediente with initial workflow state."""
        # Get initial workflow state
        initial_state = WorkflowState.objects.filter(order=1).first()
        if not initial_state:
            raise serializers.ValidationError(_("No se encontró el estado inicial del workflow"))

        # Get first department in workflow order
        initial_department = Department.objects.filter(
            is_active=True
        ).order_by('workflow_order').first()

        validated_data['estado_workflow'] = initial_state
        validated_data['departamento_actual'] = initial_department
        validated_data['fecha_inicio'] = timezone.now()

        return super().create(validated_data)


class ExpedienteCreateSerializer(ExpedienteSerializer):
    """Serializer for creating new expedientes."""

    class Meta(ExpedienteSerializer.Meta):
        read_only_fields = ExpedienteSerializer.Meta.read_only_fields + [
            'estado_workflow', 'departamento_actual', 'fecha_inicio'
        ]


class WorkflowTransitionSerializer(serializers.ModelSerializer):
    """Serializer for workflow transitions with audit trail."""

    usuario_info = UserSimpleSerializer(source='usuario', read_only=True)
    desde_estado_info = WorkflowStateSerializer(source='desde_estado', read_only=True)
    hacia_estado_info = WorkflowStateSerializer(source='hacia_estado', read_only=True)
    desde_departamento_info = DepartmentSerializer(source='desde_departamento', read_only=True)
    hacia_departamento_info = DepartmentSerializer(source='hacia_departamento', read_only=True)

    # Expediente basic info
    expediente_numero = serializers.CharField(source='expediente.numero_expediente', read_only=True)
    expediente_propietario = serializers.CharField(source='expediente.propietario_nombre', read_only=True)

    class Meta:
        model = WorkflowTransition
        fields = [
            'id', 'expediente', 'expediente_numero', 'expediente_propietario',
            'desde_estado', 'desde_estado_info', 'hacia_estado', 'hacia_estado_info',
            'desde_departamento', 'desde_departamento_info', 'hacia_departamento',
            'hacia_departamento_info', 'usuario', 'usuario_info', 'comentarios',
            'motivo_rechazo', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'usuario', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        """Validate transition logic."""
        expediente = data.get('expediente')
        hacia_estado = data.get('hacia_estado')
        hacia_departamento = data.get('hacia_departamento')

        if not expediente or not hacia_estado:
            raise serializers.ValidationError(_("Expediente y estado destino son requeridos"))

        # Check if transition is valid
        if expediente.estado_workflow == hacia_estado:
            raise serializers.ValidationError(_("No se puede transicionar al mismo estado"))

        # Check if target department is different (unless final state)
        if not hacia_estado.is_final and expediente.departamento_actual == hacia_departamento:
            raise serializers.ValidationError(_("El departamento destino debe ser diferente"))

        # Validate rejection reason if transitioning to rejected state
        if hacia_estado.name.lower() == 'rechazado' and not data.get('motivo_rechazo'):
            raise serializers.ValidationError(_("El motivo de rechazo es obligatorio para transiciones a estado rechazado"))

        return data

    def create(self, validated_data):
        """Create transition and update expediente state."""
        expediente = validated_data['expediente']
        hacia_estado = validated_data['hacia_estado']
        hacia_departamento = validated_data.get('hacia_departamento')
        usuario = validated_data['usuario']

        # Set previous state and department
        validated_data['desde_estado'] = expediente.estado_workflow
        validated_data['desde_departamento'] = expediente.departamento_actual

        with transaction.atomic():
            # Create transition
            transition = super().create(validated_data)

            # Update expediente state
            expediente.estado_workflow = hacia_estado
            if hacia_departamento:
                expediente.departamento_actual = hacia_departamento

            # Update expediente status based on workflow state
            if hacia_estado.name.lower() == 'completado':
                expediente.estado_actual = 'completado'
                expediente.fecha_completado = timezone.now()
            elif hacia_estado.name.lower() == 'rechazado':
                expediente.estado_actual = 'rechazado'
            elif hacia_estado.name.lower() == 'en apelación':
                expediente.estado_actual = 'en_apelacion'
            elif 'revisión' in hacia_estado.name.lower():
                expediente.estado_actual = 'en_revision'
            else:
                expediente.estado_actual = 'aprobado'

            expediente.save()

        return transition


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model with dependency management."""

    expediente_numero = serializers.CharField(source='expediente.numero_expediente', read_only=True)
    departamento_info = DepartmentSerializer(source='departamento', read_only=True)
    usuario_asignado_info = UserSimpleSerializer(source='usuario_asignado', read_only=True)

    # Dependency information
    dependency_names = serializers.SerializerMethodField()
    dependent_names = serializers.SerializerMethodField()
    can_be_started = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()

    # Status information
    status_display = serializers.CharField(source='get_estado_display', read_only=True)
    priority_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    type_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'expediente', 'expediente_numero', 'departamento',
            'departamento_info', 'usuario_asignado', 'usuario_asignado_info',
            'titulo', 'descripcion', 'tipo', 'type_display', 'prioridad',
            'priority_display', 'estado', 'status_display', 'fecha_vencimiento',
            'fecha_completacion', 'resultado', 'depende_de', 'dependency_names',
            'dependent_names', 'can_be_started', 'is_overdue', 'days_until_due',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'fecha_completacion', 'created_at', 'updated_at'
        ]

    def get_dependency_names(self, obj):
        """Get names of tasks this task depends on."""
        return [dep.titulo for dep in obj.depende_de.all()]

    def get_dependent_names(self, obj):
        """Get names of tasks that depend on this task."""
        return [dep.titulo for dep in obj.dependientes.all()]

    def validate_fecha_vencimiento(self, value):
        """Validate due date."""
        if value and value < timezone.now():
            raise serializers.ValidationError(_("La fecha de vencimiento no puede ser en el pasado"))
        return value

    def validate_usuario_asignado(self, value):
        """Validate assigned user belongs to task department."""
        if value and self.instance and self.instance.departamento:
            if value.department != self.instance.departamento:
                raise serializers.ValidationError(
                    _("El usuario asignado debe pertenecer al departamento {dept_name}").format(
                        dept_name=self.instance.departamento.name
                    )
                )
        return value

    def validate_depende_de(self, value):
        """Validate task dependencies."""
        if self.instance and value:
            # Prevent circular dependencies
            for dep_task in value:
                if dep_task == self.instance:
                    raise serializers.ValidationError(_("Una tarea no puede depender de sí misma"))
                if self._would_create_circular_dependency(self.instance, dep_task):
                    raise serializers.ValidationError(
                        _("La dependencia crearía un ciclo circular con {task}").format(
                            task=dep_task.titulo
                        )
                    )
        return value

    def _would_create_circular_dependency(self, task, dependency):
        """Check if adding dependency would create a circular dependency."""
        visited = set()

        def check_dependencies(current_task):
            if current_task.id in visited:
                return True
            visited.add(current_task.id)

            for dep in current_task.depende_de.all():
                if dep.id == task.id or check_dependencies(dep):
                    return True
            return False

        return check_dependencies(dependency)

    def update(self, instance, validated_data):
        """Update task with special handling for completion."""
        with transaction.atomic():
            # Check if task is being marked as completed
            if 'estado' in validated_data and validated_data['estado'] == 'completada':
                if instance.estado != 'completada':
                    validated_data['fecha_completacion'] = timezone.now()
                    if not validated_data.get('resultado'):
                        validated_data['resultado'] = _("Tarea completada automáticamente")

            # Clear assignment if task is cancelled
            if 'estado' in validated_data and validated_data['estado'] == 'cancelada':
                validated_data['usuario_asignado'] = None

            return super().update(instance, validated_data)


class TaskCreateSerializer(TaskSerializer):
    """Serializer for creating new tasks."""

    class Meta(TaskSerializer.Meta):
        read_only_fields = TaskSerializer.Meta.read_only_fields


class TaskDependencySerializer(serializers.ModelSerializer):
    """Serializer for task dependency relationships."""

    task_info = serializers.CharField(source='task.titulo', read_only=True)
    depends_on_info = serializers.CharField(source='depends_on.titulo', read_only=True)
    dependency_type_display = serializers.CharField(source='get_dependency_type_display', read_only=True)

    class Meta:
        model = TaskDependency
        fields = [
            'id', 'task', 'task_info', 'depends_on', 'depends_on_info',
            'dependency_type', 'dependency_type_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """Validate dependency relationship."""
        task = data.get('task')
        depends_on = data.get('depends_on')

        if task == depends_on:
            raise serializers.ValidationError(_("Una tarea no puede depender de sí misma"))

        if task.expediente != depends_on.expediente:
            raise serializers.ValidationError(_("Las tareas deben pertenecer al mismo expediente"))

        # Check for existing dependency
        if TaskDependency.objects.filter(task=task, depends_on=depends_on).exists():
            raise serializers.ValidationError(_("Esta dependencia ya existe"))

        return data


class ExpedienteWorkflowSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for expediente with full workflow context."""

    current_tasks = TaskSerializer(many=True, read_only=True)
    recent_transitions = WorkflowTransitionSerializer(many=True, read_only=True)
    available_transitions = serializers.SerializerMethodField()
    next_departments = serializers.SerializerMethodField()

    class Meta:
        model = Expediente
        fields = [
            'id', 'numero_expediente', 'estado_actual', 'estado_workflow',
            'departamento_actual', 'propietario_nombre', 'days_in_process',
            'workflow_progress_percentage', 'current_tasks', 'recent_transitions',
            'available_transitions', 'next_departments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_available_transitions(self, obj):
        """Get available workflow transitions for current state."""
        current_state = obj.estado_workflow
        if not current_state or current_state.is_final:
            return []

        # Get next states in workflow
        next_states = WorkflowState.objects.filter(
            order__gt=current_state.order
        ).order_by('order')[:3]

        return WorkflowStateSerializer(next_states, many=True).data

    def get_next_departments(self, obj):
        """Get next departments in workflow order."""
        current_dept = obj.departamento_actual
        if not current_dept:
            return []

        # Get next departments in workflow order
        next_departments = Department.objects.filter(
            workflow_order__gt=current_dept.workflow_order,
            is_active=True
        ).order_by('workflow_order')[:3]

        return DepartmentSerializer(next_departments, many=True).data


class WorkflowAnalyticsSerializer(serializers.Serializer):
    """Serializer for workflow analytics and reporting data."""

    total_expedientes = serializers.IntegerField()
    expedientes_by_estado = serializers.DictField()
    expedientes_by_departamento = serializers.DictField()
    average_processing_time = serializers.FloatField()
    expedientes_overdue = serializers.IntegerField()
    tasks_by_status = serializers.DictField()
    department_performance = serializers.ListField()
    monthly_trends = serializers.ListField()

    class Meta:
        fields = [
            'total_expedientes', 'expedientes_by_estado', 'expedientes_by_departamento',
            'average_processing_time', 'expedientes_overdue', 'tasks_by_status',
            'department_performance', 'monthly_trends'
        ]