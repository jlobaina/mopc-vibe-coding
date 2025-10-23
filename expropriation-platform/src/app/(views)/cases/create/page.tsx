'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'react-hot-toast'

import { CreateCaseInput } from '@/lib/validations/case'
import { User, Department, Document } from '@/types/client'
import { CaseCreationDocuments } from '@/components/cases/case-creation-documents'

const CASE_STAGES = [
  { value: 'INITIAL_REVIEW', label: 'Revisión Inicial' },
  { value: 'LEGAL_REVIEW', label: 'Revisión Legal' },
  { value: 'TECHNICAL_EVALUATION', label: 'Evaluación Técnica' },
  { value: 'APPRAISAL', label: 'Tasación' },
  { value: 'NEGOTIATION', label: 'Negociación' },
  { value: 'DOCUMENTATION', label: 'Documentación' },
  { value: 'PUBLIC_CONSULTATION', label: 'Consulta Pública' },
  { value: 'APPROVAL', label: 'Aprobación' },
  { value: 'PAYMENT', label: 'Pago' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'FINAL_CLOSURE', label: 'Cierre Final' }
]

const PRIORITIES = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' }
]

const PROPERTY_TYPES = [
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'agricola', label: 'Agrícola' },
  { value: 'gubernamental', label: 'Gubernamental' },
  { value: 'terreno', label: 'Terreno Baldío' },
  { value: 'otro', label: 'Otro' }
]

const OWNER_TYPES = [
  { value: 'individual', label: 'Persona Individual' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'gobierno', label: 'Gobierno' },
  { value: 'organizacion', label: 'Organización' },
  { value: 'sucesion', label: 'Sucesión' }
]

interface CaseCreationDocument {
  file: File
  title: string
  description: string
  documentType: string
  category: string
  securityLevel: string
  tags: string
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'complete' | 'error'
  uploadError?: string
  documentId?: string
}

const STEPS = [
  { id: 'basic', title: 'Información Básica', required: ['fileNumber', 'title'] },
  { id: 'property', title: 'Propiedad', required: ['propertyAddress', 'propertyCity', 'propertyProvince'] },
  { id: 'owner', title: 'Propietario', required: ['ownerName'] },
  { id: 'documents', title: 'Documentos', required: [] },
  { id: 'assignment', title: 'Asignación', required: ['departmentId'] }
]

