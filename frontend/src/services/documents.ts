import { get, post, put, del, uploadFile, downloadFile } from './api';
import {
  Document,
  DocumentUploadData,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SortOption,
} from '../types';

export interface DocumentsQuery {
  page?: number;
  limit?: number;
  filters?: SearchFilters;
  sort?: SortOption;
  expedienteId?: string;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
}

export const documentsService = {
  // Get all documents with pagination and filtering
  getDocuments: async (query: DocumentsQuery = {}): Promise<PaginatedResponse<Document>> => {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.expedienteId) params.append('expedienteId', query.expedienteId);
    if (query.sort) {
      params.append('sortBy', query.sort.field);
      params.append('sortDirection', query.sort.direction);
    }

    if (query.filters) {
      if (query.filters.query) params.append('search', query.filters.query);
      if (query.filters.status?.length) {
        query.filters.status.forEach(status => params.append('status', status));
      }
      if (query.filters.department?.length) {
        query.filters.department.forEach(dept => params.append('department', dept));
      }
      if (query.filters.dateRange) {
        params.append('dateFrom', query.filters.dateRange.start);
        params.append('dateTo', query.filters.dateRange.end);
      }
      if (query.filters.tags?.length) {
        query.filters.tags.forEach(tag => params.append('tags', tag));
      }
    }

    const response = await get<PaginatedResponse<Document>>(`/documents?${params.toString()}`);
    return response.data;
  },

  // Get single document by ID
  getDocument: async (id: string): Promise<Document> => {
    const response = await get<Document>(`/documents/${id}`);
    return response.data;
  },

  // Upload new document
  uploadDocument: async (
    data: DocumentUploadData,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);

    if (data.tags?.length) {
      data.tags.forEach(tag => formData.append('tags', tag));
    }

    if (data.expedienteId) {
      formData.append('expedienteId', data.expedienteId);
    }

    try {
      const response = await uploadFile(
        '/documents/upload',
        data.file,
        onProgress
      );

      // After file upload, update document metadata
      if (response.data) {
        const updateData: UpdateDocumentData = {
          title: data.title,
          description: data.description,
          tags: data.tags,
        };

        return await documentsService.updateDocument(response.data.id, updateData);
      }

      throw new Error('Upload failed');
    } catch (error) {
      throw error;
    }
  },

  // Update document metadata
  updateDocument: async (id: string, data: UpdateDocumentData): Promise<Document> => {
    const response = await put<Document>(`/documents/${id}`, data);
    return response.data;
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    await del<void>(`/documents/${id}`);
  },

  // Download document
  downloadDocument: async (id: string, filename?: string): Promise<void> => {
    await downloadFile(`/documents/${id}/download`, filename);
  },

  // Get document preview (for images, PDFs)
  getDocumentPreview: async (id: string): Promise<string> => {
    const response = await get<{ url: string }>(`/documents/${id}/preview`);
    return response.data.url;
  },

  // Get document categories
  getDocumentCategories: async (): Promise<Array<{
    id: string;
    name: string;
    description: string;
    color: string;
  }>> => {
    const response = await get<any[]>('/documents/categories');
    return response.data;
  },

  // Get document statistics
  getDocumentStats: async (): Promise<{
    total: number;
    totalSize: number;
    byCategory: Array<{ category: string; count: number; size: number }>;
    byType: Array<{ type: string; count: number }>;
    uploadedThisMonth: number;
    recentlyAccessed: Document[];
  }> => {
    const response = await get<any>('/documents/stats');
    return response.data;
  },

  // Search documents by content
  searchDocuments: async (
    query: string,
    options?: {
      expedienteId?: string;
      categoryId?: string;
      dateRange?: {
        start: string;
        end: string;
      };
    }
  ): Promise<Document[]> => {
    const params = new URLSearchParams();
    params.append('q', query);

    if (options?.expedienteId) params.append('expedienteId', options.expedienteId);
    if (options?.categoryId) params.append('categoryId', options.categoryId);
    if (options?.dateRange) {
      params.append('dateFrom', options.dateRange.start);
      params.append('dateTo', options.dateRange.end);
    }

    const response = await get<Document[]>(`/documents/search?${params.toString()}`);
    return response.data;
  },

  // Link document to expediente
  linkToExpediente: async (documentId: string, expedienteId: string): Promise<Document> => {
    const response = await post<Document>(`/documents/${documentId}/link`, {
      expedienteId,
    });
    return response.data;
  },

  // Unlink document from expediente
  unlinkFromExpediente: async (documentId: string): Promise<Document> => {
    const response = await post<Document>(`/documents/${documentId}/unlink`);
    return response.data;
  },

  // Get document versions (if versioning is enabled)
  getDocumentVersions: async (id: string): Promise<Array<{
    id: string;
    version: number;
    uploadedBy: any;
    uploadedAt: string;
    fileName: string;
    fileSize: number;
    notes?: string;
  }>> => {
    const response = await get<any[]>(`/documents/${id}/versions`);
    return response.data;
  },

  // Restore document to previous version
  restoreDocumentVersion: async (id: string, versionId: string): Promise<Document> => {
    const response = await post<Document>(`/documents/${id}/restore/${versionId}`);
    return response.data;
  },
};

// Export individual functions for convenience
export const getDocuments = documentsService.getDocuments;
export const getDocument = documentsService.getDocument;
export const uploadDocument = documentsService.uploadDocument;
export const updateDocument = documentsService.updateDocument;
export const deleteDocument = documentsService.deleteDocument;
export const downloadDocument = documentsService.downloadDocument;
export const getDocumentPreview = documentsService.getDocumentPreview;
export const getDocumentCategories = documentsService.getDocumentCategories;
export const getDocumentStats = documentsService.getDocumentStats;
export const searchDocuments = documentsService.searchDocuments;
export const linkToExpediente = documentsService.linkToExpediente;
export const unlinkFromExpediente = documentsService.unlinkFromExpediente;
export const getDocumentVersions = documentsService.getDocumentVersions;
export const restoreDocumentVersion = documentsService.restoreDocumentVersion;