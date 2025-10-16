import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Search,
  FilterList,
  Download,
  Visibility,
  Edit,
  Delete,
  GetApp,
  Description,
  Image,
  PictureAsPdf,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { debounce } from '@mui/material/utils';

import { useDocuments } from '../hooks/useDocuments';
import { useNotification } from '../hooks/useNotification';
import { Document, DocumentUploadData, SearchFilters, SortOption } from '../types';
import {
  DOCUMENT_STATUS,
  FILE_UPLOAD,
  formatFileSize,
  formatDate,
  formatRelativeTime,
  truncate,
  getFileExtension,
  validateFile,
} from '../utils';

// File Type Icon Component
const FileIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
  if (mimeType.startsWith('image/')) return <Image color="primary" />;
  if (mimeType === 'application/pdf') return <PictureAsPdf color="error" />;
  return <Description color="action" />;
};

// Status Chip Component
const StatusChip: React.FC<{ status: string; label: string }> = ({ status, label }) => {
  const getColor = (status: string) => {
    switch (status) {
      case DOCUMENT_STATUS.APPROVED:
        return 'success';
      case DOCUMENT_STATUS.PENDING_REVIEW:
        return 'warning';
      case DOCUMENT_STATUS.REJECTED:
        return 'error';
      case DOCUMENT_STATUS.DRAFT:
        return 'default';
      case DOCUMENT_STATUS.ARCHIVED:
        return 'secondary';
      default:
        return 'default';
    }
  };

  return <Chip label={label} size="small" color={getColor(status) as any} />;
};

// Upload Dialog Component
const UploadDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onUpload: (data: DocumentUploadData) => Promise<void>;
}> = ({ open, onClose, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
  });

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validation = validateFile(file);

      if (!validation.isValid) {
        // Handle validation errors
        return;
      }

      setFormData(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
    },
    maxSize: FILE_UPLOAD.MAX_FILE_SIZE,
    multiple: false,
  });

  const handleUpload = async () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      // Show error
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadData: DocumentUploadData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        file,
      };

      await onUpload(uploadData);
      onClose();
      setFormData({ title: '', description: '', category: '', tags: [] });
    } catch (error) {
      // Handle error
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            mb: 3,
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            {isDragActive
              ? 'Drop the file here'
              : 'Drag & drop a file here, or click to select'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Max file size: {formatFileSize(FILE_UPLOAD.MAX_FILE_SIZE)}
          </Typography>
        </Box>

        {isUploading && (
          <Box mb={3}>
            <Typography variant="body2" gutterBottom>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={isUploading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isUploading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              disabled={isUploading}
            >
              <MenuItem value="">Select a category</MenuItem>
              <MenuItem value="legal">Legal</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="administrative">Administrative</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={isUploading || !formData.title || !formData.category}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DocumentsPage: React.FC = () => {
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<SortOption>({ field: 'createdAt', direction: 'desc' });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const {
    documents,
    total,
    isLoading,
    error,
    refetch,
    uploadDocument,
    deleteDocument,
  } = useDocuments({
    page: page + 1,
    limit: rowsPerPage,
    search: searchQuery,
    filters,
    sort,
  });

  // Debounced search
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => {
      setSearchQuery(query);
      setPage(0);
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUploadDocument = async (data: DocumentUploadData) => {
    try {
      await uploadDocument(data, (progress) => {
        // Update progress if needed
      });
      showNotification('Document uploaded successfully!', 'success');
      refetch();
    } catch (error) {
      showNotification('Failed to upload document', 'error');
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      // Implement download functionality
      const link = document.createElement('a');
      link.href = document.filePath;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      showNotification('Failed to download document', 'error');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        showNotification('Document deleted successfully!', 'success');
        refetch();
      } catch (error) {
        showNotification('Failed to delete document', 'error');
      }
    }
  };

  if (error) {
    return (
      <Box className="page-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load documents: {error}
        </Alert>
        <Button onClick={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUploadDocument}
      />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Document
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status?.[0] || ''}
              onChange={(e) => {
                const status = e.target.value as string;
                setFilters(prev => ({
                  ...prev,
                  status: status ? [status] : undefined,
                }));
                setPage(0);
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value={DOCUMENT_STATUS.DRAFT}>Draft</MenuItem>
              <MenuItem value={DOCUMENT_STATUS.PENDING_REVIEW}>Pending Review</MenuItem>
              <MenuItem value={DOCUMENT_STATUS.APPROVED}>Approved</MenuItem>
              <MenuItem value={DOCUMENT_STATUS.REJECTED}>Rejected</MenuItem>
              <MenuItem value={DOCUMENT_STATUS.ARCHIVED}>Archived</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setFilters({});
                setSearchQuery('');
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {documents?.length || 0} of {total} documents
        </Typography>
      </Box>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('title')}
                >
                  Title {sort.field === 'title' && (sort.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('uploadedBy')}
                >
                  Uploaded By {sort.field === 'uploadedBy' && (sort.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('createdAt')}
                >
                  Created {sort.field === 'createdAt' && (sort.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : documents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No documents found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documents?.map((document) => (
                  <TableRow key={document.id} hover>
                    <TableCell>
                      <FileIcon mimeType={document.mimeType} />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {truncate(document.title, 50)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {truncate(document.description || '', 80)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {document.category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        status={document.status.id}
                        label={document.status.name}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(document.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatFileSize(document.fileSize)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadDocument(document)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </Box>
  );
};

export default DocumentsPage;