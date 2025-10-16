"""
Document management models for MOPC Expropriation Management System.
Handles document storage, versioning, and review processes.
"""

import uuid
import hashlib
import os
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.files.storage import default_storage

from core.models import TimeStampedModel, SoftDeleteModel, Department, User
from workflow.models import Expediente


class DocumentType(TimeStampedModel):
    """
    Defines types of documents required in the expropriation process.
    Based on the 16-step workflow requirements.
    """
    name = models.CharField(max_length=100, verbose_name=_("Document Type Name"))
    code = models.CharField(max_length=20, unique=True, verbose_name=_("Document Type Code"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    is_required = models.BooleanField(
        default=False,
        verbose_name=_("Is Required"),
        help_text=_("Whether this document type is mandatory")
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_("Department"),
        help_text=_("Department that requires this document type")
    )
    allowed_formats = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Allowed Formats"),
        help_text=_("Comma-separated list of allowed file formats (e.g., PDF,DOC,JPG)")
    )
    max_size_mb = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Max Size (MB)"),
        help_text=_("Maximum file size in megabytes")
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order")
    )

    class Meta:
        db_table = 'tipos_documento'
        verbose_name = _("Document Type")
        verbose_name_plural = _("Document Types")
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def get_allowed_formats_list(self):
        """Get allowed formats as a list."""
        if self.allowed_formats:
            return [fmt.strip().upper() for fmt in self.allowed_formats.split(',')]
        return []

    def validate_file(self, file):
        """Validate if file meets requirements."""
        # Check file size
        if self.max_size_mb and file.size > self.max_size_mb * 1024 * 1024:
            raise ValidationError(
                _("File size exceeds maximum allowed size of %(size)s MB") %
                {'size': self.max_size_mb}
            )

        # Check file format
        if self.allowed_formats:
            file_extension = os.path.splitext(file.name)[1][1:].upper()
            allowed_formats = self.get_allowed_formats_list()
            if file_extension not in allowed_formats:
                raise ValidationError(
                    _("File format %(format)s is not allowed. Allowed formats: %(allowed)s") %
                    {'format': file_extension, 'allowed': ', '.join(allowed_formats)}
                )


