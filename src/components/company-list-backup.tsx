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
import { CompanyCard } from '@/components/company-card'
import { useCompanies, Company, CompanyFilters, CompanySort } from '@/hooks/use-companies'
import { Search, Building2, Filter, SortAsc, Grid, List, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface CompanyListProps {
  onCreateCompany?: () => void
  onEditCompany?: (company: Company) => void
  onDeleteCompany?: (companyId: string) => Promise<void>
  showActions?: boolean
  isManagementView?: boolean
}

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Government',
  'Non-profit',
  'Other'
]

const sizeOptions = [
  { value: 'STARTUP', label: 'Startup (1-10)' },
  { value: 'SMALL', label: 'Small (11-50)' },
  { value: 'MEDIUM', label: 'Medium (51-200)' },
  { value: 'LARGE', label: 'Large (201-1000)' },
  { value: 'ENTERPRISE', label: 'Enterprise (1000+)' }
]

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Date Added' },
  { value: 'jobCount', label: 'Job Count' },
  { value: 'accessibilityRating', label: 'Accessibility Rating' }
]

export function CompanyList({
  onCreateCompany,
  onEditCompany,
  onDeleteCompany,
  showActions = false,
  isManagementView = false
}: CompanyListProps) {
  const { companies, loading, error, totalPages, totalCompanies, currentPage, fetchCompanies } = useCompanies()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<CompanyFilters>({})
  const [sort, setSort] = useState<CompanySort>('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }))
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch companies when filters change
  useEffect(() => {
    fetchCompanies(filters, sort, page, 12)
  }, [filters, sort, page, fetchCompanies])

  const handleFilterChange = (key: keyof CompanyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setSort('name')
    setPage(1)
  }

  const handleDelete = async (companyId: string) => {
    try {
      await onDeleteCompany?.(companyId)
      // Refresh the list
      fetchCompanies(filters, sort, page, 12)
    } catch (error) {
      toast.error('Failed to delete company')
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading companies: {error}</p>
          <Button onClick={() => fetchCompanies()} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isManagementView ? 'Manage Companies' : 'Companies'}
          </h1>
          <p className="text-muted-foreground">
            {totalCompanies} {totalCompanies === 1 ? 'company' : 'companies'} found
          </p>
        </div>
        {showActions && (
          <Button onClick={onCreateCompany} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
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
                placeholder="Search companies..."
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
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>

                <Select value={sort} onValueChange={(value) => setSort(value as CompanySort)}>
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
                      <Label>Industry</Label>
                      <Select
                        value={filters.industry || ''}
                        onValueChange={(value) => handleFilterChange('industry', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All industries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All industries</SelectItem>
                          {industryOptions.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Company Size</Label>
                      <Select
                        value={filters.size || ''}
                        onValueChange={(value) => handleFilterChange('size', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All sizes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All sizes</SelectItem>
                          {sizeOptions.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
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
                          id="accessibility-focused"
                          checked={filters.isAccessibilityFocused || false}
                          onCheckedChange={(checked) => 
                            handleFilterChange('isAccessibilityFocused', checked || undefined)
                          }
                        />
                        <Label htmlFor="accessibility-focused">Accessibility Focused</Label>
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

      {/* Companies Grid/List */}
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
      ) : companies.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            {Object.keys(filters).length > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <AnimatePresence>
            {companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CompanyCard
                  company={company}
                  onEdit={onEditCompany}
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
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
    size: "LARGE" as const,
    industry: "Technology",
    location: "San Francisco, CA",
    culture: "Innovative and inclusive workplace",
    values: ["Accessibility First", "Innovation", "Diversity"],
    jobCount: 12
  },
  {
    id: "2", 
    name: "AccessFirst Solutions",
    description: "Digital accessibility consulting and software development",
    website: "https://accessfirst.com",
    logo: "",
    size: "MEDIUM" as const,
    industry: "Consulting",
    location: "Remote",
    culture: "Remote-first, accessibility-focused culture",
    values: ["Inclusion", "Excellence", "Impact"],
    jobCount: 8
  }
]

const companySizeLabels = {
  STARTUP: 'Startup (1-10)',
  SMALL: 'Small (11-50)', 
  MEDIUM: 'Medium (51-200)',
  LARGE: 'Large (201-1000)',
  ENTERPRISE: 'Enterprise (1000+)'
}

export function CompanyList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Companies</h1>
        <p className="text-muted-foreground">
          Discover inclusive employers committed to accessibility and diversity
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies by name, industry, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Building className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No companies found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        <Link 
                          href={`/companies/${company.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {company.name}
                        </Link>
                      </CardTitle>
                      {company.website && (
                        <Link 
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{companySizeLabels[company.size]}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {company.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.values.map((value) => (
                        <Badge key={value} variant="outline" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-primary">
                        {company.jobCount} open positions
                      </span>
                      <span className="text-muted-foreground">
                        {company.culture}
                      </span>
                    </div>
                  </div>

                  {company.logo && (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-16 h-16 rounded object-cover ml-4"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex gap-3">
                  <Button asChild>
                    <Link href={`/companies/${company.id}`}>
                      View Company
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/jobs?company=${company.id}`}>
                      View Jobs ({company.jobCount})
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
