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
import { DocumentType } from '@prisma/client';

// Translation function for document types (copied from DocumentSearch)
const getDocumentTypeTranslation = (type: DocumentType): string => {
  const translations: Record<DocumentType, string> = {
    LEGAL_DOCUMENT: 'Documento Legal',
    TECHNICAL_REPORT: 'Informe Técnico',
    FORM_TEMPLATE: 'Plantilla de Formulario',
    MEETING_MINUTES: 'Acta de Reunión',
    CONTRACT: 'Contrato',
    AGREEMENT: 'Acuerdo',
    CERTIFICATE: 'Certificado',
    PERMIT: 'Permiso',
    LICENSE: 'Licencia',
    CORRESPONDENCE: 'Correspondencia',
    REPORT: 'Informe',
    PRESENTATION: 'Presentación',
    MANUAL: 'Manual',
    POLICY: 'Política',
    PROCEDURE: 'Procedimiento',
    GUIDELINE: 'Directriz',
    TEMPLATE: 'Plantilla',
    FORM: 'Formulario',
    CHECKLIST: 'Lista de Verificación',
    APPROVAL: 'Aprobación',
    REJECTION: 'Rechazo',
    NOTIFICATION: 'Notificación',
    MEMORANDUM: 'Memorando',
    INVOICE: 'Factura',
    RECEIPT: 'Recibo',
    BUDGET: 'Presupuesto',
    FINANCIAL_REPORT: 'Informe Financiero',
    TAX_DOCUMENT: 'Documento Tributario',
    INSURANCE: 'Seguro',
    LEGAL_NOTICE: 'Aviso Legal',
    COURT_FILING: 'Presentación Judicial',
    EVIDENCE: 'Evidencia',
    TESTIMONY: 'Testimonio',
    EXPERT_REPORT: 'Informe Pericial',
    PHOTOGRAPH: 'Fotografía',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    BLUEPRINT: 'Plano',
    SURVEY: 'Encuesta',
    INSPECTION: 'Inspección',
    APPRAISAL: 'Avaluó',
    ENVIRONMENTAL: 'ambiental',
    SOCIAL: 'Social',
    ECONOMIC: 'Económico',
    TECHNICAL: 'Técnico',
    ENGINEERING: 'Ingeniería',
    ARCHITECTURAL: 'Arquitectónico',
    OTHER: 'Otro'
  };
  return translations[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};
import { toast } from 'react-hot-toast';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleUploadComplete = (documents: any[]) => {
    toast.success(`${documents.length} documento(s) cargados exitosamente`);
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
        <h1 className="text-3xl font-bold mb-2">Gestión de Documentos</h1>
        <p className="text-gray-600">
          Suba, organice, busque y administre todos sus documentos con funciones avanzadas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Subir Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Plantillas</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Administrar</span>
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <DocumentUpload onUploadComplete={handleUploadComplete} maxFiles={10} />
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
                  <h3 className="text-lg font-semibold">Vista Previa del Documento</h3>
                  <Button variant="outline" onClick={handleCloseViewer}>
                    Cerrar
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
                  <CardTitle>Resultados de Búsqueda</CardTitle>
                  <CardDescription>
                    {searchResults.length} documentos encontrados. Haga clic en cualquier documento para una vista previa.
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
                                {getDocumentTypeTranslation(doc.documentType)}
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
                        Ver los {searchResults.length} resultados
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
                    <span>Plantillas de documentos</span>
                  </span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva plantilla
                  </Button>
                </CardTitle>
                <CardDescription>
                  Crea y administra plantillas de documentos para documentación estandarizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Plantilla de Acuerdo Legal',
                      type: 'LEGAL_TEMPLATE',
                      description: 'Plantilla estándar de acuerdo legal',
                      usage: 24,
                      lastUsed: 'hace 2 días',
                    },
                    {
                      name: 'Plantilla de Informe Técnico',
                      type: 'TECHNICAL_REPORT',
                      description: 'Plantilla de informe de análisis técnico',
                      usage: 18,
                      lastUsed: 'hace 1 semana',
                    },
                    {
                      name: 'Plantilla de Acta de Reunión',
                      type: 'FORM_TEMPLATE',
                      description: 'Plantilla de actas y elementos de acción de reuniones',
                      usage: 45,
                      lastUsed: 'hace 3 horas',
                    },
                  ].map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-gray-600">{template.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Usado {template.usage} veces</span>
                              <span>Usado por última vez {template.lastUsed}</span>
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
                <CardTitle>Categorías de Plantillas</CardTitle>
                <CardDescription>
                  Explora plantillas por categoría y tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Plantillas Legales', count: 12, icon: '⚖️' },
                    { category: 'Informes Técnicos', count: 8, icon: '📊' },
                    { category: 'Formularios y Listas', count: 15, icon: '📋' },
                    { category: 'Cartas y Memos', count: 10, icon: '📝' },
                    { category: 'Certificados', count: 6, icon: '🏆' },
                    { category: 'Contratos', count: 7, icon: '📄' },
                  ].map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{category.category}</h4>
                          <p className="text-xs text-gray-600">{category.count} plantillas</p>
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
                  <span>Gestión de Almacenamiento</span>
                </CardTitle>
                <CardDescription>
                  Monitorea y administra el almacenamiento de documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Almacenamiento Total Usado</span>
                      <span className="font-medium">2.4 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500">24% de 10 GB asignados</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Documentos</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Archivados</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vencidos</span>
                      <span className="font-medium">23</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Descarga Masiva
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas actividades de documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      action: 'Documento subido',
                      document: 'Contrato_2024.pdf',
                      user: 'Juan Pérez',
                      time: 'hace 2 minutos',
                    },
                    {
                      action: 'Documento firmado',
                      document: 'Borrador_Acuerdo.docx',
                      user: 'María García',
                      time: 'hace 1 hora',
                    },
                    {
                      action: 'Documento compartido',
                      document: 'Informe_T4.pdf',
                      user: 'Carlos Rodríguez',
                      time: 'hace 3 horas',
                    },
                    {
                      action: 'Documento archivado',
                      document: 'Informe_Antiguo.pdf',
                      user: 'Ana Martínez',
                      time: 'hace 1 día',
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
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Tareas comunes de gestión de documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Descarga Masiva
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar Documentos Antiguos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Informe
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración del Sistema
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