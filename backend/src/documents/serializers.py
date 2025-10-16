"""
Serializers for document management models.
Handles document serialization, validation, and file processing.
"""

import os
import hashlib
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.core.files.uploadedfile import UploadedFile
from django.core.exceptions import ValidationError
from django.conf import settings

from core.models import Department, User
from workflow.models import Expediente
from .models import (
    DocumentType, Document, DocumentReview,
    DocumentTemplate, DocumentAccessLog
)


class DocumentTypeSerializer(serializers.ModelSerializer):
    """Serializer for DocumentType model."""

    department_name = serializers.CharField(source='department.name', read_only=True)
    allowed_formats_list = serializers.SerializerMethodField()

    class Meta:
        model = DocumentType
        fields = [
            'id', 'name', 'code', 'description', 'is_required',
            'department', 'department_name', 'allowed_formats',
            'allowed_formats_list', 'max_size_mb', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_allowed_formats_list(self, obj):
        """Get allowed formats as a list."""
        return obj.get_allowed_formats_list()


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for document upload operations."""

    file = serializers.FileField(
        write_only=True,
        required=True,
        help_text=_("File to upload")
    )

    expediente_number = serializers.CharField(
        source='expediente.numero_expediente',
        read_only=True
    )

    document_type_name = serializers.CharField(
        source='document_type.name',
        read_only=True
    )

    uploader_name = serializers.CharField(
        source='uploaded_by.get_full_name',
        read_only=True
    )

    file_size_mb = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    is_latest_version = serializers.SerializerMethodField()
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'expediente', 'expediente_number', 'document_type',
            'document_type_name', 'original_name', 'file_name',
            'file_path', 'file_size', 'file_size_mb', 'mime_type',
            'file_extension', 'hash_sha256', 'version', 'parent_document',
            'uploaded_by', 'uploader_name', 'expiration_date',
            'status', 'download_url', 'is_latest_version', 'version_count',
            'created_at', 'updated_at', 'file'
        ]
        read_only_fields = [
            'file_name', 'file_path', 'file_size', 'mime_type',
            'hash_sha256', 'version', 'uploaded_by', 'created_at', 'updated_at'
        ]

    def get_file_size_mb(self, obj):
        """Get file size in megabytes."""
        return obj.get_file_size_mb()

    def get_file_extension(self, obj):
        """Get file extension."""
        return obj.get_file_extension()

    def get_download_url(self, obj):
        """Get download URL."""
        return obj.get_absolute_url()

    def get_is_latest_version(self, obj):
        """Check if this is the latest version."""
        return obj == obj.get_latest_version()

    def get_version_count(self, obj):
        """Get total number of versions for this document."""
        if obj.parent_document:
            return Document.objects.filter(
                parent_document=obj.parent_document
            ).count() + 1
        return Document.objects.filter(
            parent_document=obj
        ).count() + 1

    def validate_file(self, value):
        """Validate uploaded file."""
        if not isinstance(value, UploadedFile):
            raise serializers.ValidationError(_("Invalid file upload"))

        # Check file size (global limit)
        max_size = getattr(settings, 'MAX_DOCUMENT_SIZE_MB', 100)
        if value.size > max_size * 1024 * 1024:
            raise serializers.ValidationError(
                _("File size exceeds maximum allowed size of %(size)s MB") %
                {'size': max_size}
            )

        return value

    def validate(self, attrs):
        """Validate document data."""
        document_type = attrs.get('document_type')
        file_obj = attrs.get('file')

        if document_type and file_obj:
            # Validate file against document type requirements
            try:
                document_type.validate_file(file_obj)
            except ValidationError as e:
                raise serializers.ValidationError({'file': str(e)})

        return attrs

    def create(self, validated_data):
        """Create document with file processing."""
        file_obj = validated_data.pop('file')
        uploaded_by = self.context['request'].user

        # Set file-related fields
        validated_data.update({
            'original_name': file_obj.name,
            'file_name': file_obj.name,
            'file_size': file_obj.size,
            'mime_type': file_obj.content_type or 'application/octet-stream',
            'uploaded_by': uploaded_by,
        })

        # Create document instance
        document = super().create(validated_data)

        # Generate unique file path and save file
        document.file_path = document._generate_file_path(file_obj.name)
        from django.core.files.storage import default_storage
        default_storage.save(document.file_path, file_obj)

        # Calculate and save file hash
        document.hash_sha256 = document.calculate_file_hash()
        document.save()

        return document


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model (read operations)."""

    expediente_number = serializers.CharField(
        source='expediente.numero_expediente',
        read_only=True
    )

    document_type_name = serializers.CharField(
        source='document_type.name',
        read_only=True
    )

    uploader_name = serializers.CharField(
        source='uploaded_by.get_full_name',
        read_only=True
    )

    file_size_mb = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    integrity_verified = serializers.SerializerMethodField()
    is_latest_version = serializers.SerializerMethodField()
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'expediente', 'expediente_number', 'document_type',
            'document_type_name', 'original_name', 'file_name',
            'file_path', 'file_size', 'file_size_mb', 'mime_type',
            'file_extension', 'hash_sha256', 'version', 'parent_document',
            'uploaded_by', 'uploader_name', 'expiration_date',
            'status', 'download_url', 'is_expired', 'integrity_verified',
            'is_latest_version', 'version_count', 'created_at', 'updated_at'
        ]
        read_only_fields = fields

    def get_file_size_mb(self, obj):
        """Get file size in megabytes."""
        return obj.get_file_size_mb()

    def get_file_extension(self, obj):
        """Get file extension."""
        return obj.get_file_extension()

    def get_download_url(self, obj):
        """Get download URL."""
        return obj.get_absolute_url()

    def get_is_expired(self, obj):
        """Check if document is expired."""
        return obj.is_expired()

    def get_integrity_verified(self, obj):
        """Verify file integrity."""
        return obj.verify_integrity()

    def get_is_latest_version(self, obj):
        """Check if this is the latest version."""
        return obj == obj.get_latest_version()

    def get_version_count(self, obj):
        """Get total number of versions for this document."""
        if obj.parent_document:
            return Document.objects.filter(
                parent_document=obj.parent_document
            ).count() + 1
        return Document.objects.filter(
            parent_document=obj
        ).count() + 1


