'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CreateJobRequest, UpdateJobRequest } from '@/lib/validations/job'

export type Company = {
  id: string
  name: string
  description: string | null
  website: string | null
  industry: string | null
  size: string | null
  logo: string | null
  location: string | null
  accessibilityRating: number | null
  isAccessibilityFocused: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    jobs: number
  }
}

export type CreateCompanyData = {
  name: string
  description?: string
  website?: string
  industry?: string
  size?: string
  location?: string
  accessibilityRating?: number
  isAccessibilityFocused?: boolean
}

export type UpdateCompanyData = Partial<CreateCompanyData>

export type CompanyFilters = {
  industry?: string
  size?: string
  location?: string
  isAccessibilityFocused?: boolean
  accessibilityRating?: number
  search?: string
}

export type CompanySort = 'name' | 'createdAt' | 'jobCount' | 'accessibilityRating'

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCompanies = useCallback(async (
    filters: CompanyFilters = {},
    sort: CompanySort = 'name',
    page: number = 1,
    limit: number = 10
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams()
      
      // Add filters to search params
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.industry) searchParams.append('industry', filters.industry)
      if (filters.size) searchParams.append('size', filters.size)
      if (filters.location) searchParams.append('location', filters.location)
      if (filters.isAccessibilityFocused !== undefined) {
        searchParams.append('isAccessibilityFocused', filters.isAccessibilityFocused.toString())
      }
      if (filters.accessibilityRating !== undefined) {
        searchParams.append('accessibilityRating', filters.accessibilityRating.toString())
      }
      
      // Add pagination and sorting
      searchParams.append('page', page.toString())
      searchParams.append('limit', limit.toString())
      searchParams.append('sort', sort)
      
      const response = await fetch(`/api/companies?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.data.companies)
        setTotalPages(data.data.pagination.totalPages)
        setTotalCompanies(data.data.pagination.totalCompanies)
        setCurrentPage(page)
      } else {
        throw new Error(data.error || 'Failed to fetch companies')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies')
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  return {
    companies,
    loading,
    error,
    totalPages,
    totalCompanies,
    currentPage,
    fetchCompanies,
    refetch: () => fetchCompanies()
  }
}

export function useCompany(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = useCallback(async () => {
    if (!companyId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/companies/${companyId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch company: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCompany(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company')
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  return {
    company,
    loading,
    error,
    refetch: fetchCompany
  }
}

export function useCompanyActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCompany = async (companyData: CreateCompanyData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create company: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCompany = async (companyId: string, companyData: UpdateCompanyData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update company: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCompany = async (companyId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete company: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (companyId: string, file: File) => {
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('companyId', companyId)
      
      const response = await fetch('/api/upload/company-logo', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Failed to upload logo: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    uploadLogo
  }
}

export function useJobManagement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createJob = async (jobData: CreateJobRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create job: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateJob = async (jobId: string, jobData: Partial<UpdateJobRequest>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update job: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createJob,
    updateJob,
    deleteJob
  }
}
