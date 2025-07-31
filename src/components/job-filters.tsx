'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { JobFilters, WorkType, Experience, AccommodationType, CompanySize } from '@/types/job'
import { Search, Filter, X } from 'lucide-react'

interface JobFiltersComponentProps {
  filters: JobFilters
  onFiltersChange: (filters: Partial<JobFilters>) => void
  onClearFilters: () => void
}

const workTypeOptions: { value: WorkType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' }
]

const experienceOptions: { value: Experience; label: string }[] = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' }
]

const accommodationOptions: { value: AccommodationType; label: string }[] = [
  { value: 'FLEXIBLE_HOURS', label: 'Flexible Hours' },
  { value: 'REMOTE_WORK', label: 'Remote Work' },
  { value: 'WHEELCHAIR_ACCESS', label: 'Wheelchair Access' },
  { value: 'SCREEN_READER', label: 'Screen Reader Support' },
  { value: 'SIGN_LANGUAGE', label: 'Sign Language' },
  { value: 'QUIET_WORKSPACE', label: 'Quiet Workspace' },
  { value: 'ERGONOMIC_EQUIPMENT', label: 'Ergonomic Equipment' },
  { value: 'MODIFIED_DUTIES', label: 'Modified Duties' },
  { value: 'EXTENDED_BREAKS', label: 'Extended Breaks' },
  { value: 'TRANSPORTATION_ASSISTANCE', label: 'Transportation Assistance' }
]

const companySizeOptions: { value: CompanySize; label: string }[] = [
  { value: 'STARTUP', label: 'Startup (1-10)' },
  { value: 'SMALL', label: 'Small (11-50)' },
  { value: 'MEDIUM', label: 'Medium (51-200)' },
  { value: 'LARGE', label: 'Large (201-1000)' },
  { value: 'ENTERPRISE', label: 'Enterprise (1000+)' }
]

export function JobFiltersComponent({ filters, onFiltersChange, onClearFilters }: JobFiltersComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleWorkTypeChange = (workType: WorkType, checked: boolean) => {
    const current = filters.workType || []
    const updated = checked 
      ? [...current, workType]
      : current.filter(t => t !== workType)
    onFiltersChange({ workType: updated })
  }

  const handleExperienceChange = (experience: Experience, checked: boolean) => {
    const current = filters.experience || []
    const updated = checked 
      ? [...current, experience]
      : current.filter(e => e !== experience)
    onFiltersChange({ experience: updated })
  }

  const handleAccommodationChange = (accommodation: AccommodationType, checked: boolean) => {
    const current = filters.accommodations || []
    const updated = checked 
      ? [...current, accommodation]
      : current.filter(a => a !== accommodation)
    onFiltersChange({ accommodations: updated })
  }

  const handleCompanySizeChange = (size: CompanySize, checked: boolean) => {
    const current = filters.companySize || []
    const updated = checked 
      ? [...current, size]
      : current.filter(s => s !== size)
    onFiltersChange({ companySize: updated })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.workType?.length) count++
    if (filters.experience?.length) count++
    if (filters.location) count++
    if (filters.isRemote) count++
    if (filters.accommodations?.length) count++
    if (filters.salaryMin || filters.salaryMax) count++
    if (filters.companySize?.length) count++
    return count
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Search & Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Jobs</Label>
          <Input
            id="search"
            placeholder="Search by title, company, or keywords..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Location and Remote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, state, or country"
              value={filters.location || ''}
              onChange={(e) => onFiltersChange({ location: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2 mt-8">
            <Checkbox
              id="remote"
              checked={filters.isRemote || false}
              onCheckedChange={(checked) => onFiltersChange({ isRemote: checked as boolean })}
            />
            <Label htmlFor="remote">Remote positions only</Label>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Salary Range */}
            <div className="space-y-2">
              <Label>Salary Range (USD)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    placeholder="Min salary"
                    value={filters.salaryMin || ''}
                    onChange={(e) => onFiltersChange({ salaryMin: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max salary"
                    value={filters.salaryMax || ''}
                    onChange={(e) => onFiltersChange({ salaryMax: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Work Type */}
            <div className="space-y-2">
              <Label>Work Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {workTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`worktype-${option.value}`}
                      checked={filters.workType?.includes(option.value) || false}
                      onCheckedChange={(checked) => handleWorkTypeChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={`worktype-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {experienceOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`experience-${option.value}`}
                      checked={filters.experience?.includes(option.value) || false}
                      onCheckedChange={(checked) => handleExperienceChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={`experience-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label>Company Size</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {companySizeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`company-${option.value}`}
                      checked={filters.companySize?.includes(option.value) || false}
                      onCheckedChange={(checked) => handleCompanySizeChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={`company-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div className="space-y-2">
              <Label>Required Accommodations</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {accommodationOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`accommodation-${option.value}`}
                      checked={filters.accommodations?.includes(option.value) || false}
                      onCheckedChange={(checked) => handleAccommodationChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={`accommodation-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select 
                  value={filters.sortBy || 'createdAt'} 
                  onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Posted</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="applicationCount">Applications</SelectItem>
                    <SelectItem value="viewCount">Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Select 
                  value={filters.sortOrder || 'desc'} 
                  onValueChange={(value) => onFiltersChange({ sortOrder: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
