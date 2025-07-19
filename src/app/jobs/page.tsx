"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import JobCard from "@/components/job-card"
import FilterSidebar from "@/components/filter-sidebar"
import ProtectedRoute from "@/components/protected-route"
import { Briefcase, TrendingUp, Users, Star, SortAsc, Grid3X3, List, ChevronDown } from "lucide-react"

// Mock job data
const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    type: "Full-time",
    matchScore: 95,
    matchReason:
      "Perfect match! Your React and TypeScript skills align perfectly with this role. The company offers excellent visual and cognitive accommodations.",
    accommodations: ["visual", "cognitive", "hearing"],
    description:
      "We're looking for a senior frontend developer to join our accessibility-focused team. You'll work on building inclusive web applications that serve millions of users.",
    requirements: [
      "5+ years of React experience",
      "Strong TypeScript skills",
      "Experience with accessibility standards",
      "Knowledge of modern CSS frameworks",
    ],
    benefits: [
      "Comprehensive health insurance",
      "Flexible work arrangements",
      "Professional development budget",
      "Accessibility equipment provided",
    ],
    remote: true,
    posted: "2 days ago",
  },
  {
    id: "2",
    title: "UX Designer - Accessibility Focus",
    company: "InclusiveDesign Co.",
    location: "Remote",
    salary: "$90,000 - $110,000",
    type: "Full-time",
    matchScore: 88,
    matchReason:
      "Great fit! Your design background and passion for accessibility make you an ideal candidate. The role offers mobility and social accommodations.",
    accommodations: ["mobility", "social", "cognitive"],
    description:
      "Join our mission to create accessible digital experiences. You'll lead design initiatives that prioritize inclusivity and usability for all users.",
    requirements: [
      "3+ years of UX design experience",
      "Knowledge of WCAG guidelines",
      "Proficiency in Figma and design systems",
      "Experience with user research",
    ],
    benefits: [
      "Remote-first culture",
      "Ergonomic home office setup",
      "Mental health support",
      "Inclusive team environment",
    ],
    remote: true,
    posted: "1 day ago",
  },
  {
    id: "3",
    title: "Data Analyst",
    company: "Analytics Plus",
    location: "New York, NY",
    salary: "$75,000 - $95,000",
    type: "Full-time",
    matchScore: 72,
    matchReason:
      "Good match based on your analytical skills. The company provides hearing and visual accommodations, and offers hybrid work options.",
    accommodations: ["hearing", "visual"],
    description:
      "Analyze complex datasets to drive business decisions. Work with cross-functional teams to deliver insights that matter.",
    requirements: [
      "Bachelor's degree in related field",
      "Proficiency in SQL and Python",
      "Experience with data visualization tools",
      "Strong analytical thinking",
    ],
    benefits: [
      "Hybrid work model",
      "Learning and development opportunities",
      "Health and wellness programs",
      "Assistive technology support",
    ],
    remote: false,
    posted: "3 days ago",
  },
  {
    id: "4",
    title: "Customer Success Manager",
    company: "SupportFirst",
    location: "Austin, TX",
    salary: "$65,000 - $80,000",
    type: "Full-time",
    matchScore: 81,
    matchReason:
      "Strong match! Your communication skills and customer focus align well. The company excels in providing social and cognitive accommodations.",
    accommodations: ["social", "cognitive", "hearing"],
    description:
      "Help our customers succeed by providing exceptional support and building lasting relationships. Work in a supportive, inclusive environment.",
    requirements: [
      "2+ years in customer success",
      "Excellent communication skills",
      "Experience with CRM systems",
      "Problem-solving abilities",
    ],
    benefits: [
      "Flexible scheduling",
      "Professional coaching",
      "Team building activities",
      "Accommodation support fund",
    ],
    remote: false,
    posted: "1 week ago",
  },
]

const sortOptions = [
  { value: "match", label: "Best Match" },
  { value: "recent", label: "Most Recent" },
  { value: "salary", label: "Highest Salary" },
  { value: "company", label: "Company A-Z" },
]

