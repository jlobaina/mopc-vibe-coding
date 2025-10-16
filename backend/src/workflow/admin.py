from django.contrib import admin
from .models import Expediente, WorkflowTransition, Task, TaskDependency


@admin.register(Expediente)
class ExpedienteAdmin(admin.ModelAdmin):
    list_display = [
        'numero_expediente', 'propietario_nombre', 'propietario_cedula',
        'estado_actual', 'departamento_actual', 'municipio', 'provincia',
        'valor_tasacion', 'creado_por', 'created_at'
    ]
    search_fields = [
        'numero_expediente', 'propietario_nombre', 'propietario_cedula',
        'ubicacion_direccion', 'ubicacion_municipio', 'ubicacion_provincia'
    ]
    list_filter = [
        'estado_actual', 'departamento_actual', 'ubicacion_municipio',
        'ubicacion_provincia', 'created_at'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'get_days_in_process',
        'get_workflow_progress_percentage'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Información Principal', {
            'fields': ('numero_expediente', 'estado_actual', 'departamento_actual', 'estado_workflow')
        }),
        ('Información del Propietario', {
            'fields': ('propietario_nombre', 'propietario_cedula')
        }),
        ('Ubicación', {
            'fields': ('ubicacion_direccion', 'ubicacion_municipio', 'ubicacion_provincia')
        }),
        ('Detalles del Terreno', {
            'fields': ('area_terreno', 'area_construccion', 'valor_tasacion')
        }),
        ('Seguimiento', {
            'fields': ('creado_por', 'fecha_inicio', 'fecha_completado', 'metadata')
        }),
        ('Sistema', {
            'fields': ('id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WorkflowTransition)
class WorkflowTransitionAdmin(admin.ModelAdmin):
    list_display = [
        'expediente', 'desde_estado', 'hacia_estado',
        'desde_departamento', 'hacia_departamento', 'usuario', 'created_at'
    ]
    search_fields = [
        'expediente__numero_expediente', 'expediente__propietario_nombre',
        'usuario__email', 'usuario__first_name', 'usuario__last_name',
        'comentarios', 'motivo_rechazo'
    ]
    list_filter = [
        'desde_estado', 'hacia_estado', 'desde_departamento',
        'hacia_departamento', 'created_at'
    ]
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'titulo', 'expediente', 'departamento', 'usuario_asignado',
        'tipo', 'prioridad', 'estado', 'fecha_vencimiento', 'created_at'
    ]
    search_fields = [
        'titulo', 'descripcion', 'expediente__numero_expediente',
        'expediente__propietario_nombre', 'usuario_asignado__email',
        'usuario_asignado__first_name', 'usuario_asignado__last_name'
    ]
    list_filter = [
        'tipo', 'prioridad', 'estado', 'departamento', 'created_at'
    ]
    ordering = ['prioridad', 'fecha_vencimiento', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'fecha_completacion']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Información Principal', {
            'fields': ('titulo', 'descripcion', 'expediente', 'departamento')
        }),
        ('Asignación', {
            'fields': ('usuario_asignado', 'tipo', 'prioridad', 'estado')
        }),
        ('Fechas', {
            'fields': ('fecha_vencimiento', 'fecha_completacion')
        }),
        ('Resultado', {
            'fields': ('resultado', 'depende_de')
        }),
        ('Sistema', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TaskDependency)
class TaskDependencyAdmin(admin.ModelAdmin):
    list_display = ['task', 'depends_on', 'dependency_type', 'created_at']
    search_fields = [
        'task__titulo', 'task__expediente__numero_expediente',
        'depends_on__titulo', 'depends_on__expediente__numero_expediente'
    ]
    list_filter = ['dependency_type', 'created_at']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']