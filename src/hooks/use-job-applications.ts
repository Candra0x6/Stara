'use client'

import { JobComplete } from '@/types/job'
import { Job, JobApplication } from '@prisma/client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'



export interface ApplicationFilters {
  status?: string
  page?: number
  limit?: number
}
interface JobApplicationWithJob extends JobApplication {
  job: JobComplete
}

export interface ApplicationStatus {
  totalApplications: number
  statusSummary: Record<string, number>
  recentApplications: JobApplicationWithJob[]
}

export function useJobApplications(filters: ApplicationFilters = {}) {
  const [applications, setApplications] = useState<JobApplicationWithJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchApplications = useCallback(async (newFilters?: ApplicationFilters) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      const currentFilters = { ...filters, ...newFilters }

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/jobs/applications?${searchParams}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setApplications(data.data.applications)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch applications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  return {
    applications,
    loading,
    error,
    pagination,
    fetchApplications,
    refetch: () => fetchApplications()
  }
}

export function useApplicationStatus() {
  const [status, setStatus] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/jobs/applications/status')

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setStatus(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    refetch: fetchStatus
  }
}

export function useApplicationActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitApplication = async (applicationData: {
    jobId: string
    coverLetter?: string
    resumeUrl?: string
    customAnswers?: Array<{
      question: string
      answer: string
    }>
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to submit application: ${response.statusText}`)
      }

      const result = await response.json()
      toast.success('Application submitted successfully!')
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const withdrawApplication = async (applicationId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/applications/${applicationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to withdraw application: ${response.statusText}`)
      }

      toast.success('Application withdrawn successfully')
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw application'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const shareApplication = async (shareData: {
    applicationId: string
    shareType: 'email' | 'link' | 'linkedin' | 'twitter'
    recipientEmail?: string
    message?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/jobs/applications/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to share application: ${response.statusText}`)
      }

      const result = await response.json()
      toast.success('Application shared successfully!')
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share application'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reportIssue = async (reportData: {
    type: 'job' | 'application' | 'company'
    targetId: string
    reportType: 'accessibility' | 'inaccurate' | 'inappropriate' | 'spam' | 'discrimination' | 'technical_issue' | 'other'
    description: string
    evidence?: string[]
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to submit report: ${response.statusText}`)
      }

      const result = await response.json()
      toast.success('Report submitted successfully!')
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit report'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    submitApplication,
    withdrawApplication,
    shareApplication,
    reportIssue
  }
}