class DocumentVersionSerializer(serializers.ModelSerializer):
    """Serializer for document version information."""

    uploader_name = serializers.CharField(
        source='uploaded_by.get_full_name',
        read_only=True
    )

    file_size_mb = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'original_name', 'version', 'file_size', 'file_size_mb',
            'mime_type', 'status', 'uploaded_by', 'uploader_name',
            'download_url', 'is_current', 'created_at'
        ]
        read_only_fields = fields

    def get_file_size_mb(self, obj):
        """Get file size in megabytes."""
        return obj.get_file_size_mb()

    def get_download_url(self, obj):
        """Get download URL."""
        return obj.get_absolute_url()

    def get_is_current(self, obj):
        """Check if this is the current active version."""
        return obj.status == 'activo'


class DocumentReviewSerializer(serializers.ModelSerializer):
    """Serializer for DocumentReview model."""

    reviewer_name = serializers.CharField(
        source='reviewer.get_full_name',
        read_only=True
    )

    document_title = serializers.CharField(
        source='document.original_name',
        read_only=True
    )

    result_display = serializers.CharField(
        source='get_result_display',
        read_only=True
    )

    class Meta:
        model = DocumentReview
        fields = [
            'id', 'document', 'document_title', 'reviewer', 'reviewer_name',
            'result', 'result_display', 'comments', 'review_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['reviewer', 'review_date', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Create document review with current user as reviewer."""
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class DocumentTemplateSerializer(serializers.ModelSerializer):
    """Serializer for DocumentTemplate model."""

    document_type_name = serializers.CharField(
        source='document_type.name',
        read_only=True
    )

    department_name = serializers.CharField(
        source='department.name',
        read_only=True
    )

    template_file_url = serializers.SerializerMethodField()

    class Meta:
        model = DocumentTemplate
        fields = [
            'id', 'name', 'description', 'document_type', 'document_type_name',
            'department', 'department_name', 'template_file', 'template_file_url',
            'variables', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_template_file_url(self, obj):
        """Get template file URL."""
        if obj.template_file:
            return obj.template_file.url
        return None


class DocumentAccessLogSerializer(serializers.ModelSerializer):
    """Serializer for DocumentAccessLog model."""

    user_name = serializers.CharField(
        source='user.get_full_name',
        read_only=True
    )

    document_title = serializers.CharField(
        source='document.original_name',
        read_only=True
    )

    access_type_display = serializers.CharField(
        source='get_access_type_display',
        read_only=True
    )

    class Meta:
        model = DocumentAccessLog
        fields = [
            'id', 'document', 'document_title', 'user', 'user_name',
            'access_type', 'access_type_display', 'ip_address',
            'user_agent', 'created_at'
        ]
        read_only_fields = fields


class DocumentSearchSerializer(serializers.Serializer):
    """Serializer for document search parameters."""

    q = serializers.CharField(
        required=False,
        help_text=_("Search query for document names")
    )

    expediente = serializers.CharField(
        required=False,
        help_text=_("Filter by expediente number")
    )

    document_type = serializers.IntegerField(
        required=False,
        help_text=_("Filter by document type ID")
    )

    status = serializers.ChoiceField(
        choices=Document.DOCUMENT_STATUS,
        required=False,
        help_text=_("Filter by document status")
    )

    department = serializers.IntegerField(
        required=False,
        help_text=_("Filter by department ID")
    )

    uploaded_by = serializers.IntegerField(
        required=False,
        help_text=_("Filter by uploader ID")
    )

    date_from = serializers.DateField(
        required=False,
        help_text=_("Filter documents from date")
    )

    date_to = serializers.DateField(
        required=False,
        help_text=_("Filter documents to date")
    )

    ordering = serializers.ChoiceField(
        choices=[
            ('-created_at', 'Newest first'),
            ('created_at', 'Oldest first'),
            ('original_name', 'Name (A-Z)'),
            ('-original_name', 'Name (Z-A)'),
            ('file_size', 'Size (smallest first)'),
            ('-file_size', 'Size (largest first)'),
        ],
        default='-created_at',
        required=False,
        help_text=_("Ordering of results")
    )


class DocumentBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk document actions."""

    document_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text=_("List of document IDs to process")
    )

    action = serializers.ChoiceField(
        choices=[
            ('approve', 'Approve documents'),
            ('reject', 'Reject documents'),
            ('archive', 'Archive documents'),
            ('delete', 'Delete documents'),
        ],
        help_text=_("Action to perform on documents")
    )

    comments = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_("Comments for the action (if applicable)")
    )

    def validate_document_ids(self, value):
        """Validate that all document IDs exist."""
        from django.db.models import Q
        existing_ids = Document.objects.filter(
            Q(id__in=value) & Q(is_deleted=False)
        ).values_list('id', flat=True)

        missing_ids = set(value) - set(existing_ids)
        if missing_ids:
            raise serializers.ValidationError(
                _("Documents with IDs %(ids)s do not exist or are deleted") %
                {'ids': ', '.join(map(str, missing_ids))}
            )

        return value