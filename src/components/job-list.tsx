'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import JobCard from '@/components/job-card'
import { useJobs } from '@/hooks/use-jobs'
import { JobFilters, JobSearchResponse, Job } from '@/types/job'

import { Search, Briefcase, Filter, SortAsc, Grid, List, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface JobListProps {
  onCreateJob?: () => void
  onEditJob?: (job: Job) => void
  onDeleteJob?: (jobId: string) => Promise<void>
  showActions?: boolean
  isManagementView?: boolean
}

const sortOptions = [
  { value: 'createdAt', label: 'Date Posted' },
  { value: 'title', label: 'Job Title' },
  { value: 'salaryMax', label: 'Salary' },
  { value: 'company', label: 'Company' }
]

export function JobList({
  onCreateJob,
  onEditJob,
  onDeleteJob,
  showActions = false,
  isManagementView = false
}: JobListProps) {
  const { jobs, loading, error, totalPages, total, fetchJobs, updateFilters, filters } = useJobs()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchTerm, page: 1 })
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, updateFilters])

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    updateFilters({ [key]: value, page: 1 })
    setPage(1)
  }

  const clearFilters = () => {
    updateFilters({
      search: '',
      type: '',
      level: '',
      location: '',
      remote: undefined,
      isAccessibilityFriendly: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setSearchTerm('')
    setPage(1)
  }

  const handleDelete = async (jobId: string) => {
    try {
      await onDeleteJob?.(jobId)
      // Refresh the list
      fetchJobs()
    } catch (error) {
      toast.error('Failed to delete job')
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading jobs: {error}</p>
          <Button onClick={() => fetchJobs()} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if(jobs.length === 0 && !loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      </Card>
    )
  }

  console.log('Jobs:', jobs)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isManagementView ? 'Manage Jobs' : 'Jobs'}
          </h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? 'job' : 'jobs'} found
          </p>
        </div>
        {showActions && (
          <Button onClick={onCreateJob} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Job</span>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {Object.keys(filters).filter(key => filters[key as keyof JobFilters]).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(filters).filter(key => filters[key as keyof JobFilters]).length}
                    </Badge>
                  )}
                </Button>

                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-48">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t pt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Job Type</Label>
                      <Select
                        value={filters.type || ''}
                        onValueChange={(value) => handleFilterChange('type', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All types</SelectItem>
                          <SelectItem value="FULL_TIME">Full Time</SelectItem>
                          <SelectItem value="PART_TIME">Part Time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                          <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Experience Level</Label>
                      <Select
                        value={filters.level || ''}
                        onValueChange={(value) => handleFilterChange('level', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All levels</SelectItem>
                          <SelectItem value="ENTRY">Entry Level</SelectItem>
                          <SelectItem value="MID">Mid Level</SelectItem>
                          <SelectItem value="SENIOR">Senior Level</SelectItem>
                          <SelectItem value="LEAD">Lead</SelectItem>
                          <SelectItem value="EXECUTIVE">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="Enter location..."
                        value={filters.location || ''}
                        onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="remote"
                          checked={filters.remote || false}
                          onCheckedChange={(checked) => 
                            handleFilterChange('remote', checked || undefined)
                          }
                        />
                        <Label htmlFor="remote">Remote Work</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="accessibility-friendly"
                          checked={filters.isAccessibilityFriendly || false}
                          onCheckedChange={(checked) => 
                            handleFilterChange('isAccessibilityFriendly', checked || undefined)
                          }
                        />
                        <Label htmlFor="accessibility-friendly">Accessibility Friendly</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid/List */}
      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !jobs ? (
        <Card className="p-12">
          <div className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            {Object.keys(filters).filter(key => filters[key as keyof JobFilters]).length > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div> 
        </Card>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <AnimatePresence>
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <JobCard
                  job={job}
                  onEdit={onEditJob}
                  onDelete={handleDelete}
                  showActions={showActions}
                  isManagementView={isManagementView}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => {
              const newPage = page - 1
              setPage(newPage)
              updateFilters({ page: newPage })
            }}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setPage(pageNum)
                    updateFilters({ page: pageNum })
                  }}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => {
              const newPage = page + 1
              setPage(newPage)
              updateFilters({ page: newPage })
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}