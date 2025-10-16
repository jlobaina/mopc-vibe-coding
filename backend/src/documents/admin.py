from django.contrib import admin
from .models import DocumentType, Document, DocumentReview, DocumentTemplate, DocumentAccessLog


@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'department', 'is_required',
        'max_size_mb', 'order', 'created_at'
    ]
    search_fields = ['name', 'code', 'description', 'allowed_formats']
    list_filter = ['is_required', 'department', 'created_at']
    ordering = ['order', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Información Principal', {
            'fields': ('name', 'code', 'description', 'department')
        }),
        ('Requisitos', {
            'fields': ('is_required', 'allowed_formats', 'max_size_mb', 'order')
        }),
        ('Sistema', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        'original_name', 'expediente', 'document_type',
        'status', 'version', 'uploaded_by', 'file_size',
        'expiration_date', 'created_at'
    ]
    search_fields = [
        'original_name', 'file_name', 'expediente__numero_expediente',
        'expediente__propietario_nombre', 'uploaded_by__email',
        'uploaded_by__first_name', 'uploaded_by__last_name'
    ]
    list_filter = [
        'status', 'document_type', 'mime_type', 'version', 'created_at'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'file_size',
        'hash_sha256', 'get_file_size_mb', 'get_file_extension',
        'verify_integrity', 'get_absolute_url'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Información Principal', {
            'fields': ('expediente', 'document_type', 'original_name', 'status')
        }),
        ('Archivo', {
            'fields': ('file_name', 'file_path', 'mime_type', 'file_size')
        }),
        ('Versionado', {
            'fields': ('version', 'parent_document', 'expiration_date')
        }),
        ('Subida', {
            'fields': ('uploaded_by',)
        }),
        ('Integridad', {
            'fields': ('hash_sha256',),
            'classes': ('collapse',)
        }),
        ('Sistema', {
            'fields': ('id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )

    def get_file_size_mb(self, obj):
        return obj.get_file_size_mb()
    get_file_size_mb.short_description = 'Size (MB)'

    def get_file_extension(self, obj):
        return obj.get_file_extension()
    get_file_extension.short_description = 'Extension'

    def verify_integrity(self, obj):
        return obj.verify_integrity()
    verify_integrity.boolean = True
    verify_integrity.short_description = 'Integrity OK'

    def get_absolute_url(self, obj):
        url = obj.get_absolute_url()
        return f'<a href="{url}" target="_blank">Download</a>' if url else 'N/A'
    get_absolute_url.allow_tags = True
    get_absolute_url.short_description = 'Download'


@admin.register(DocumentReview)
class DocumentReviewAdmin(admin.ModelAdmin):
    list_display = [
        'document', 'reviewer', 'result', 'review_date', 'created_at'
    ]
    search_fields = [
        'document__original_name', 'reviewer__email',
        'reviewer__first_name', 'reviewer__last_name', 'comments'
    ]
    list_filter = ['result', 'review_date', 'created_at']
    ordering = ['-review_date']
    readonly_fields = ['id', 'created_at', 'updated_at', 'review_date']
    date_hierarchy = 'review_date'


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'document_type', 'department', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'description', 'document_type__name']
    list_filter = ['document_type', 'department', 'is_active', 'created_at']
    ordering = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Información Principal', {
            'fields': ('name', 'description', 'document_type', 'department')
        }),
        ('Template', {
            'fields': ('template_file', 'variables', 'is_active')
        }),
        ('Sistema', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DocumentAccessLog)
class DocumentAccessLogAdmin(admin.ModelAdmin):
    list_display = [
        'document', 'user', 'access_type', 'ip_address', 'created_at'
    ]
    search_fields = [
        'document__original_name', 'user__email',
        'user__first_name', 'user__last_name', 'ip_address'
    ]
    list_filter = ['access_type', 'created_at']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False