export default function CreateCasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showValidationAlert, setShowValidationAlert] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [existingDocuments, setExistingDocuments] = useState<Document[]>([])
  const [selectedExistingDocuments, setSelectedExistingDocuments] = useState<string[]>([])
  const [documents, setDocuments] = useState<CaseCreationDocument[]>([])
  const [isDraft, setIsDraft] = useState(false)
  const [formData, setFormData] = useState<CreateCaseInput>({
    fileNumber: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    currentStage: 'INITIAL_REVIEW',
    propertyAddress: '',
    propertyCity: '',
    propertyProvince: '',
    propertyDescription: '',
    propertyType: '',
    propertyArea: undefined,
    propertyCoordinates: '',
    ownerName: '',
    ownerIdentification: '',
    ownerContact: '',
    ownerEmail: '',
    ownerAddress: '',
    ownerType: 'individual',
    estimatedValue: undefined,
    currency: 'DOP',
    expropriationDecree: '',
    judicialCaseNumber: '',
    legalStatus: '',
    departmentId: '',
    assignedToId: 'UNASSIGNED',
    supervisedById: 'UNASSIGNED'
  })

  // Initialize form data and fetch initial data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDepartments()
      generateCaseNumber()
      fetchExistingDocuments()
    }
  }, [status])

  // Fetch users when department is selected
  useEffect(() => {
    if (formData.departmentId) {
      fetchDepartmentUsers(formData.departmentId)
    }
  }, [formData.departmentId])

  // Generate case number autofill
  const generateCaseNumber = async () => {
    try {
      const response = await fetch('/api/cases/generate-number')
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, fileNumber: data.fileNumber }))
      }
    } catch (error) {
      console.error('Error generating case number:', error)
    }
  }

  // Fetch existing documents for selection
  const fetchExistingDocuments = async () => {
    try {
      const response = await fetch('/api/documents?limit=50')
      if (response.ok) {
        const data = await response.json()
        setExistingDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching existing documents:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (!response.ok) {throw new Error('Failed to fetch departments')}
      const data = await response.json()
      setDepartments(data.departments || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Error al cargar los departamentos')
    }
  }

  const fetchDepartmentUsers = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/users`)
      if (!response.ok) {throw new Error('Failed to fetch users')}
      const data = await response.json()
      setUsers(data.users || [])
      // Reset assignments if department changes
      setFormData(prev => ({
        ...prev,
        assignedToId: 'UNASSIGNED',
        supervisedById: 'UNASSIGNED'
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar los usuarios del departamento')
    }
  }

  const handleInputChange = (field: keyof CreateCaseInput, value: any) => {
    // Convert "UNASSIGNED" to undefined for user assignment fields
    if ((field === 'assignedToId' || field === 'supervisedById') && value === 'UNASSIGNED') {
      value = undefined
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNumberChange = (field: keyof CreateCaseInput, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    if (!isNaN(numValue as number)) {
      setFormData(prev => ({ ...prev, [field]: numValue }))
    }
  }

  // Validation function for current step
  const validateCurrentStep = () => {
    const step = STEPS[currentStep]
    const missingFields = step.required.filter(field => {
      const value = formData[field as keyof CreateCaseInput]
      return !value || (typeof value === 'string' && value.trim() === '')
    })

    if (missingFields.length > 0) {
      setShowValidationAlert(true)
      return false
    }

    setShowValidationAlert(false)
    return true
  }

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
    setShowValidationAlert(false)
  }

  // Save draft functionality
  const saveDraft = async () => {
    setSavingDraft(true)
    try {
      const draftData = {
        ...formData,
        isDraft: true,
        documents: documents.map(doc => ({
          title: doc.title,
          description: doc.description,
          documentType: doc.documentType,
          category: doc.category,
          securityLevel: doc.securityLevel,
          tags: doc.tags
        })),
        existingDocuments: selectedExistingDocuments
      }

      // Save to localStorage for now (in production, this would be saved to database)
      localStorage.setItem('caseDraft', JSON.stringify(draftData))
      setIsDraft(true)
      toast.success('Borrador guardado exitosamente')
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Error al guardar el borrador')
    } finally {
      setSavingDraft(false)
    }
  }

  // Load draft if exists
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem('caseDraft')
      if (draftData) {
        const draft = JSON.parse(draftData)
        setFormData(draft)
        if (draft.existingDocuments) {
          setSelectedExistingDocuments(draft.existingDocuments)
        }
        setIsDraft(true)
        toast.success('Borrador cargado exitosamente')
      }
    } catch (error) {
      console.error('Error loading draft:', error)
      toast.error('Error al cargar el borrador')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.fileNumber.trim()) {
      toast.error('El número de expediente es requerido')
      return
    }
    if (!formData.title.trim()) {
      toast.error('El título es requerido')
      return
    }
    if (!formData.propertyAddress.trim()) {
      toast.error('La dirección de la propiedad es requerida')
      return
    }
    if (!formData.propertyCity.trim()) {
      toast.error('La ciudad es requerida')
      return
    }
    if (!formData.propertyProvince.trim()) {
      toast.error('La provincia es requerida')
      return
    }
    if (!formData.ownerName.trim()) {
      toast.error('El nombre del propietario es requerido')
      return
    }
    if (!formData.departmentId) {
      toast.error('El departamento es requerido')
      return
    }

    setLoading(true)
    try {
      // First, create the case
      const caseResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!caseResponse.ok) {
        const errorData = await caseResponse.json()
        throw new Error(errorData.error || 'Failed to create case')
      }

      const newCase = await caseResponse.json()
      toast.success('Caso creado exitosamente')

      // Link existing documents
      if (selectedExistingDocuments.length > 0) {
        await linkExistingDocuments(newCase.id)
      }

      // If there are new documents, upload them
      if (documents.length > 0) {
        await uploadDocuments(newCase.id)
      }

      // Clear draft after successful creation
      localStorage.removeItem('caseDraft')
      toast.success('Caso creado exitosamente')
      router.push(`/cases/${newCase.id}`)
    } catch (error) {
      console.error('Error creating case:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el caso')
    } finally {
      setLoading(false)
    }
  }

  const linkExistingDocuments = async (caseId: string) => {
    try {
      const linkPromises = selectedExistingDocuments.map(docId =>
        fetch(`/api/cases/${caseId}/documents/link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId: docId }),
        })
      )

      await Promise.all(linkPromises)
      toast.success(`${selectedExistingDocuments.length} documento(s) existente(s) vinculado(s)`)
    } catch (error) {
      console.error('Error linking existing documents:', error)
      toast.error('Error al vincular documentos existentes')
    }
  }

  const uploadDocuments = async (caseId: string) => {
    const uploadPromises = documents.map(async (doc) => {
      try {
        // Update document status to uploading
        setDocuments(prev => prev.map(d =>
          d.file === doc.file ? { ...d, uploadStatus: 'uploading' as const, uploadProgress: 0 } : d
        ))

        const formData = new FormData()
        formData.append('file', doc.file)
        formData.append('documentData', JSON.stringify({
          title: doc.title,
          description: doc.description,
          documentType: doc.documentType,
          category: doc.category,
          securityLevel: doc.securityLevel,
          tags: doc.tags,
          caseId,
        }))

        // Simulate progress
        const progressInterval = setInterval(() => {
          setDocuments(prev => prev.map(d =>
            d.file === doc.file ? {
              ...d,
              uploadProgress: Math.min((d.uploadProgress || 0) + 10, 90)
            } : d
          ))
        }, 200)

        const response = await fetch(`/api/cases/${caseId}/documents`, {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const document = await response.json()

        // Update document status to complete
        setDocuments(prev => prev.map(d =>
          d.file === doc.file ? {
            ...d,
            uploadStatus: 'complete' as const,
            uploadProgress: 100,
            documentId: document.id
          } : d
        ))

        return document
      } catch (error) {
        console.error('Upload error:', error)

        // Update document status to error
        setDocuments(prev => prev.map(d =>
          d.file === doc.file ? {
            ...d,
            uploadStatus: 'error' as const,
            uploadError: error instanceof Error ? error.message : 'Unknown error'
          } : d
        ))

        toast.error(`Error al subir ${doc.title}`)
        throw error
      }
    })

    try {
      await Promise.all(uploadPromises)
      toast.success(`${documents.length} documento(s) subido(s) exitosamente`)
    } catch (error) {
      toast.error('Algunos documentos no pudieron ser subidos')
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Caso</h1>
            <p className="text-muted-foreground">
              Complete el formulario paso a paso para crear un nuevo caso de expropiación
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Borrador
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={loadDraft}
            disabled={loading || savingDraft}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Cargar Borrador
          </Button>
          <Button
            variant="outline"
            onClick={saveDraft}
            disabled={loading || savingDraft}
          >
            <Save className="mr-2 h-4 w-4" />
            {savingDraft ? 'Guardando...' : 'Guardar Borrador'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Paso {currentStep + 1} de {STEPS.length}</span>
          <span className="text-sm text-muted-foreground">{STEPS[currentStep].title}</span>
        </div>
        <Progress value={((currentStep + 1) / STEPS.length) * 100} className="w-full" />
      </div>

      {/* Validation Alert */}
      {showValidationAlert && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Campos requeridos faltantes</AlertTitle>
          <AlertDescription className="text-orange-700">
            Por favor complete todos los campos requeridos antes de continuar al siguiente paso.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={STEPS[currentStep].id} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {STEPS.map((step, index) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                disabled={index > currentStep}
                className={index <= currentStep ? "text-primary" : "text-muted-foreground"}
              >
                {step.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica del Caso</CardTitle>
                <CardDescription>
                  Información general y estado inicial del caso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileNumber">Número de Expediente *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fileNumber"
                        value={formData.fileNumber}
                        onChange={(e) => handleInputChange('fileNumber', e.target.value)}
                        placeholder="EXP-2024-001"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateCaseNumber}
                        title="Generar número automáticamente"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Puede generar automáticamente o ingresar manualmente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título del Caso *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Breve descripción del caso"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descripción detallada del caso y circunstancias"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStage">Etapa Inicial</Label>
                    <Select
                      value={formData.currentStage}
                      onValueChange={(value) => handleInputChange('currentStage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        {CASE_STAGES.map(stage => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedEndDate">Fecha Estimada de Finalización</Label>
                    <Input
                      id="expectedEndDate"
                      type="date"
                      value={formData.expectedEndDate ? new Date(formData.expectedEndDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('expectedEndDate', e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Information Tab */}
          <TabsContent value="property">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Propiedad</CardTitle>
                <CardDescription>
                  Detalles sobre el inmueble a expropiar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">Dirección de la Propiedad *</Label>
                  <Input
                    id="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                    placeholder="Calle Principal #123, Ciudad"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyCity">Ciudad *</Label>
                    <Input
                      id="propertyCity"
                      value={formData.propertyCity}
                      onChange={(e) => handleInputChange('propertyCity', e.target.value)}
                      placeholder="Santo Domingo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyProvince">Provincia *</Label>
                    <Input
                      id="propertyProvince"
                      value={formData.propertyProvince}
                      onChange={(e) => handleInputChange('propertyProvince', e.target.value)}
                      placeholder="Santo Domingo"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Tipo de Propiedad</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => handleInputChange('propertyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyArea">Área (m²)</Label>
                    <Input
                      id="propertyArea"
                      type="number"
                      step="0.01"
                      value={formData.propertyArea || ''}
                      onChange={(e) => handleNumberChange('propertyArea', e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyDescription">Descripción de la Propiedad</Label>
                  <Textarea
                    id="propertyDescription"
                    value={formData.propertyDescription}
                    onChange={(e) => handleInputChange('propertyDescription', e.target.value)}
                    placeholder="Descripción detallada de las características de la propiedad"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyCoordinates">Coordenadas GPS</Label>
                  <Input
                    id="propertyCoordinates"
                    value={formData.propertyCoordinates}
                    onChange={(e) => handleInputChange('propertyCoordinates', e.target.value)}
                    placeholder="18.4802,-69.9388"
                  />
                  <p className="text-sm text-muted-foreground">
                    Formato: latitud,longitud (ej: 18.4802,-69.9388)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Valor Estimado (DOP)</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    step="0.01"
                    value={formData.estimatedValue || ''}
                    onChange={(e) => handleNumberChange('estimatedValue', e.target.value)}
                    placeholder="5000000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Valor estimado de la propiedad para fines de expropiación
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Owner Information Tab */}
          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle>Información del Propietario</CardTitle>
                <CardDescription>
                  Datos del propietario actual de la propiedad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nombre del Propietario *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerType">Tipo de Propietario</Label>
                    <Select
                      value={formData.ownerType}
                      onValueChange={(value) => handleInputChange('ownerType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {OWNER_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerIdentification">Identificación</Label>
                    <Input
                      id="ownerIdentification"
                      value={formData.ownerIdentification}
                      onChange={(e) => handleInputChange('ownerIdentification', e.target.value)}
                      placeholder="123-4567890-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerContact">Teléfono</Label>
                    <Input
                      id="ownerContact"
                      value={formData.ownerContact}
                      onChange={(e) => handleInputChange('ownerContact', e.target.value)}
                      placeholder="809-555-0123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    placeholder="juan.perez@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerAddress">Dirección del Propietario</Label>
                  <Input
                    id="ownerAddress"
                    value={formData.ownerAddress}
                    onChange={(e) => handleInputChange('ownerAddress', e.target.value)}
                    placeholder="Calle Secundaria #456, Ciudad"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información Legal</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expropriationDecree">Decreto de Expropiación</Label>
                      <Input
                        id="expropriationDecree"
                        value={formData.expropriationDecree}
                        onChange={(e) => handleInputChange('expropriationDecree', e.target.value)}
                        placeholder="Decreto XXX-2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="judicialCaseNumber">Número de Caso Judicial</Label>
                      <Input
                        id="judicialCaseNumber"
                        value={formData.judicialCaseNumber}
                        onChange={(e) => handleInputChange('judicialCaseNumber', e.target.value)}
                        placeholder="2024-1234"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalStatus">Estado Legal</Label>
                    <Input
                      id="legalStatus"
                      value={formData.legalStatus}
                      onChange={(e) => handleInputChange('legalStatus', e.target.value)}
                      placeholder="En proceso judicial"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="space-y-6">
              {/* Existing Documents Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Seleccionar Documentos Existentes</CardTitle>
                  <CardDescription>
                    Elija documentos existentes de la plataforma para asociar a este caso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {existingDocuments.length > 0 ? (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {existingDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={`doc-${doc.id}`}
                            checked={selectedExistingDocuments.includes(doc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExistingDocuments(prev => [...prev, doc.id])
                              } else {
                                setSelectedExistingDocuments(prev => prev.filter(id => id !== doc.id))
                              }
                            }}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <label htmlFor={`doc-${doc.id}`} className="cursor-pointer">
                              <div className="font-medium text-sm">{doc.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc.fileName} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.documentType}
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No hay documentos existentes disponibles
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* New Document Upload */}
              <CaseCreationDocuments
                documents={documents}
                onDocumentsChange={setDocuments}
                disabled={loading}
                maxFiles={10}
              />
            </div>
          </TabsContent>

          {/* Assignment Tab */}
          <TabsContent value="assignment">
            <Card>
              <CardHeader>
                <CardTitle>Asignación del Caso</CardTitle>
                <CardDescription>
                  Asigne el caso al departamento y personal responsable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Departamento *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => handleInputChange('departmentId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {users.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="assignedToId">Asignado a</Label>
                      <Select
                        value={formData.assignedToId}
                        onValueChange={(value) => handleInputChange('assignedToId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar analista" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">Sin asignar</SelectItem>
                          {users
                            .filter(user => ['ANALYST', 'SUPERVISOR', 'DEPARTMENT_ADMIN'].includes(user.role.name))
                            .map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} - {user.role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supervisedById">Supervisor</Label>
                      <Select
                        value={formData.supervisedById}
                        onValueChange={(value) => handleInputChange('supervisedById', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">Sin supervisor</SelectItem>
                          {users
                            .filter(user => ['SUPERVISOR', 'DEPARTMENT_ADMIN'].includes(user.role.name))
                            .map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} - {user.role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading || savingDraft}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={loading || savingDraft}
            >
              <Save className="mr-2 h-4 w-4" />
              {savingDraft ? 'Guardando...' : 'Guardar Borrador'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={loading || savingDraft}
              >
                Anterior
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading || savingDraft}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || savingDraft}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Creando...' : 'Crear Caso'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}