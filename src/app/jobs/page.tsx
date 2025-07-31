"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import FilterSidebar from "@/components/filter-sidebar"
import { Briefcase, TrendingUp, Users, Star, SortAsc, Grid3X3, List, ChevronDown, Loader2 } from "lucide-react"
import JobCard from "@/components/job-card"
import { useJobs, useJobActions } from "@/hooks/use-jobs"
import { JobFilters } from "@/types/job"
import { toast } from "sonner"

const sortOptions = [
  { value: "match", label: "Best Match" },
  { value: "recent", label: "Most Recent" },
  { value: "salary", label: "Highest Salary" },
  { value: "company", label: "Company A-Z" },
]

export default function JobDashboard() {
  const initialFilters: JobFilters = {
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  }

  const { jobs, loading, error, total, totalPages, fetchJobs, updateFilters, goToPage, filters } = useJobs(initialFilters)
  const { saveJob, unsaveJob, applyToJob, savedJobs } = useJobActions()
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showSortMenu, setShowSortMenu] = useState(false) 

  // Update filters based on sort selection
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    const sortConfig = {
      match: { sortBy: "createdAt", sortOrder: "desc" },
      recent: { sortBy: "createdAt", sortOrder: "desc" },
      salary: { sortBy: "salaryMax", sortOrder: "desc" },
      company: { sortBy: "title", sortOrder: "asc" },
    } as const

    const config = sortConfig[newSortBy as keyof typeof sortConfig]
    if (config) {
      updateFilters({
        sortBy: config.sortBy as any,
        sortOrder: config.sortOrder as any,
        page: 1,
      })
    }
  }

  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobs.includes(jobId)) {
        await unsaveJob(jobId)
        toast.success("Job removed from saved jobs")
      } else {
        await saveJob(jobId)
        toast.success("Job saved successfully")
      }
    } catch (error) {
      toast.error("Failed to save job")
    }
  }

  const handleApplyJob = async (jobId: string) => {
    try {
      await applyToJob(jobId, {
        coverLetter: "",
        resumeUrl: "",
          accommodationNeeds: "",
      })
      toast.success("Application submitted successfully")
    } catch (error) {
      toast.error("Failed to submit application")
    }
  }

  const stats = [
    { label: "Total Jobs", value: total, icon: Briefcase, color: "blue" },
    {
      label: "Avg Match Score",
      value: `${Math.round(jobs.reduce((acc, job) => acc + (job.viewCount || 0), 0) / jobs.length || 0)}%`,
      icon: TrendingUp,
      color: "emerald",
    },
    { label: "Saved Jobs", value: savedJobs.length, icon: Star, color: "amber" },
    { label: "Companies", value: new Set(jobs.map((job) => job.company?.name || "Unknown")).size, icon: Users, color: "purple" },
  ]

  return (
    <div className="min-h-screen bg-background max-w-7xl mx-auto pt-10">

      <div className="container max mx-auto px-4 py-6 ">
    

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <FilterSidebar 
            filters={filters} 
            onFiltersChange={(newFilters) => updateFilters({ ...newFilters, page: 1 })} 
            jobCount={total} 
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl mb-6 border border-red-200 dark:border-red-800"
              >
                <p className="text-red-700 dark:text-red-300">{error}</p>
                <Button 
                  onClick={() => fetchJobs()}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </motion.div>
            )}

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-black">
                  {loading ? "Loading Jobs..." : `${total} Jobs Found`}
                </h2>
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="rounded-full flex items-center gap-2"
                    disabled={loading}
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
                        className="absolute top-full right-0 mt-2 w-48 bg-popover border shadow-lg z-10 p-2 rounded-xl gap-y-1"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleSortChange(option.value)
                              setShowSortMenu(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-none rounded-md mt-1 ${
                              sortBy === option.value ? "bg-primary font-medium hover:bg-primary/80" : "bg-background text-foreground"
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
                <div className="flex items-center gap-x-2 rounded-full">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-full p-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-full p-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
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
                {jobs.map((job) => (
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

            {/* Loading State */}
            {loading && jobs.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex justify-center py-12"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && !error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results</p>
                <Button
                  onClick={() => updateFilters({
                    page: 1,
                    limit: 12,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  })}
                  className="rounded-full text-white"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-2 mt-8"
              >
                <Button
                  variant="outline"
                  onClick={() => goToPage(Math.max(1, (filters.page || 1) - 1))}
                  disabled={loading || (filters.page || 1) <= 1}
                  className="rounded-full"
                >
                  Previous
                </Button>
                
                <div className="flex items-center px-4">
                  <span className="text-sm text-muted-foreground">
                    Page {filters.page || 1} of {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => goToPage(Math.min(totalPages, (filters.page || 1) + 1))}
                  disabled={loading || (filters.page || 1) >= totalPages}
                  className="rounded-full"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
