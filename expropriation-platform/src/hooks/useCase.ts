import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Case } from '@/types/client'

export const useCase = (caseId: string) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

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
      setCaseData(data)
    } catch (error) {
      console.error('Error fetching case:', error)
      toast.error('Error al cargar los detalles del caso')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && caseId) {
      fetchCase()
    }
  }, [status, caseId])

  const refreshCase = () => {
    fetchCase()
  }

  return {
    case: caseData,
    loading,
    refreshCase,
    status,
    session
  }
}