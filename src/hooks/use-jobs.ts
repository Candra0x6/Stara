'use client'

import { useState, useEffect, useCallback } from 'react'
import { JobFilters, JobSearchResponse, Job } from '@/types/job'
import { Company } from '@prisma/client'

export type JobWithCompany = Job & {
  company: Company & {
    description?: string | null
  }
}
export function useJobs(initialFilters: JobFilters = {}) {
 const [jobs, setJobs] = useState<JobWithCompany[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [totalPages, setTotalPages] = useState(0)
const [total, setTotal] = useState(0)
const [filters, setFilters] = useState<JobFilters>(initialFilters)

// Pure fetch function - doesn't modify filters
const fetchFilteredJobs = useCallback(async (filtersToUse: JobFilters) => {
  setLoading(true)
  setError(null)
  
  try {
    const searchParams = new URLSearchParams()
    
    Object.entries(filtersToUse).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    const response = await fetch(`/api/jobs?${searchParams}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`)
    }
    
    const data: JobSearchResponse = await response.json()
    
    setJobs(data.data.jobs)
    setTotal(data.total)
    setTotalPages(data.totalPages)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    setJobs([])
  } finally {
    setLoading(false)
  }
}, [])

  const fetchJobs = useCallback(async (newFilters?: Partial<JobFilters>) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      const currentFilters = newFilters ? { ...filters, ...newFilters } : filters

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v))
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/jobs?${searchParams}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`)
      }

      const data: JobSearchResponse = await response.json()
      setJobs(data.jobs)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      if (newFilters) {
        setFilters({ ...filters, ...newFilters })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

// Update filters - the useEffect will trigger fetch
const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
  setFilters(prevFilters => ({ ...prevFilters, ...newFilters, page: 1 }))
}, [])

const goToPage = useCallback((page: number) => {
  setFilters(prevFilters => ({ ...prevFilters, page }))
}, [])

const refreshJobs = useCallback(() => {
  fetchFilteredJobs(filters)
}, [fetchFilteredJobs, filters])

// Fetch jobs when filters change
useEffect(() => {
  fetchFilteredJobs(filters)
}, [filters, fetchFilteredJobs])




  return {
    jobs,
    loading,
    error,
    total,
    totalPages,
    filters,
    updateFilters,
    goToPage,
    refreshJobs,
    fetchJobs
  }
}

export function useJob(jobId: string) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJob = async () => {
    if (!jobId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job: ${response.statusText}`)
      }
      
      const data = await response.json()
      setJob(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job')
      setJob(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJob()
  }, [jobId])

  return {
    job,
    loading,
    error,
    refetch: fetchJob
  }
}

export function useJobActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])

  // Fetch saved jobs on mount
  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch('/api/jobs/saved')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch saved jobs: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        const jobIds = data.data.savedJobs.map((savedJob: any) => savedJob.jobId)
        setSavedJobs(jobIds)
      }
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err)
    }
  }

  const applyToJob = async (jobId: string, applicationData: {
    resumeUrl?: string
    coverLetter?: string
    expectedSalary?: number
    availableStartDate?: Date
    accommodationNeeds?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          ...applicationData
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to apply: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply to job')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const saveJob = async (jobId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to save job: ${response.statusText}`)
      }
      
      // Update local state
      setSavedJobs(prev => [...prev, jobId])
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const unsaveJob = async (jobId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/jobs/saved?jobId=${jobId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to unsave job: ${response.statusText}`)
      }
      
      // Update local state
      setSavedJobs(prev => prev.filter(id => id !== jobId))
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsave job')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    applyToJob,
    saveJob,
    unsaveJob,
    savedJobs,
    fetchSavedJobs
  }
}
