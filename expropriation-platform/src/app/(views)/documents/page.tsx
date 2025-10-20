'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentSearch } from '@/components/documents/DocumentSearch';
import {
  Upload,
  Search,
  FileText,
  Archive,
  Download,
  Settings,
  Plus,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleUploadComplete = (documents: any[]) => {
    toast.success(`${documents.length} document(s) uploaded successfully`);
    setActiveTab('search');
  };

  const handleDocumentSelect = (document: any) => {
    setSelectedDocument(document);
  };

  const handleCloseViewer = () => {
    setSelectedDocument(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-gray-600">
          Upload, organize, search, and manage all your documents with advanced features
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Manage</span>
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Documents</span>
              </CardTitle>
              <CardDescription>
                Upload one or multiple documents with metadata, categorization, and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload onUploadComplete={handleUploadComplete} maxFiles={10} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <div className="space-y-6">
            {/* Search Interface */}
            <DocumentSearch
              onResults={setSearchResults}
              onResultSelect={handleDocumentSelect}
            />

            {/* Selected Document Viewer */}
            {selectedDocument && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Document Preview</h3>
                  <Button variant="outline" onClick={handleCloseViewer}>
                    Close
                  </Button>
                </div>
                <DocumentViewer
                  document={selectedDocument}
                  onClose={handleCloseViewer}
                />
              </div>
            )}

            {/* Search Results Summary */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    {searchResults.length} documents found. Click on any document to preview.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.slice(0, 6).map((doc) => (
                      <Card
                        key={doc.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleDocumentSelect(doc)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm line-clamp-1">{doc.title}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {doc.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {doc.documentType.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {doc.fileSizeFormatted}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{doc.uploadedBy?.fullName}</span>
                              <span>•</span>
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {searchResults.length > 6 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">
                        View All {searchResults.length} Results
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Document Templates</span>
                  </span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </CardTitle>
                <CardDescription>
                  Create and manage document templates for standardized documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Legal Agreement Template',
                      type: 'LEGAL_TEMPLATE',
                      description: 'Standard legal agreement template',
                      usage: 24,
                      lastUsed: '2 days ago',
                    },
                    {
                      name: 'Technical Report Template',
                      type: 'TECHNICAL_REPORT',
                      description: 'Technical analysis report template',
                      usage: 18,
                      lastUsed: '1 week ago',
                    },
                    {
                      name: 'Meeting Minutes Template',
                      type: 'FORM_TEMPLATE',
                      description: 'Meeting minutes and action items template',
                      usage: 45,
                      lastUsed: '3 hours ago',
                    },
                  ].map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-gray-600">{template.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Used {template.usage} times</span>
                              <span>Last used {template.lastUsed}</span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
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
              </CardContent>
            </Card>

            {/* Template Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Template Categories</CardTitle>
                <CardDescription>
                  Browse templates by category and type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Legal Templates', count: 12, icon: '⚖️' },
                    { category: 'Technical Reports', count: 8, icon: '📊' },
                    { category: 'Forms & Checklists', count: 15, icon: '📋' },
                    { category: 'Letters & Memos', count: 10, icon: '📝' },
                    { category: 'Certificates', count: 6, icon: '🏆' },
                    { category: 'Contracts', count: 7, icon: '📄' },
                  ].map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{category.category}</h4>
                          <p className="text-xs text-gray-600">{category.count} templates</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Storage Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Archive className="h-5 w-5" />
                  <span>Storage Management</span>
                </CardTitle>
                <CardDescription>
                  Monitor and manage document storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Storage Used</span>
                      <span className="font-medium">2.4 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500">24% of 10 GB allocated</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Documents</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Archived</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expired</span>
                      <span className="font-medium">23</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Bulk Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest document activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      action: 'Document uploaded',
                      document: 'Contract_2024.pdf',
                      user: 'John Doe',
                      time: '2 minutes ago',
                    },
                    {
                      action: 'Document signed',
                      document: 'Agreement_Draft.docx',
                      user: 'Jane Smith',
                      time: '1 hour ago',
                    },
                    {
                      action: 'Document shared',
                      document: 'Report_Q4.pdf',
                      user: 'Mike Johnson',
                      time: '3 hours ago',
                    },
                    {
                      action: 'Document archived',
                      document: 'Old_Report.pdf',
                      user: 'Sarah Wilson',
                      time: '1 day ago',
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{' '}
                          {activity.action.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-600">{activity.document}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common document management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Bulk Download
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Old Documents
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}