class Document(TimeStampedModel, SoftDeleteModel):
    """
    Stores document information with versioning support.
    Implements document management for the expropriation process.
    """
    DOCUMENT_STATUS = [
        ('activo', _('Activo')),
        ('reemplazado', _('Reemplazado')),
        ('eliminado', _('Eliminado')),
        ('en_revision', _('En Revisión')),
        ('aprobado', _('Aprobado')),
        ('rechazado', _('Rechazado')),
    ]

    expediente = models.ForeignKey(
        Expediente,
        on_delete=models.CASCADE,
        related_name='documentos',
        verbose_name=_("Expediente")
    )
    document_type = models.ForeignKey(
        DocumentType,
        on_delete=models.PROTECT,
        verbose_name=_("Document Type")
    )
    original_name = models.CharField(max_length=255, verbose_name=_("Original Name"))
    file_name = models.CharField(max_length=255, verbose_name=_("Stored File Name"))
    file_path = models.CharField(max_length=500, verbose_name=_("File Path"))
    file_size = models.PositiveIntegerField(verbose_name=_("File Size (bytes)"))
    mime_type = models.CharField(max_length=100, verbose_name=_("MIME Type"))
    hash_sha256 = models.CharField(
        max_length=64,
        verbose_name=_("SHA256 Hash"),
        help_text=_("SHA256 hash for file integrity verification")
    )
    version = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Version")
    )
    parent_document = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='versions',
        verbose_name=_("Parent Document"),
        help_text=_("Previous version of this document")
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        verbose_name=_("Uploaded By")
    )
    expiration_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Expiration Date"),
        help_text=_("Date when document expires (if applicable)")
    )
    status = models.CharField(
        max_length=20,
        choices=DOCUMENT_STATUS,
        default='activo',
        verbose_name=_("Status")
    )

    class Meta:
        db_table = 'documentos'
        verbose_name = _("Document")
        verbose_name_plural = _("Documents")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['expediente']),
            models.Index(fields=['document_type']),
            models.Index(fields=['status']),
            models.Index(fields=['hash_sha256']),
            models.Index(fields=['uploaded_by']),
        ]

    def __str__(self):
        return f"{self.original_name} - {self.expediente.numero_expediente}"

    def save(self, *args, **kwargs):
        # Calculate file hash before saving
        if self.file_path and not self.hash_sha256:
            self.hash_sha256 = self.calculate_file_hash()
        super().save(*args, **kwargs)

    def calculate_file_hash(self):
        """Calculate SHA256 hash of the file."""
        if not self.file_path or not default_storage.exists(self.file_path):
            return ""

        hash_sha256 = hashlib.sha256()
        with default_storage.open(self.file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()

    def verify_integrity(self):
        """Verify file integrity using stored hash."""
        current_hash = self.calculate_file_hash()
        return current_hash == self.hash_sha256

    def get_file_size_mb(self):
        """Get file size in megabytes."""
        return round(self.file_size / (1024 * 1024), 2)

    def get_file_extension(self):
        """Get file extension."""
        return os.path.splitext(self.original_name)[1].lower()

    def is_expired(self):
        """Check if document is expired."""
        if self.expiration_date:
            from django.utils import timezone
            return self.expiration_date < timezone.now()
        return False

    def get_latest_version(self):
        """Get the latest version of this document."""
        if self.parent_document:
            return self.parent_document.get_latest_version()

        latest = Document.objects.filter(
            parent_document=self
        ).order_by('-version').first()

        return latest if latest else self

    def create_new_version(self, new_file, uploaded_by):
        """Create a new version of this document."""
        # Deactivate current version
        self.status = 'reemplazado'
        self.save()

        # Create new version
        new_version = Document(
            expediente=self.expediente,
            document_type=self.document_type,
            original_name=new_file.name,
            file_name=new_file.name,
            file_path=self._generate_file_path(new_file.name),
            file_size=new_file.size,
            mime_type=new_file.content_type or 'application/octet-stream',
            version=self.version + 1,
            parent_document=self.get_latest_version(),
            uploaded_by=uploaded_by,
            status='activo'
        )

        # Save file
        default_storage.save(new_version.file_path, new_file)
        new_version.save()

        return new_version

    def _generate_file_path(self, filename):
        """Generate unique file path for storage."""
        import uuid
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        return f"documents/{self.expediente.numero_expediente}/{unique_filename}"

    def get_absolute_url(self):
        """Get absolute URL for document download."""
        if self.file_path:
            return default_storage.url(self.file_path)
        return None


class DocumentReview(TimeStampedModel):
    """
    Tracks document review and approval process.
    """
    REVIEW_RESULTS = [
        ('aprobado', _('Aprobado')),
        ('rechazado', _('Rechazado')),
        ('requiere_cambios', _('Requiere Cambios')),
        ('pendiente', _('Pendiente')),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='revisiones',
        verbose_name=_("Document")
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        verbose_name=_("Reviewer")
    )
    result = models.CharField(
        max_length=20,
        choices=REVIEW_RESULTS,
        default='pendiente',
        verbose_name=_("Review Result")
    )
    comments = models.TextField(
        blank=True,
        verbose_name=_("Comments"),
        help_text=_("Review comments and feedback")
    )
    review_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Review Date")
    )

    class Meta:
        db_table = 'revisiones_documento'
        verbose_name = _("Document Review")
        verbose_name_plural = _("Document Reviews")
        ordering = ['-review_date']
        indexes = [
            models.Index(fields=['document']),
            models.Index(fields=['reviewer']),
            models.Index(fields=['result']),
        ]

    def __str__(self):
        return f"Review of {self.document.original_name} by {self.reviewer.get_full_name()}"


class DocumentTemplate(TimeStampedModel):
    """
    Predefined document templates for standard forms.
    """
    name = models.CharField(max_length=255, verbose_name=_("Template Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    document_type = models.ForeignKey(
        DocumentType,
        on_delete=models.PROTECT,
        verbose_name=_("Document Type")
    )
    template_file = models.FileField(
        upload_to='templates/',
        verbose_name=_("Template File")
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        verbose_name=_("Department")
    )
    variables = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Template Variables"),
        help_text=_("Variables that can be replaced in the template")
    )
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))

    class Meta:
        db_table = 'document_templates'
        verbose_name = _("Document Template")
        verbose_name_plural = _("Document Templates")

    def __str__(self):
        return f"{self.name} - {self.document_type.name}"


class DocumentAccessLog(TimeStampedModel):
    """
    Logs all document access for audit purposes.
    """
    ACCESS_TYPES = [
        ('view', _('View')),
        ('download', _('Download')),
        ('edit', _('Edit')),
        ('delete', _('Delete')),
        ('share', _('Share')),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='access_logs',
        verbose_name=_("Document")
    )
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        verbose_name=_("User")
    )
    access_type = models.CharField(
        max_length=20,
        choices=ACCESS_TYPES,
        verbose_name=_("Access Type")
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("IP Address")
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name=_("User Agent")
    )

    class Meta:
        db_table = 'document_access_logs'
        verbose_name = _("Document Access Log")
        verbose_name_plural = _("Document Access Logs")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document']),
            models.Index(fields=['user']),
            models.Index(fields=['access_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} {self.access_type} {self.document.original_name}"