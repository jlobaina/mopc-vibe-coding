'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  FileText,
  History,
  Users,
  Calendar,
  MapPin,
  User,
  Building,
  Scale,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
  Archive,
  UserPlus,
  Settings
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'

import { Case } from '@/types/client'

const CASE_STATUSES = {
  'PENDIENTE': { label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  'EN_PROGRESO': { label: 'En Progreso', icon: AlertCircle, color: 'bg-blue-100 text-blue-800' },
  'COMPLETADO': { label: 'Completado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  'SUSPENDED': { label: 'Suspendido', icon: PauseCircle, color: 'bg-orange-100 text-orange-800' },
  'CANCELLED': { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' },
  'ARCHIVED': { label: 'Archivado', icon: Archive, color: 'bg-gray-100 text-gray-800' }
}

const PRIORITIES = {
  'LOW': { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  'MEDIUM': { label: 'Media', color: 'bg-blue-100 text-blue-800' },
  'HIGH': { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  'URGENT': { label: 'Urgente', color: 'bg-red-100 text-red-800' }
}

const CASE_STAGES = {
  'INITIAL_REVIEW': 'Revisión Inicial',
  'LEGAL_REVIEW': 'Revisión Legal',
  'TECHNICAL_EVALUATION': 'Evaluación Técnica',
  'APPRAISAL': 'Tasación',
  'NEGOTIATION': 'Negociación',
  'DOCUMENTATION': 'Documentación',
  'PUBLIC_CONSULTATION': 'Consulta Pública',
  'APPROVAL': 'Aprobación',
  'PAYMENT': 'Pago',
  'TRANSFER': 'Transferencia',
  'FINAL_CLOSURE': 'Cierre Final',
  'QUALITY_CONTROL': 'Control de Calidad',
  'AUDIT': 'Auditoría',
  'REPORTING': 'Reporte',
  'ARCHIVE_PREPARATION': 'Preparación de Archivo',
  'COMPLETED': 'Completado',
  'SUSPENDED': 'Suspendido',
  'CANCELLED': 'Cancelado'
}

export default function CaseDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [case_, setCase] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch case details
  useEffect(() => {
    if (status === 'authenticated' && caseId) {
      fetchCase()
    }
  }, [status, caseId])

  const fetchCase = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cases/${caseId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Caso no encontrado')
          router.push('/cases')
          return
        }
        throw new Error('Failed to fetch case')
      }

      const data = await response.json()
      setCase(data)
    } catch (error) {
      console.error('Error fetching case:', error)
      toast.error('Error al cargar los detalles del caso')
    } finally {
      setLoading(false)
    }
  }

  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (amount: number, currency = 'DOP') => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get status config
  const getStatusConfig = (status: string) => {
    return CASE_STATUSES[status as keyof typeof CASE_STATUSES] || {
      label: status,
      icon: Clock,
      color: 'bg-gray-100 text-gray-800'
    }
  }

  // Get priority config
  const getPriorityConfig = (priority: string) => {
    return PRIORITIES[priority as keyof typeof PRIORITIES] || {
      label: priority,
      color: 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (!case_) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Caso no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            El caso que buscas no existe o no tienes permisos para verlo.
          </p>
          <Button onClick={() => router.push('/cases')}>
            Volver a casos
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(case_.status)
  const priorityConfig = getPriorityConfig(case_.priority)
  const StatusIcon = statusConfig.icon

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
            <h1 className="text-3xl font-bold tracking-tight">{case_.fileNumber}</h1>
            <p className="text-muted-foreground">{case_.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/cases/${case_.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Status and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <div className="text-2xl font-bold">{case_.progressPercentage}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={case_.progressPercentage} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2">
              Etapa actual: {CASE_STAGES[case_.currentStage as keyof typeof CASE_STAGES]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamento</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{case_.department?.name}</div>
            <p className="text-xs text-muted-foreground">
              {case_.department?.code}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Case Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="property">Propiedad</TabsTrigger>
          <TabsTrigger value="owner">Propietario</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Detalles básicos del caso de expropiación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {case_.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">{case_.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Fechas Importantes</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Inicio:</span>
                        <span>{formatDate(case_.startDate)}</span>
                      </div>
                      {case_.expectedEndDate && (
                        <div className="flex justify-between text-sm">
                          <span>Finalización estimada:</span>
                          <span>{formatDate(case_.expectedEndDate)}</span>
                        </div>
                      )}
                      {case_.actualEndDate && (
                        <div className="flex justify-between text-sm">
                          <span>Finalización real:</span>
                          <span>{formatDate(case_.actualEndDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Asignación</h4>
                    <div className="space-y-2">
                      {case_.assignedTo && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {case_.assignedTo.firstName[0]}{case_.assignedTo.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <div className="font-medium">
                              {case_.assignedTo.firstName} {case_.assignedTo.lastName}
                            </div>
                            <div className="text-muted-foreground">Asignado</div>
                          </div>
                        </div>
                      )}
                      {case_.supervisedBy && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {case_.supervisedBy.firstName[0]}{case_.supervisedBy.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <div className="font-medium">
                              {case_.supervisedBy.firstName} {case_.supervisedBy.lastName}
                            </div>
                            <div className="text-muted-foreground">Supervisor</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{case_._count?.documents || 0}</div>
                  <p className="text-xs text-muted-foreground">Documentos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <History className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{case_._count?.histories || 0}</div>
                  <p className="text-xs text-muted-foreground">Cambios</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{case_._count?.meetings || 0}</div>
                  <p className="text-xs text-muted-foreground">Reuniones</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{case_._count?.activities || 0}</div>
                  <p className="text-xs text-muted-foreground">Actividades</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Property Tab */}
        <TabsContent value="property">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Propiedad</CardTitle>
              <CardDescription>
                Detalles del inmueble sujeto a expropiación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Dirección</h4>
                      <p className="text-sm text-muted-foreground">{case_.propertyAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {case_.propertyCity}, {case_.propertyProvince}
                      </p>
                    </div>
                  </div>

                  {case_.propertyType && (
                    <div>
                      <h4 className="font-medium mb-2">Tipo de Propiedad</h4>
                      <Badge variant="outline">{case_.propertyType}</Badge>
                    </div>
                  )}

                  {case_.propertyCoordinates && (
                    <div>
                      <h4 className="font-medium mb-2">Coordenadas GPS</h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {case_.propertyCoordinates}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {case_.propertyArea && (
                    <div>
                      <h4 className="font-medium mb-2">Área</h4>
                      <p className="text-sm text-muted-foreground">
                        {case_.propertyArea.toLocaleString('es-DO')} m²
                      </p>
                    </div>
                  )}

                  {case_.estimatedValue && (
                    <div>
                      <h4 className="font-medium mb-2">Valor Estimado</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(case_.estimatedValue, case_.currency)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {case_.propertyDescription && (
                <div>
                  <h4 className="font-medium mb-2">Descripción de la Propiedad</h4>
                  <p className="text-sm text-muted-foreground">{case_.propertyDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner Tab */}
        <TabsContent value="owner">
          <Card>
            <CardHeader>
              <CardTitle>Información del Propietario</CardTitle>
              <CardDescription>
                Datos del propietario actual de la propiedad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Nombre</h4>
                      <p className="text-sm text-muted-foreground">{case_.ownerName}</p>
                      {case_.ownerType && (
                        <Badge variant="outline" className="mt-1">
                          {case_.ownerType}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {case_.ownerIdentification && (
                    <div>
                      <h4 className="font-medium mb-2">Identificación</h4>
                      <p className="text-sm text-muted-foreground">{case_.ownerIdentification}</p>
                    </div>
                  )}

                  {case_.ownerAddress && (
                    <div>
                      <h4 className="font-medium mb-2">Dirección</h4>
                      <p className="text-sm text-muted-foreground">{case_.ownerAddress}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {case_.ownerContact && (
                    <div>
                      <h4 className="font-medium mb-2">Contacto</h4>
                      <p className="text-sm text-muted-foreground">{case_.ownerContact}</p>
                    </div>
                  )}

                  {case_.ownerEmail && (
                    <div>
                      <h4 className="font-medium mb-2">Email</h4>
                      <p className="text-sm text-muted-foreground">{case_.ownerEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Información Legal</CardTitle>
              <CardDescription>
                Detalles legales y judiciales del caso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {case_.expropriationDecree && (
                  <div className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Decreto de Expropiación</h4>
                      <p className="text-sm text-muted-foreground">{case_.expropriationDecree}</p>
                    </div>
                  </div>
                )}

                {case_.judicialCaseNumber && (
                  <div>
                    <h4 className="font-medium mb-2">Caso Judicial</h4>
                    <p className="text-sm text-muted-foreground">{case_.judicialCaseNumber}</p>
                  </div>
                )}

                {case_.legalStatus && (
                  <div>
                    <h4 className="font-medium mb-2">Estado Legal</h4>
                    <Badge variant="outline">{case_.legalStatus}</Badge>
                  </div>
                )}
              </div>

              {/* Financial Information */}
              {(case_.actualValue || case_.appraisalValue || case_.compensationAmount) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-4">Información Financiera</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {case_.actualValue && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-1">Valor Real</h5>
                          <p className="text-lg font-semibold">
                            {formatCurrency(case_.actualValue, case_.currency)}
                          </p>
                        </div>
                      )}
                      {case_.appraisalValue && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-1">Valor de Tasación</h5>
                          <p className="text-lg font-semibold">
                            {formatCurrency(case_.appraisalValue, case_.currency)}
                          </p>
                        </div>
                      )}
                      {case_.compensationAmount && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-1">Monto de Compensación</h5>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(case_.compensationAmount, case_.currency)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Historial de cambios y actividades del caso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {case_.activities && case_.activities.length > 0 ? (
                <div className="space-y-4">
                  {case_.activities.slice(0, 20).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {activity.user?.firstName[0]}{activity.user?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {activity.user?.firstName} {activity.user?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description || activity.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay actividades registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}