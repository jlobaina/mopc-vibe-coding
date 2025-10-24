'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-hot-toast'
import { CaseForm } from '@/components/cases/case-form'
import { Case } from '@/types/client'

export default function EditCasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [initialLoading, setInitialLoading] = useState(true)
  const [caseData, setCaseData] = useState<Case | null>(null)

  // Fetch case data
  useEffect(() => {
    if (status === 'authenticated' && caseId) {
      fetchCase()
    }
  }, [status, caseId])

  const fetchCase = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`/api/cases/${caseId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Caso no encontrado')
          router.push('/cases')
          return
        }
        throw new Error('Failed to fetch case')
      }

      const data: Case = await response.json()
      setCaseData(data)
    } catch (error) {
      console.error('Error fetching case:', error)
      toast.error('Error al cargar los detalles del caso')
      router.push('/cases')
    } finally {
      setInitialLoading(false)
    }
  }

  if (status === 'loading' || initialLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
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

  if (!caseData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Caso no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            El caso que buscas no existe o no tienes permisos para editarlo.
          </p>
          <button
            onClick={() => router.push('/cases')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Volver a casos
          </button>
        </div>
      </div>
    )
  }

  return <CaseForm mode="edit" caseId={caseId} initialData={caseData} />
}