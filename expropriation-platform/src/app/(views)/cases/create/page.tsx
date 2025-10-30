'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { CaseForm } from '@/components/cases/case-form'

export default function CreateCasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 animate-pulse bg-muted rounded" />
          <div>
            <div className="h-8 w-64 mb-2 animate-pulse bg-muted rounded" />
            <div className="h-4 w-96 animate-pulse bg-muted rounded" />
          </div>
        </div>
        <div className="grid gap-6">
          <div className="h-96 w-full animate-pulse bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return <CaseForm mode="create" />
}