'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-hot-toast'

import { CreateCaseInput } from '@/lib/validations/case'
import { User, Department } from '@/types/client'

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

export default function CreateCasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
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

  // Fetch departments
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDepartments()
    }
  }, [status])

  // Fetch users when department is selected
  useEffect(() => {
    if (formData.departmentId) {
      fetchDepartmentUsers(formData.departmentId)
    }
  }, [formData.departmentId])

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
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create case')
      }

      const newCase = await response.json()
      toast.success('Caso creado exitosamente')
      router.push(`/cases/${newCase.id}`)
    } catch (error) {
      console.error('Error creating case:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el caso')
    } finally {
      setLoading(false)
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
      <div className="flex items-center gap-4 mb-8">
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
            Complete el formulario para crear un nuevo caso de expropiación
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="property">Propiedad</TabsTrigger>
            <TabsTrigger value="owner">Propietario</TabsTrigger>
            <TabsTrigger value="assignment">Asignación</TabsTrigger>
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
                    <Input
                      id="fileNumber"
                      value={formData.fileNumber}
                      onChange={(e) => handleInputChange('fileNumber', e.target.value)}
                      placeholder="EXP-2024-001"
                      required
                    />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="estimatedValue">Valor Estimado (DOP)</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      step="0.01"
                      value={formData.estimatedValue || ''}
                      onChange={(e) => handleNumberChange('estimatedValue', e.target.value)}
                      placeholder="5000000"
                    />
                  </div>
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
        <div className="flex items-center justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creando...' : 'Crear Caso'}
          </Button>
        </div>
      </form>
    </div>
  )
}