export default function JobDashboard() {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    industry: [],
    accommodations: [],
    matchScore: [0],
    remote: false,
    jobType: [],
  })

  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("match")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    const filtered = mockJobs.filter((job) => {
      // Search filter
      if (
        filters.search &&
        !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.company.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }

      // Location filter
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Remote filter
      if (filters.remote && !job.remote) {
        return false
      }

      // Match score filter
      if (job.matchScore < filters.matchScore[0]) {
        return false
      }

      // Job type filter
      if (filters.jobType.length > 0 && !filters.jobType.includes(job.type as string)) {
        return false
      }

      // Accommodations filter
      if (filters.accommodations.length > 0) {
        const hasRequiredAccommodations = filters.accommodations.every((accommodation) =>
          job.accommodations.includes(accommodation),
        )
        if (!hasRequiredAccommodations) {
          return false
        }
      }

      return true
    })

    // Sort jobs
    switch (sortBy) {
      case "match":
        filtered.sort((a, b) => b.matchScore - a.matchScore)
        break
      case "recent":
        // Simple sorting by posted date (mock implementation)
        filtered.sort((a, b) => {
          const aValue = a.posted.includes("day") ? 1 : a.posted.includes("week") ? 7 : 0
          const bValue = b.posted.includes("day") ? 1 : b.posted.includes("week") ? 7 : 0
          return aValue - bValue
        })
        break
      case "salary":
        filtered.sort((a, b) => {
          const aMax = Number.parseInt(a.salary.split(" - $")[1]?.replace(",", "") || "0")
          const bMax = Number.parseInt(b.salary.split(" - $")[1]?.replace(",", "") || "0")
          return bMax - aMax
        })
        break
      case "company":
        filtered.sort((a, b) => a.company.localeCompare(b.company))
        break
    }

    return filtered
  }, [filters, sortBy])

  const handleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const handleApplyJob = (jobId: string) => {
    // Mock application process
    console.log("Applying to job:", jobId)
  }

  const stats = [
    { label: "Total Jobs", value: filteredJobs.length, icon: Briefcase, color: "blue" },
    {
      label: "Avg Match Score",
      value: `${Math.round(filteredJobs.reduce((acc, job) => acc + job.matchScore, 0) / filteredJobs.length || 0)}%`,
      icon: TrendingUp,
      color: "emerald",
    },
    { label: "Saved Jobs", value: savedJobs.length, icon: Star, color: "amber" },
    { label: "Companies", value: new Set(filteredJobs.map((job) => job.company)).size, icon: Users, color: "purple" },
  ]

  return (
    <div className="min-h-screen bg-background max-w-7xl mx-auto ">

      <div className="container max mx-auto px-4 py-6 ">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <FilterSidebar filters={filters} onFiltersChange={setFilters} jobCount={filteredJobs.length} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-black">Recommended Jobs</h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="rounded-full flex items-center gap-2"
                  >
                    <SortAsc className="h-4 w-4" />
                    {sortOptions.find((option) => option.value === sortBy)?.label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-popover border  shadow-lg z-10 p-2 rounded-xl gap-y-1"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value)
                              setShowSortMenu(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors  border-none rounded-md mt-1  ${
                              sortBy === option.value ? "bg-primary font-medium hover:bg-primary/80" : "bg-background text-foreground  "
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-x-2 rounded-full ">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-full p-2 "
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-full p-2"
                  >
                    <Grid3X3 className="h-4 w-4 " />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Job Listings */}
            <motion.div
              layout
              className={`${viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-4"}`}
            >
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSave={handleSaveJob}
                    onApply={handleApplyJob}
                    saved={savedJobs.includes(job.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results</p>
                <Button
                  onClick={() =>
                    setFilters({
                      search: "",
                      location: "",
                      industry: [],
                      accommodations: [],
                      matchScore: [0],
                      remote: false,
                      jobType: [],
                    })
                  }
                  className="rounded-full text-white"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
