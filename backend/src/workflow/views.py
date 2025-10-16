"""
Workflow API views for MOPC Expropriation Management System.
This module implements API endpoints for the complete 16-step expropriation workflow
with proper state management, task assignment, and department transitions.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from django.utils import timezone
from django.db.models import Q, Count, Avg, F, ExpressionWrapper, DurationField
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.models import Department, User, WorkflowState
from authentication.permissions import (
    IsAuthenticatedActive, HasDepartmentPermission, CanManageExpedientes,
    IsDepartmentHead, CanAccessReports, has_permission
)
from .models import Expediente, WorkflowTransition, Task, TaskDependency
from .serializers import (
    ExpedienteSerializer, ExpedienteCreateSerializer, WorkflowTransitionSerializer,
    TaskSerializer, TaskCreateSerializer, TaskDependencySerializer,
    DepartmentSerializer, WorkflowStateSerializer, UserSimpleSerializer,
    ExpedienteWorkflowSerializer, WorkflowAnalyticsSerializer
)


class ExpedienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Expedientes (expropriation cases).
    Implements CRUD operations and workflow management.
    """

    permission_classes = [IsAuthenticatedActive, CanManageExpedientes]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'estado_actual', 'departamento_actual', 'estado_workflow',
        'propietario_cedula', 'ubicacion_municipio', 'ubicacion_provincia'
    ]
    search_fields = [
        'numero_expediente', 'propietario_nombre', 'propietario_cedula',
        'ubicacion_direccion', 'ubicacion_municipio'
    ]
    ordering_fields = [
        'created_at', 'updated_at', 'fecha_inicio', 'fecha_completado',
        'valor_tasacion', 'workflow_progress_percentage'
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        """Get expedientes based on user permissions and department."""
        user = self.request.user
        queryset = Expediente.objects.select_related(
            'creado_por', 'departamento_actual', 'estado_workflow'
        ).prefetch_related('tareas', 'transiciones')

        # Superusers see all expedientes
        if user.is_superuser:
            return queryset

        # Department heads see all expedientes in their department
        if user.role in ['department_head', 'supervisor', 'admin']:
            return queryset.filter(departamento_actual=user.department)

        # Regular users see expedientes in their current department
        # or those assigned to them via tasks
        return queryset.filter(
            Q(departamento_actual=user.department) |
            Q(tareas__usuario_asignado=user)
        ).distinct()

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return ExpedienteCreateSerializer
        elif self.action in ['workflow_context', 'analytics']:
            return ExpedienteWorkflowSerializer
        return ExpedienteSerializer

    def perform_create(self, serializer):
        """Set creator when creating expediente."""
        serializer.save(creado_por=self.request.user)

    @action(detail=True, methods=['get'])
    def workflow_context(self, request, pk=None):
        """Get comprehensive workflow context for expediente."""
        expediente = self.get_object()

        # Get recent transitions (last 10)
        recent_transitions = expediente.transiciones.select_related(
            'usuario', 'desde_estado', 'hacia_estado',
            'desde_departamento', 'hacia_departamento'
        ).order_by('-created_at')[:10]

        # Get current active tasks
        current_tasks = expediente.tareas.select_related(
            'departamento', 'usuario_asignado'
        ).filter(estado__in=['pendiente', 'en_progreso']).order_by(
            'prioridad', 'fecha_vencimiento'
        )

        # Get available transitions
        available_transitions = self._get_available_transitions(expediente)

        # Get next departments
        next_departments = self._get_next_departments(expediente)

        serializer = self.get_serializer(expediente)
        data = serializer.data
        data['recent_transitions'] = WorkflowTransitionSerializer(
            recent_transitions, many=True
        ).data
        data['available_transitions'] = available_transitions
        data['next_departments'] = next_departments

        return Response(data)

    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        """Perform workflow transition for expediente."""
        expediente = self.get_object()

        # Check permissions for transition
        if not self._can_transition_expediente(request.user, expediente):
            raise PermissionDenied(_("No tiene permisos para transicionar este expediente"))

        serializer = WorkflowTransitionSerializer(data={
            'expediente': expediente.id,
            'hacia_estado': request.data.get('hacia_estado'),
            'hacia_departamento': request.data.get('hacia_departamento'),
            'usuario': request.user.id,
            'comentarios': request.data.get('comentarios', ''),
            'motivo_rechazo': request.data.get('motivo_rechazo', ''),
            'metadata': request.data.get('metadata', {})
        })

        if serializer.is_valid():
            with transaction.atomic():
                transition = serializer.save()

                # Create notification for transition
                self._create_transition_notification(transition)

                # Auto-create tasks for new department if applicable
                self._auto_create_tasks_for_department(expediente, transition.hacia_departamento)

            return Response(
                WorkflowTransitionSerializer(transition).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get complete transition history for expediente."""
        expediente = self.get_object()
        transitions = expediente.transiciones.select_related(
            'usuario', 'desde_estado', 'hacia_estado',
            'desde_departamento', 'hacia_departamento'
        ).order_by('-created_at')

        page = self.paginate_queryset(transitions)
        if page is not None:
            serializer = WorkflowTransitionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = WorkflowTransitionSerializer(transitions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_task(self, request, pk=None):
        """Create and assign a new task to the expediente."""
        expediente = self.get_object()

        # Check permissions
        if not has_permission(request.user, 'task', 'crear'):
            raise PermissionDenied(_("No tiene permisos para crear tareas"))

        data = request.data.copy()
        data['expediente'] = expediente.id

        # Set department to current expediente department if not specified
        if 'departamento' not in data:
            data['departamento'] = expediente.departamento_actual.id

        serializer = TaskCreateSerializer(data=data)
        if serializer.is_valid():
            task = serializer.save()

            # Create notification for task assignment
            if task.usuario_asignado:
                self._create_task_assignment_notification(task)

            return Response(
                TaskSerializer(task).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Get all tasks for expediente with optional filtering."""
        expediente = self.get_object()
        tasks = expediente.tareas.select_related(
            'departamento', 'usuario_asignado'
        ).prefetch_related('depende_de', 'dependientes')

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(estado=status_filter)

        # Filter by department
        dept_filter = request.query_params.get('department')
        if dept_filter:
            tasks = tasks.filter(departamento_id=dept_filter)

        # Filter by assigned user
        user_filter = request.query_params.get('assigned_to')
        if user_filter:
            tasks = tasks.filter(usuario_asignado_id=user_filter)

        # Order by priority and due date
        tasks = tasks.order_by('prioridad', 'fecha_vencimiento', 'created_at')

        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = TaskSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get workflow analytics and reporting data."""
        # Check permissions for analytics
        if not request.user.is_superuser and not has_permission(request.user, 'report', 'leer'):
            raise PermissionDenied(_("No tiene permisos para ver reportes"))

        # Get base queryset based on user permissions
        if request.user.is_superuser:
            queryset = Expediente.objects.all()
        else:
            queryset = self.get_queryset()

        # Calculate analytics
        total_expedientes = queryset.count()

        # Expedientes by estado
        expedientes_by_estado = dict(
            queryset.values('estado_actual').annotate(
                count=Count('id')
            ).values_list('estado_actual', 'count')
        )

        # Expedientes by departamento
        expedientes_by_departamento = dict(
            queryset.values('departamento_actual__name').annotate(
                count=Count('id')
            ).values_list('departamento_actual__name', 'count')
        )

        # Average processing time (in days)
        completed_expedientes = queryset.filter(fecha_completado__isnull=False)
        avg_processing_time = completed_expedientes.aggregate(
            avg_days=Avg(
                ExpressionWrapper(
                    F('fecha_completado') - F('created_at'),
                    output_field=DurationField()
                )
            )
        )['avg_days']

        if avg_processing_time:
            avg_processing_time = avg_processing_time.days
        else:
            avg_processing_time = 0

        # Overdue expedientes (older than 30 days and not completed)
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        expedientes_overdue = queryset.filter(
            created_at__lt=thirty_days_ago,
            fecha_completado__isnull=True
        ).count()

        # Tasks by status
        task_queryset = Task.objects.filter(expediente__in=queryset)
        tasks_by_status = dict(
            task_queryset.values('estado').annotate(
                count=Count('id')
            ).values_list('estado', 'count')
        )

        # Department performance
        department_performance = []
        for dept in Department.objects.filter(is_active=True):
            dept_expedientes = queryset.filter(departamento_actual=dept)
            dept_tasks = task_queryset.filter(departamento=dept)

            performance = {
                'department': dept.name,
                'expedientes_count': dept_expedientes.count(),
                'avg_processing_time': dept_expedientes.filter(
                    fecha_completado__isnull=False
                ).aggregate(
                    avg_days=Avg(
                        ExpressionWrapper(
                            F('fecha_completado') - F('created_at'),
                            output_field=DurationField()
                        )
                    )
                )['avg_days'].days if dept_expedientes.filter(
                    fecha_completado__isnull=False
                ).exists() else 0,
                'tasks_count': dept_tasks.count(),
                'completed_tasks': dept_tasks.filter(estado='completada').count(),
                'overdue_tasks': sum(1 for task in dept_tasks if task.is_overdue())
            }
            department_performance.append(performance)

        # Monthly trends (last 6 months)
        from datetime import datetime, timedelta
        monthly_trends = []
        for i in range(6):
            month_start = timezone.now().replace(day=1) - timedelta(days=i*30)
            month_end = month_start + timedelta(days=30)

            month_data = {
                'month': month_start.strftime('%Y-%m'),
                'created': queryset.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                ).count(),
                'completed': queryset.filter(
                    fecha_completado__gte=month_start,
                    fecha_completado__lt=month_end
                ).count()
            }
            monthly_trends.append(month_data)

        monthly_trends.reverse()  # Show oldest to newest

        analytics_data = {
            'total_expedientes': total_expedientes,
            'expedientes_by_estado': expedientes_by_estado,
            'expedientes_by_departamento': expedientes_by_departamento,
            'average_processing_time': avg_processing_time,
            'expedientes_overdue': expedientes_overdue,
            'tasks_by_status': tasks_by_status,
            'department_performance': department_performance,
            'monthly_trends': monthly_trends
        }

        return Response(analytics_data)

    def _can_transition_expediente(self, user, expediente):
        """Check if user can transition the expediente."""
        if user.is_superuser:
            return True

        # User must be in the current department or be a department head
        if user.role in ['department_head', 'supervisor', 'admin']:
            return user.department == expediente.departamento_actual

        return user.department == expediente.departamento_actual

    def _get_available_transitions(self, expediente):
        """Get available workflow transitions for current state."""
        current_state = expediente.estado_workflow
        if not current_state or current_state.is_final:
            return []

        # Get next states in workflow order
        next_states = WorkflowState.objects.filter(
            order__gt=current_state.order
        ).order_by('order')[:3]

        return WorkflowStateSerializer(next_states, many=True).data

    def _get_next_departments(self, expediente):
        """Get next departments in workflow order."""
        current_dept = expediente.departamento_actual
        if not current_dept:
            return []

        # Get next departments in workflow order
        next_departments = Department.objects.filter(
            workflow_order__gt=current_dept.workflow_order,
            is_active=True
        ).order_by('workflow_order')[:3]

        return DepartmentSerializer(next_departments, many=True).data

    def _create_transition_notification(self, transition):
        """Create notification for workflow transition."""
        from core.models import Notification

        # Notify users in the target department
        target_users = User.objects.filter(
            department=transition.hacia_departamento,
            is_active=True
        )

        for user in target_users:
            Notification.objects.create(
                user=user,
                expediente=transition.expediente,
                type='workflow_update',
                title=_('Transición de Expediente'),
                message=_(
                    'El expediente {numero} ha sido transferido a su departamento. '
                    'Estado actual: {estado}'
                ).format(
                    numero=transition.expediente.numero_expediente,
                    estado=transition.hacia_estado.name
                )
            )

    def _auto_create_tasks_for_department(self, expediente, department):
        """Auto-create standard tasks for department if configured."""
        # This would be based on department configuration
        # For now, we'll create a basic review task
        if department and department.code in ['JURIDICO', 'TECNICO', 'FINANCIERO']:
            Task.objects.create(
                expediente=expediente,
                departamento=department,
                titulo=f'Revisión en {department.name}',
                descripcion=f'Revisar expediente en departamento de {department.name}',
                tipo='revision',
                prioridad='alta',
                fecha_vencimiento=timezone.now() + timezone.timedelta(days=department.response_time_hours/24)
            )

    def _create_task_assignment_notification(self, task):
        """Create notification for task assignment."""
        from core.models import Notification

        if task.usuario_asignado:
            Notification.objects.create(
                user=task.usuario_asignado,
                expediente=task.expediente,
                type='task_assigned',
                title=_('Nueva Tarea Asignada'),
                message=_(
                    'Se le ha asignado la tarea "{titulo}" para el expediente {numero}'
                ).format(
                    titulo=task.titulo,
                    numero=task.expediente.numero_expediente
                )
            )


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Tasks in the workflow.
    Implements CRUD operations with dependency management.
    """

    permission_classes = [IsAuthenticatedActive]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'expediente', 'departamento', 'usuario_asignado', 'tipo',
        'prioridad', 'estado', 'fecha_vencimiento'
    ]
    search_fields = ['titulo', 'descripcion', 'expediente__numero_expediente']
    ordering_fields = [
        'created_at', 'fecha_vencimiento', 'prioridad', 'fecha_completacion'
    ]
    ordering = ['prioridad', 'fecha_vencimiento', 'created_at']

    def get_queryset(self):
        """Get tasks based on user permissions and department."""
        user = self.request.user
        queryset = Task.objects.select_related(
            'expediente', 'departamento', 'usuario_asignado'
        ).prefetch_related('depende_de', 'dependientes')

        # Superusers see all tasks
        if user.is_superuser:
            return queryset

        # Department heads see all tasks in their department
        if user.role in ['department_head', 'supervisor', 'admin']:
            return queryset.filter(departamento=user.department)

        # Regular users see tasks assigned to them or in their department
        return queryset.filter(
            Q(usuario_asignado=user) |
            Q(departamento=user.department)
        ).distinct()

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        """Set default values and validate on create."""
        user = self.request.user

        # Set department to user's department if not specified
        if not serializer.validated_data.get('departamento'):
            serializer.validated_data['departamento'] = user.department

        # Validate user can create task for this department
        dept = serializer.validated_data['departamento']
        if not self._can_create_task_for_department(user, dept):
            raise PermissionDenied(
                _("No tiene permisos para crear tareas en el departamento {dept}").format(
                    dept=dept.name
                )
            )

        serializer.save()

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark task as completed."""
        task = self.get_object()

        # Check permissions
        if not self._can_complete_task(request.user, task):
            raise PermissionDenied(_("No tiene permisos para completar esta tarea"))

        resultado = request.data.get('resultado', _('Tarea completada'))

        with transaction.atomic():
            task.mark_as_completed(request.user, resultado)

            # Check if this completion enables dependent tasks
            self._check_dependent_tasks(task)

            # Check if all tasks are completed for the expediente
            self._check_expediente_completion(task.expediente)

        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign task to a user."""
        task = self.get_object()

        # Check permissions
        if not self._can_assign_task(request.user, task):
            raise PermissionDenied(_("No tiene permisos para asignar esta tarea"))

        user_id = request.data.get('user_id')
        if not user_id:
            raise ValidationError(_("Se requiere el ID del usuario"))

        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            raise ValidationError(_("Usuario no encontrado o inactivo"))

        # Validate user belongs to task department
        if user.department != task.departamento:
            raise ValidationError(
                _("El usuario debe pertenecer al departamento {dept}").format(
                    dept=task.departamento.name
                )
            )

        task.usuario_asignado = user
        task.save()

        # Create notification
        self._create_task_assignment_notification(task)

        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['get'])
    def dependencies(self, request, pk=None):
        """Get task dependencies and dependents."""
        task = self.get_object()

        dependencies = Task.objects.filter(
            dependency_forward__task=task
        ).select_related('usuario_asignado', 'departamento')

        dependents = Task.objects.filter(
            dependency_backward__depends_on=task
        ).select_related('usuario_asignado', 'departamento')

        data = {
            'dependencies': TaskSerializer(dependencies, many=True).data,
            'dependents': TaskSerializer(dependents, many=True).data
        }

        return Response(data)

    @action(detail=True, methods=['post'])
    def add_dependency(self, request, pk=None):
        """Add a dependency to this task."""
        task = self.get_object()

        # Check permissions
        if not self._can_modify_dependencies(request.user, task):
            raise PermissionDenied(_("No tiene permisos para modificar dependencias"))

        depends_on_id = request.data.get('depends_on_id')
        if not depends_on_id:
            raise ValidationError(_("Se requiere el ID de la tarea de la que depende"))

        try:
            depends_on_task = Task.objects.get(id=depends_on_id)
        except Task.DoesNotExist:
            raise ValidationError(_("Tarea de dependencia no encontrada"))

        # Validate tasks belong to same expediente
        if task.expediente != depends_on_task.expediente:
            raise ValidationError(_("Las tareas deben pertenecer al mismo expediente"))

        # Check for circular dependency
        if self._would_create_circular_dependency(task, depends_on_task):
            raise ValidationError(_("Esta dependencia crearía un ciclo circular"))

        # Create dependency
        TaskDependency.objects.get_or_create(
            task=task,
            depends_on=depends_on_task,
            defaults={
                'dependency_type': request.data.get('dependency_type', 'finish_to_start')
            }
        )

        return Response({'message': _('Dependencia agregada exitosamente')})

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to current user."""
        tasks = Task.objects.filter(
            usuario_asignado=request.user,
            estado__in=['pendiente', 'en_progreso']
        ).select_related(
            'expediente', 'departamento'
        ).prefetch_related('depende_de')

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(estado=status_filter)

        # Order by priority and due date
        tasks = tasks.order_by('prioridad', 'fecha_vencimiento', 'created_at')

        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = TaskSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def department_tasks(self, request):
        """Get tasks for user's department."""
        user = request.user

        if user.role not in ['department_head', 'supervisor', 'admin']:
            raise PermissionDenied(_("No tiene permisos para ver tareas del departamento"))

        tasks = Task.objects.filter(
            departamento=user.department
        ).select_related(
            'expediente', 'usuario_asignado'
        ).prefetch_related('depende_de')

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(estado=status_filter)

        # Filter by assigned user
        user_filter = request.query_params.get('assigned_to')
        if user_filter:
            tasks = tasks.filter(usuario_asignado_id=user_filter)

        # Order by priority and due date
        tasks = tasks.order_by('prioridad', 'fecha_vencimiento', 'created_at')

        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = TaskSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def _can_create_task_for_department(self, user, department):
        """Check if user can create tasks for department."""
        if user.is_superuser:
            return True

        if user.role in ['department_head', 'supervisor', 'admin']:
            return user.department == department

        return user.department == department

    def _can_complete_task(self, user, task):
        """Check if user can complete the task."""
        if user.is_superuser:
            return True

        if user.role in ['department_head', 'supervisor', 'admin']:
            return user.department == task.departamento

        return task.usuario_asignado == user

    def _can_assign_task(self, user, task):
        """Check if user can assign the task."""
        if user.is_superuser:
            return True

        if user.role in ['department_head', 'supervisor', 'admin']:
            return user.department == task.departamento

        return task.usuario_asignado == user

    def _can_modify_dependencies(self, user, task):
        """Check if user can modify task dependencies."""
        if user.is_superuser:
            return True

        if user.role in ['department_head', 'supervisor', 'admin']:
            return user.department == task.departamento

        return task.usuario_asignado == user

    def _would_create_circular_dependency(self, task, dependency):
        """Check if adding dependency would create circular dependency."""
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

    def _check_dependent_tasks(self, completed_task):
        """Check and notify about tasks that can now be started."""
        for dependent in completed_task.dependientes.all():
            if dependent.can_be_started() and dependent.estado == 'pendiente':
                # Create notification
                if dependent.usuario_asignado:
                    from core.models import Notification
                    Notification.objects.create(
                        user=dependent.usuario_asignado,
                        expediente=dependent.expediente,
                        type='task_assigned',
                        title=_('Tarea Disponible'),
                        message=_(
                            'La tarea "{titulo}" ya puede ser iniciada '
                            'ya que se completaron sus dependencias'
                        ).format(titulo=dependent.titulo)
                    )

    def _check_expediente_completion(self, expediente):
        """Check if all tasks are completed and update expediente if needed."""
        pending_tasks = expediente.tareas.filter(
            estado__in=['pendiente', 'en_progreso']
        ).count()

        if pending_tasks == 0:
            # All tasks completed, check if expediente can move to next state
            current_state = expediente.estado_workflow
            if current_state and not current_state.is_final:
                next_state = WorkflowState.objects.filter(
                    order__gt=current_state.order
                ).order_by('order').first()

                if next_state:
                    # Create automatic transition
                    WorkflowTransition.objects.create(
                        expediente=expediente,
                        desde_estado=current_state,
                        hacia_estado=next_state,
                        desde_departamento=expediente.departamento_actual,
                        hacia_departamento=expediente.departamento_actual,
                        usuario=expediente.creado_por,
                        comentarios=_('Transición automática: Todas las tareas completadas')
                    )

                    # Update expediente
                    expediente.estado_workflow = next_state
                    expediente.save()


class WorkflowTransitionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing workflow transitions (audit trail).
    Read-only for security and audit purposes.
    """

    permission_classes = [IsAuthenticatedActive]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'expediente', 'usuario', 'desde_estado', 'hacia_estado',
        'desde_departamento', 'hacia_departamento'
    ]
    search_fields = [
        'expediente__numero_expediente', 'expediente__propietario_nombre',
        'comentarios', 'motivo_rechazo'
    ]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get transitions based on user permissions."""
        user = self.request.user
        queryset = WorkflowTransition.objects.select_related(
            'expediente', 'usuario', 'desde_estado', 'hacia_estado',
            'desde_departamento', 'hacia_departamento'
        )

        # Superusers see all transitions
        if user.is_superuser:
            return queryset

        # Department heads see transitions for expedientes in their department
        if user.role in ['department_head', 'supervisor', 'admin']:
            return queryset.filter(
                Q(desde_departamento=user.department) |
                Q(hacia_departamento=user.department)
            ).distinct()

        # Regular users see transitions for expedientes they have access to
        expediente_ids = Expediente.objects.filter(
            Q(departamento_actual=user.department) |
            Q(tareas__usuario_asignado=user)
        ).distinct().values_list('id', flat=True)

        return queryset.filter(expediente_id__in=expediente_ids)


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing departments and their workflow statistics.
    """

    permission_classes = [IsAuthenticatedActive]
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['workflow_order', 'name']
    ordering = ['workflow_order']

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get workflow statistics for department."""
        department = self.get_object()

        # Get expedientes count by status
        expedientes_by_status = dict(
            Expediente.objects.filter(
                departamento_actual=department
            ).values('estado_actual').annotate(
                count=Count('id')
            ).values_list('estado_actual', 'count')
        )

        # Get tasks count by status
        tasks_by_status = dict(
            Task.objects.filter(
                departamento=department
            ).values('estado').annotate(
                count=Count('id')
            ).values_list('estado', 'count')
        )

        # Get active users count
        active_users = User.objects.filter(
            department=department,
            is_active=True
        ).count()

        # Get average processing time
        avg_processing_time = Expediente.objects.filter(
            departamento_actual=department,
            fecha_completado__isnull=False
        ).aggregate(
            avg_days=Avg(
                ExpressionWrapper(
                    F('fecha_completado') - F('created_at'),
                    output_field=DurationField()
                )
            )
        )['avg_days']

        if avg_processing_time:
            avg_processing_time = avg_processing_time.days
        else:
            avg_processing_time = 0

        statistics = {
            'expedientes_by_status': expedientes_by_status,
            'tasks_by_status': tasks_by_status,
            'active_users': active_users,
            'average_processing_time': avg_processing_time,
            'total_expedientes': Expediente.objects.filter(
                departamento_actual=department
            ).count(),
            'total_tasks': Task.objects.filter(departamento=department).count(),
            'overdue_tasks': sum(
                1 for task in Task.objects.filter(departamento=department)
                if task.is_overdue()
            )
        }

        return Response(statistics)


class WorkflowStateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing workflow states.
    """

    permission_classes = [IsAuthenticatedActive]
    queryset = WorkflowState.objects.all()
    serializer_class = WorkflowStateSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name']
    ordering = ['order']