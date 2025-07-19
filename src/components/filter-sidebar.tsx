"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Filter, Accessibility, Headphones, Eye, Hand, Brain, Users } from "lucide-react"

interface FilterSidebarProps {
  filters: {
    search: string
    location: string
    industry: string[]
    accommodations: string[]
    matchScore: number[]
    remote: boolean
    jobType: string[]
  }
  onFiltersChange: (filters: any) => void
  jobCount: number
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Design",
  "Sales",
  "Customer Service",
  "Operations",
  "Legal",
]

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"]

const accommodationOptions = [
  { id: "visual", label: "Visual accommodations", icon: Eye },
  { id: "hearing", label: "Hearing accommodations", icon: Headphones },
  { id: "mobility", label: "Mobility accommodations", icon: Accessibility },
  { id: "cognitive", label: "Cognitive accommodations", icon: Brain },
  { id: "motor", label: "Motor accommodations", icon: Hand },
  { id: "social", label: "Social accommodations", icon: Users },
]

export default function FilterSidebar({ filters, onFiltersChange, jobCount }: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = filters[key as keyof typeof filters] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      location: "",
      industry: [],
      accommodations: [],
      matchScore: [0],
      remote: false,
      jobType: [],
    })
  }

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.location ? 1 : 0) +
    filters.industry.length +
    filters.accommodations.length +
    (filters.matchScore[0] > 0 ? 1 : 0) +
    (filters.remote ? 1 : 0) +
    filters.jobType.length

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="w-80 h-fit sticky top-4"
    >
      <Card className="rounded-2xl overflow-hidden">
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
                className="text-white rounded-full"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Job title, company, keywords..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="City, state, or remote"
                value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          {/* Remote Work */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={filters.remote}
              onCheckedChange={(checked) => updateFilter("remote", checked)}
            />
            <Label htmlFor="remote" className="text-sm font-medium">
              Remote work available
            </Label>
          </div>

          {/* Match Score */}
          <div className="space-y-3">
            <Label>Minimum Match Score: {filters.matchScore[0]}%</Label>
            <Slider
              value={filters.matchScore}
              onValueChange={(value) => updateFilter("matchScore", value)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Job Type */}
          <div className="space-y-3">
            <Label>Job Type</Label>
            <div className="space-y-2">
              {jobTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`jobtype-${type}`}
                    checked={filters.jobType.includes(type)}
                    onCheckedChange={() => toggleArrayFilter("jobType", type)}
                  />
                  <Label htmlFor={`jobtype-${type}`} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-3">
            <Label>Industry</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {industries.map((industry) => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={filters.industry.includes(industry)}
                    onCheckedChange={() => toggleArrayFilter("industry", industry)}
                  />
                  <Label htmlFor={`industry-${industry}`} className="text-sm">
                    {industry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodations */}
          <div className="space-y-3">
            <Label>Required Accommodations</Label>
            <div className="space-y-2">
              {accommodationOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`accommodation-${option.id}`}
                      checked={filters.accommodations.includes(option.id)}
                      onCheckedChange={() => toggleArrayFilter("accommodations", option.id)}
                    />
                    <Label htmlFor={`accommodation-${option.id}`} className="text-sm flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </Label>
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
