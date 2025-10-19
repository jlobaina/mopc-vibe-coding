'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  X,
  Calendar,
  FileText,
  Tag,
  User,
  Download,
  Eye,
  Clock,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { debounce } from 'lodash-es';
import { toast } from 'react-hot-toast';
import {
  DocumentType,
  DocumentCategory,
  DocumentStatus,
  DocumentSecurityLevel
} from '@prisma/client';

interface DocumentSearchProps {
  onResults?: (results: any[]) => void;
  onResultSelect?: (document: any) => void;
  compact?: boolean;
  initialQuery?: string;
}

interface SearchFilters {
  documentTypes: DocumentType[];
  categories: DocumentCategory[];
  statuses: DocumentStatus[];
  securityLevels: DocumentSecurityLevel[];
  tags: string[];
  uploadedBy: string[];
  caseIds: string[];
  dateRange: {
    from: string;
    to: string;
  };
  sizeRange: {
    min: number;
    max: number;
  };
  hasVersions: boolean | undefined;
  hasSignatures: boolean | undefined;
  isExpired: boolean | undefined;
}

interface SearchResults {
  results: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  search: {
    query: string;
    filters: SearchFilters;
    sort: {
      field: string;
      order: string;
    };
    facets: any;
  };
}

export function DocumentSearch({
  onResults,
  onResultSelect,
  compact = false,
  initialQuery = ''
}: DocumentSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    documentTypes: [],
    categories: [],
    statuses: [],
    securityLevels: [],
    tags: [],
    uploadedBy: [],
    caseIds: [],
    dateRange: { from: '', to: '' },
    sizeRange: { min: 0, max: 0 },
    hasVersions: undefined,
    hasSignatures: undefined,
    isExpired: undefined,
  });

  const [sort, setSort] = useState({
    field: 'relevance',
    order: 'desc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/documents/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300),
    []
  );

  // Handle query change
  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
    setPagination({ ...pagination, page: 1 });
  };

  // Perform search
  const performSearch = useCallback(async () => {
    if (query.trim().length === 0) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          filters: getActiveFilters(),
          sort,
          pagination,
          includeContent: true,
        }),
      });

      if (response.ok) {
        const data: SearchResults = await response.json();
        setResults(data);
        onResults?.(data.results);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Search failed');
      }
    } catch (error) {
      toast.error('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, sort, pagination, onResults]);

  // Get active filters (non-empty values)
  const getActiveFilters = () => {
    const activeFilters: any = {};

    if (filters.documentTypes.length > 0) {
      activeFilters.documentTypes = filters.documentTypes;
    }
    if (filters.categories.length > 0) {
      activeFilters.categories = filters.categories;
    }
    if (filters.statuses.length > 0) {
      activeFilters.statuses = filters.statuses;
    }
    if (filters.securityLevels.length > 0) {
      activeFilters.securityLevels = filters.securityLevels;
    }
    if (filters.tags.length > 0) {
      activeFilters.tags = filters.tags;
    }
    if (filters.uploadedBy.length > 0) {
      activeFilters.uploadedBy = filters.uploadedBy;
    }
    if (filters.caseIds.length > 0) {
      activeFilters.caseIds = filters.caseIds;
    }
    if (filters.dateRange.from || filters.dateRange.to) {
      activeFilters.dateRange = filters.dateRange;
    }
    if (filters.sizeRange.min > 0 || filters.sizeRange.max > 0) {
      activeFilters.sizeRange = filters.sizeRange;
    }
    if (filters.hasVersions !== undefined) {
      activeFilters.hasVersions = filters.hasVersions;
    }
    if (filters.hasSignatures !== undefined) {
      activeFilters.hasSignatures = filters.hasSignatures;
    }
    if (filters.isExpired !== undefined) {
      activeFilters.isExpired = filters.isExpired;
    }

    return activeFilters;
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      documentTypes: [],
      categories: [],
      statuses: [],
      securityLevels: [],
      tags: [],
      uploadedBy: [],
      caseIds: [],
      dateRange: { from: '', to: '' },
      sizeRange: { min: 0, max: 0 },
      hasVersions: undefined,
      hasSignatures: undefined,
      isExpired: undefined,
    });
    setPagination({ ...pagination, page: 1 });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    const activeFilters = getActiveFilters();
    return Object.keys(activeFilters).length;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get relevance score color
  const getRelevanceColor = (score: number) => {
    if (score >= 20) return 'text-green-600';
    if (score >= 10) return 'text-yellow-600';
    return 'text-gray-500';
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSort({
      field,
      order: sort.field === field && sort.order === 'desc' ? 'asc' : 'desc',
    });
    setPagination({ ...pagination, page: 1 });
  };

  // Render filter panel
  const renderFilterPanel = () => (
    <Card className="w-80 h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-96">
          {/* Document Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Document Types</Label>
            <div className="space-y-2">
              {Object.values(DocumentType).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.documentTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters({
                          ...filters,
                          documentTypes: [...filters.documentTypes, type],
                        });
                      } else {
                        setFilters({
                          ...filters,
                          documentTypes: filters.documentTypes.filter((t) => t !== type),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm">
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categories</Label>
            <div className="space-y-2">
              {Object.values(DocumentCategory).map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters({
                          ...filters,
                          categories: [...filters.categories, category],
                        });
                      } else {
                        setFilters({
                          ...filters,
                          categories: filters.categories.filter((c) => c !== category),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm">
                    {category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {Object.values(DocumentStatus).map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters({
                          ...filters,
                          statuses: [...filters.statuses, status],
                        });
                      } else {
                        setFilters({
                          ...filters,
                          statuses: filters.statuses.filter((s) => s !== status),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm">
                    {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From"
                value={filters.dateRange.from}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, from: e.target.value },
                  })
                }
              />
              <Input
                type="date"
                placeholder="To"
                value={filters.dateRange.to}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, to: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Filters</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasVersions"
                  checked={filters.hasVersions === true}
                  onCheckedChange={(checked) =>
                    setFilters({
                      ...filters,
                      hasVersions: checked === true ? true : undefined,
                    })
                  }
                />
                <Label htmlFor="hasVersions" className="text-sm">
                  Has versions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasSignatures"
                  checked={filters.hasSignatures === true}
                  onCheckedChange={(checked) =>
                    setFilters({
                      ...filters,
                      hasSignatures: checked === true ? true : undefined,
                    })
                  }
                />
                <Label htmlFor="hasSignatures" className="text-sm">
                  Has signatures
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isExpired"
                  checked={filters.isExpired === true}
                  onCheckedChange={(checked) =>
                    setFilters({
                      ...filters,
                      isExpired: checked === true ? true : undefined,
                    })
                  }
                />
                <Label htmlFor="isExpired" className="text-sm">
                  Is expired
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Render search results
  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Found {results.pagination.total} results
            {results.search.query && (
              <span> for "{results.search.query}"</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Select value={sort.field} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="fileSize">Size</SelectItem>
                <SelectItem value="downloadCount">Downloads</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSortChange(sort.field)}
            >
              {sort.order === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {results.results.map((document) => (
            <Card
              key={document.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onResultSelect?.(document)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{document.title}</h3>
                      {document.relevanceScore && (
                        <Badge
                          variant="secondary"
                          className={getRelevanceColor(document.relevanceScore)}
                        >
                          {document.relevanceScore}% match
                        </Badge>
                      )}
                    </div>
                    {document.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    {document.contentSnippet && (
                      <div className="text-sm text-gray-600">
                        <p className="line-clamp-2">
                          {document.contentSnippet.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{document.originalFileName}</span>
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>{document.uploadedBy?.fullName}</span>
                      <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {document.documentType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                      <Badge variant="secondary">
                        {document.category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                      {document.tags.map((tag: any) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {results.pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={results.pagination.page === 1}
              onClick={() => handlePageChange(results.pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {results.pagination.page} of {results.pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={results.pagination.page === results.pagination.pages}
              onClick={() => handlePageChange(results.pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Search on query, filters, sort, or pagination change
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query, filters, sort, pagination.page]);

  return (
    <div className={compact ? '' : 'max-w-6xl mx-auto'}>
      <div className={compact ? '' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}>
        {/* Search Header */}
        <div className={compact ? '' : 'lg:col-span-3'}>
          <Card>
            <CardHeader>
              <CardTitle>Document Search</CardTitle>
              <CardDescription>
                Search through all documents using advanced filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  className="pl-10 pr-20"
                />
                <div className="absolute right-2 top-2 flex items-center space-x-1">
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {getActiveFilterCount()} filters
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={performSearch}
                    disabled={isLoading || !query.trim()}
                    size="sm"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Filters */}
              {getActiveFilterCount() > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filters.documentTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() =>
                          setFilters({
                            ...filters,
                            documentTypes: filters.documentTypes.filter((t) => t !== type),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {filters.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() =>
                          setFilters({
                            ...filters,
                            categories: filters.categories.filter((c) => c !== category),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {renderResults()}
        </div>

        {/* Filter Panel */}
        {!compact && (
          <div className="lg:col-span-1">
            {renderFilterPanel()}
          </div>
        )}
      </div>
    </div>
  );
}