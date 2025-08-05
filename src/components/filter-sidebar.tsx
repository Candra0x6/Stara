"use client"

import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Filter, Accessibility, Headphones, Eye, Hand, Brain, Users, Clock, Building2, Heart, MessageSquare } from "lucide-react"
import { JobFilters } from "@/types/job"
import { AccommodationType, ExperienceLevel, WorkType } from "@prisma/client"

interface FilterSidebarProps {
  filters: JobFilters
  onFiltersChange: (filters: Partial<JobFilters>) => void
  jobCount: number
}

const workTypes: { value: WorkType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value : "REMOTE", label: "Remote" },
  { value: "ON_SITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },

]

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: "JUNIOR", label: "Junior" },
  { value : "ENTRY_LEVEL", label: "Entry Level" },
  { value: "MID_LEVEL", label: "Mid Level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
]

const accommodationOptions: { id: AccommodationType; label: string; icon: any }[] = [
  { id: "VISUAL", label: "Visual accommodations", icon: Eye },
  { id: "HEARING", label: "Hearing accommodations", icon: Headphones },
  { id: "MOBILITY", label: "Mobility accommodations", icon: Accessibility },
  { id: "COGNITIVE", label: "Cognitive accommodations", icon: Brain },
  { id: "MOTOR", label: "Motor accommodations", icon: Hand },
  { id: "SOCIAL", label: "Social accommodations", icon: Users },
  { id: "SENSORY", label: "Sensory accommodations", icon: Building2 },
  { id: "COMMUNICATION", label: "Communication accommodations", icon: MessageSquare },
  { id: "LEARNING", label: "Learning accommodations", icon: Brain },
  { id: "MENTAL_HEALTH", label: "Mental health accommodations", icon: Heart },
]

export default function FilterSidebar({ filters, onFiltersChange, jobCount }: FilterSidebarProps) {
  const updateFilter = (key: keyof JobFilters, value: any) => {
    onFiltersChange({ [key]: value })
  }

  const toggleArrayFilter = (key: keyof JobFilters, value: any) => {
    const currentArray = (filters[key] as any[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    onFiltersChange({ [key]: newArray })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      location: "",
      workType: [],
      experience: [],
      accommodations: [],
      isRemote: false,
      salaryMin: undefined,
      salaryMax: undefined,
      companySize: undefined,
      page: 1,
    })
  }

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.workType?.length || 0) +
    (filters.experience?.length || 0) +
    (filters.accommodations?.length || 0) +
    (filters.isRemote ? 1 : 0) +
    (filters.salaryMin ? 1 : 0) +
    (filters.salaryMax ? 1 : 0)

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="w-80 h-fit sticky top-4 accessibility-text md:flex md:flex-col hidden"
      role="complementary"
      aria-label="Job filters"
    >
      <Card className="rounded-2xl overflow-hidden click-assist py-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground rounded-full"
              >
                Clear All
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{jobCount} jobs found</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Jobs</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Job title, company, keywords..."
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <Input
                id="location"
                placeholder="City, state, or remote"
                value={filters.location || ""}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          {/* Remote Work */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={filters.isRemote || false}
              onCheckedChange={(checked) => updateFilter("isRemote", checked)}
            />
            <Label htmlFor="remote" className="text-sm font-medium">
              Remote work only
            </Label>
          </div>

          {/* Work Type */}
          <div className="space-y-3">
            <Label>Work Type</Label>
            <div className="space-y-2">
              {workTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`worktype-${type.value}`}
                    checked={filters.workType?.includes(type.value) || false}
                    onCheckedChange={() => toggleArrayFilter("workType", type.value)}
                  />
                  <Label htmlFor={`worktype-${type.value}`} className="text-sm">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <Label>Experience Level</Label>
            <div className="space-y-2">
              {experienceLevels.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`experience-${level.value}`}
                    checked={filters.experience?.includes(level.value) || false}
                    onCheckedChange={() => toggleArrayFilter("experience", level.value)}
                  />
                  <Label htmlFor={`experience-${level.value}`} className="text-sm">
                    {level.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-3">
            <Label>Salary Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="salaryMin" className="text-xs text-muted-foreground">
                  Min ($)
                </Label>
                <Input
                  id="salaryMin"
                  type="number"
                  placeholder="50,000"
                  value={filters.salaryMin || ""}
                  onChange={(e) => updateFilter("salaryMin", e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="salaryMax" className="text-xs text-muted-foreground">
                  Max ($)
                </Label>
                <Input
                  id="salaryMax"
                  type="number"
                  placeholder="150,000"
                  value={filters.salaryMax || ""}
                  onChange={(e) => updateFilter("salaryMax", e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Accommodations */}
          <div className="space-y-3">
            <Label>Required Accommodations</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {accommodationOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`accommodation-${option.id}`}
                      checked={filters.accommodations?.includes(option.id) || false}
                      onCheckedChange={() => toggleArrayFilter("accommodations", option.id)}
                    />
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`accommodation-${option.id}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
