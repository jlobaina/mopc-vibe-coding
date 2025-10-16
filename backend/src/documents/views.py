"""
API views for document management.
Handles document CRUD operations, file uploads, versioning, and workflows.
"""

import os
import mimetypes
from django.db import models
from django.db import transaction
from django.http import HttpResponse, Http404
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import (
    viewsets, status, permissions, filters,
    generics, response, decorators
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError

from core.models import User
from workflow.models import Expediente
from authentication.permissions import (
    IsAuthenticatedActive, CanManageDocuments,
    HasDepartmentPermission, IsDepartmentHead
)
from .models import (
    DocumentType, Document, DocumentReview,
    DocumentTemplate, DocumentAccessLog
)
from .serializers import (
    DocumentTypeSerializer, DocumentUploadSerializer,
    DocumentSerializer, DocumentVersionSerializer,
    DocumentReviewSerializer, DocumentTemplateSerializer,
    DocumentAccessLogSerializer, DocumentSearchSerializer,
    DocumentBulkActionSerializer
)


class DocumentTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for DocumentType management."""

    serializer_class = DocumentTypeSerializer
    permission_classes = [IsAuthenticatedActive, CanManageDocuments]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_required']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']

    def get_queryset(self):
        """Get filtered queryset based on user permissions."""
        queryset = DocumentType.objects.all()

        # Non-superusers only see document types from their department
        if not self.request.user.is_superuser:
            if self.request.user.role not in ['department_head', 'supervisor', 'admin']:
                queryset = queryset.filter(department=self.request.user.department)

        return queryset

    @action(detail=False, methods=['get'])
    def required(self, request):
        """Get required document types for a specific department."""
        department_id = request.query_params.get('department_id')
        if department_id:
            document_types = self.get_queryset().filter(
                is_required=True,
                department_id=department_id
            )
        else:
            document_types = self.get_queryset().filter(is_required=True)

        serializer = self.get_serializer(document_types, many=True)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for Document management with file handling."""

    permission_classes = [IsAuthenticatedActive, CanManageDocuments]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['expediente', 'document_type', 'status', 'uploaded_by']
    search_fields = ['original_name', 'file_name']
    ordering_fields = ['created_at', 'original_name', 'file_size', 'version']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Get appropriate serializer based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            return DocumentUploadSerializer
        return DocumentSerializer

    def get_queryset(self):
        """Get filtered queryset based on user permissions."""
        queryset = Document.objects.filter(is_deleted=False)

        # Filter by user's department access
        if not self.request.user.is_superuser:
            if self.request.user.role not in ['department_head', 'supervisor', 'admin']:
                # Users can only see documents from their department's expedientes
                queryset = queryset.filter(
                    expediente__departamento_actual=self.request.user.department
                )

        return queryset.select_related(
            'expediente', 'document_type', 'uploaded_by', 'parent_document'
        ).prefetch_related('versions')

    def perform_create(self, serializer):
        """Handle document creation with file processing."""
        # Add uploader from request
        serializer.save(uploaded_by=self.request.user)

        # Log document upload
        document = serializer.instance
        DocumentAccessLog.objects.create(
            document=document,
            user=self.request.user,
            access_type='edit',
            ip_address=self.get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def get_client_ip(self):
        """Get client IP address."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download document file."""
        document = self.get_object()

        # Log download access
        DocumentAccessLog.objects.create(
            document=document,
            user=request.user,
            access_type='download',
            ip_address=self.get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        try:
            from django.core.files.storage import default_storage
            if not default_storage.exists(document.file_path):
                raise Http404(_("File not found"))

            # Open file and create response
            file_handle = default_storage.open(document.file_path, 'rb')
            response = HttpResponse(
                file_handle,
                content_type=document.mime_type or 'application/octet-stream'
            )

            # Set content disposition for download
            response['Content-Disposition'] = f'attachment; filename="{document.original_name}"'
            response['Content-Length'] = document.file_size

            return response

        except Exception as e:
            raise Http404(_("Error downloading file: %(error)s") % {'error': str(e)})

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Preview document file (for supported formats)."""
        document = self.get_object()

        # Log view access
        DocumentAccessLog.objects.create(
            document=document,
            user=request.user,
            access_type='view',
            ip_address=self.get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Check if file can be previewed (images, PDFs, text files)
        previewable_types = ['image/', 'application/pdf', 'text/']
        if not any(document.mime_type.startswith(ptype) for ptype in previewable_types):
            return Response(
                {'error': _('This file type cannot be previewed')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from django.core.files.storage import default_storage
            if not default_storage.exists(document.file_path):
                raise Http404(_("File not found"))

            file_handle = default_storage.open(document.file_path, 'rb')
            response = HttpResponse(
                file_handle,
                content_type=document.mime_type
            )

            # Set content disposition for inline viewing
            response['Content-Disposition'] = f'inline; filename="{document.original_name}"'

            return response

        except Exception as e:
            raise Http404(_("Error previewing file: %(error)s") % {'error': str(e)})

    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a new version of the document."""
        document = self.get_object()

        if 'file' not in request.FILES:
            return Response(
                {'error': _('No file provided')},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_file = request.FILES['file']

        try:
            # Validate file against document type
            document.document_type.validate_file(new_file)

            # Create new version
            new_version = document.create_new_version(new_file, request.user)

            # Log version creation
            DocumentAccessLog.objects.create(
                document=new_version,
                user=request.user,
                access_type='edit',
                ip_address=self.get_client_ip(),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            serializer = DocumentSerializer(new_version)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of this document."""
        document = self.get_object()

        # Get root document (if this is a version)
        if document.parent_document:
            root = document.parent_document
        else:
            root = document

        # Get all versions
        versions = Document.objects.filter(
            models.Q(pk=root.pk) | models.Q(parent_document=root)
        ).order_by('version')

        serializer = DocumentVersionSerializer(versions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Submit document for review or add review comments."""
        document = self.get_object()

        # Check if user can review this document
        if request.user.role not in ['department_head', 'supervisor', 'admin']:
            if document.document_type.department != request.user.department:
                return Response(
                    {'error': _('You do not have permission to review this document')},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = DocumentReviewSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            review = serializer.save(document=document)

            # Update document status based on review result
            if review.result == 'aprobado':
                document.status = 'aprobado'
            elif review.result == 'rechazado':
                document.status = 'rechazado'
            elif review.result == 'requiere_cambios':
                document.status = 'en_revision'

            document.save()

            return Response(
                DocumentReviewSerializer(review).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get all reviews for this document."""
        document = self.get_object()
        reviews = document.revisiones.select_related('reviewer').all()

        serializer = DocumentReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def verify_integrity(self, request, pk=None):
        """Verify document file integrity."""
        document = self.get_object()

        is_valid = document.verify_integrity()

        return Response({
            'document_id': document.id,
            'file_name': document.original_name,
            'integrity_verified': is_valid,
            'stored_hash': document.hash_sha256,
            'current_hash': document.calculate_file_hash() if not is_valid else document.hash_sha256
        })

    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on multiple documents."""
        serializer = DocumentBulkActionSerializer(data=request.data)

        if serializer.is_valid():
            document_ids = serializer.validated_data['document_ids']
            action_type = serializer.validated_data['action']
            comments = serializer.validated_data.get('comments', '')

            documents = Document.objects.filter(
                id__in=document_ids,
                is_deleted=False
            )

            # Check permissions for all documents
            for doc in documents:
                if not CanManageDocuments().has_object_permission(request, self, doc):
                    return Response(
                        {'error': _('You do not have permission to modify some documents')},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # Perform action
            with transaction.atomic():
                if action_type == 'approve':
                    documents.update(status='aprobado')
                elif action_type == 'reject':
                    documents.update(status='rechazado')
                elif action_type == 'archive':
                    documents.update(status='activo')  # Could implement archive status
                elif action_type == 'delete':
                    documents.update(is_deleted=True)

                # Log actions
                for doc in documents:
                    DocumentAccessLog.objects.create(
                        document=doc,
                        user=request.user,
                        access_type='delete' if action_type == 'delete' else 'edit',
                        ip_address=self.get_client_ip(),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )

            return Response({
                'message': _('Bulk action completed successfully'),
                'documents_affected': documents.count()
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced document search."""
        serializer = DocumentSearchSerializer(data=request.query_params)

        if serializer.is_valid():
            search_params = serializer.validated_data
            queryset = self.get_queryset()

            # Apply filters
            if search_params.get('q'):
                query = search_params['q']
                queryset = queryset.filter(
                    models.Q(original_name__icontains=query) |
                    models.Q(file_name__icontains=query)
                )

            if search_params.get('expediente'):
                queryset = queryset.filter(
                    expediente__numero_expediente__icontains=search_params['expediente']
                )

            if search_params.get('document_type'):
                queryset = queryset.filter(document_type_id=search_params['document_type'])

            if search_params.get('status'):
                queryset = queryset.filter(status=search_params['status'])

            if search_params.get('department'):
                queryset = queryset.filter(
                    expediente__departamento_actual_id=search_params['department']
                )

            if search_params.get('uploaded_by'):
                queryset = queryset.filter(uploaded_by_id=search_params['uploaded_by'])

            if search_params.get('date_from'):
                queryset = queryset.filter(created_at__date__gte=search_params['date_from'])

            if search_params.get('date_to'):
                queryset = queryset.filter(created_at__date__lte=search_params['date_to'])

            # Apply ordering
            ordering = search_params.get('ordering', '-created_at')
            queryset = queryset.order_by(ordering)

            # Paginate results
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = DocumentSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = DocumentSerializer(queryset, many=True)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_documents(self, request):
        """Get documents uploaded by current user."""
        queryset = self.get_queryset().filter(uploaded_by=request.user)

        # Apply additional filters
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DocumentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = DocumentSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Get expired documents."""
        from django.utils import timezone

        queryset = self.get_queryset().filter(
            expiration_date__lt=timezone.now()
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DocumentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = DocumentSerializer(queryset, many=True)
        return Response(serializer.data)


class DocumentReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for DocumentReview management."""

    serializer_class = DocumentReviewSerializer
    permission_classes = [IsAuthenticatedActive, CanManageDocuments]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['document', 'reviewer', 'result']
    ordering_fields = ['review_date', 'created_at']
    ordering = ['-review_date']

    def get_queryset(self):
        """Get filtered queryset based on user permissions."""
        queryset = DocumentReview.objects.all()

        # Filter by user's department access
        if not self.request.user.is_superuser:
            if self.request.user.role not in ['department_head', 'supervisor', 'admin']:
                # Users can only see reviews of documents from their department
                queryset = queryset.filter(
                    document__expediente__departamento_actual=self.request.user.department
                )

        return queryset.select_related('document', 'reviewer')

    def perform_create(self, serializer):
        """Handle review creation with current user as reviewer."""
        serializer.save(reviewer=self.request.user)


class DocumentTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for DocumentTemplate management."""

    serializer_class = DocumentTemplateSerializer
    permission_classes = [IsAuthenticatedActive, CanManageDocuments]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['document_type', 'department', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Get filtered queryset based on user permissions."""
        queryset = DocumentTemplate.objects.all()

        # Filter by user's department access
        if not self.request.user.is_superuser:
            if self.request.user.role not in ['department_head', 'supervisor', 'admin']:
                queryset = queryset.filter(department=self.request.user.department)

        return queryset.select_related('document_type', 'department')


class DocumentAccessLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for DocumentAccessLog (read-only)."""

    serializer_class = DocumentAccessLogSerializer
    permission_classes = [IsAuthenticatedActive, CanManageDocuments]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['document', 'user', 'access_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get filtered queryset based on user permissions."""
        queryset = DocumentAccessLog.objects.all()

        # Filter by user's department access
        if not self.request.user.is_superuser:
            if self.request.user.role not in ['department_head', 'supervisor', 'admin']:
                queryset = queryset.filter(
                    document__expediente__departamento_actual=self.request.user.department
                )

        return queryset.select_related('document', 'user')

    @action(detail=False, methods=['get'])
    def my_access(self, request):
        """Get access logs for current user."""
        queryset = self.get_queryset().filter(user=request.user)

        # Apply filters
        access_type = request.query_params.get('access_type')
        if access_type:
            queryset = queryset.filter(access_type=access_type)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)