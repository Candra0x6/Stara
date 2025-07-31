"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ApplicationModal from "@/components/application-modal"
import ShareModal from "@/components/share-modal"
import ReportModal from "@/components/report-modal"
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Users,
  Accessibility,
  Headphones,
  Eye,
  Hand,
  Brain,
  Bookmark,
  BookmarkCheck,
  Share2,
  Flag,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
} from "lucide-react"
import BackButton from "@/components/blocks/navigation/back-button"
import { useJob, useJobActions } from "@/hooks/use-jobs"
import { Job } from "@/types/job"
import { toast } from "sonner"
import { useParams } from "next/navigation"

const accommodationIcons: Record<string, { icon: any; label: string; color: string; description: string }> = {
  FLEXIBLE_HOURS: {
    icon: Clock,
    label: "Flexible hours",
    color: "blue",
    description: "Flexible work schedules and timing arrangements to accommodate different needs",
  },
  REMOTE_WORK: {
    icon: Building2,
    label: "Remote work",
    color: "green",
    description: "Work from home options and virtual collaboration tools",
  },
  WHEELCHAIR_ACCESS: {
    icon: Accessibility,
    label: "Wheelchair accessible",
    color: "emerald",
    description: "Wheelchair accessible facilities, ramps, elevators, and adapted workspaces",
  },
  SCREEN_READER: {
    icon: Eye,
    label: "Screen reader support",
    color: "blue",
    description: "Screen reader compatibility, alt text, and visual accessibility features",
  },
  SIGN_LANGUAGE: {
    icon: Headphones,
    label: "Sign language interpreters",
    color: "purple",
    description: "Sign language interpreters, captioning services, and visual communication aids",
  },
  QUIET_WORKSPACE: {
    icon: Brain,
    label: "Quiet workspace",
    color: "amber",
    description: "Noise-controlled environments, quiet zones, and sensory-friendly spaces",
  },
  ERGONOMIC_EQUIPMENT: {
    icon: Hand,
    label: "Ergonomic equipment",
    color: "rose",
    description: "Adjustable desks, ergonomic chairs, and specialized input devices",
  },
  MODIFIED_DUTIES: {
    icon: Users,
    label: "Modified duties",
    color: "cyan",
    description: "Flexible job responsibilities and task modifications based on individual needs",
  },
  EXTENDED_BREAKS: {
    icon: Clock,
    label: "Extended breaks",
    color: "orange",
    description: "Additional break time and flexible rest periods as needed",
  },
  TRANSPORTATION_ASSISTANCE: {
    icon: Building2,
    label: "Transportation assistance",
    color: "indigo",
    description: "Transportation support, accessible parking, and commute assistance",
  },
}

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  
  const { job, loading, error, refetch } = useJob(jobId)
  const { saveJob, unsaveJob, applyToJob, savedJobs } = useJobActions()
  
  const [saved, setSaved] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    responsibilities: false,
    requirements: false,
    benefits: false,
    company: false,
    process: false,
  })

  useEffect(() => {
    if (jobId) {
      refetch()
    }
  }, [jobId])

  useEffect(() => {
    if (job) {
      setSaved(savedJobs.includes(job.id))
    }
  }, [job, savedJobs])

  const handleSaveJob = async () => {
    if (!job) return
    
    try {
      if (saved) {
        await unsaveJob(job.id)
        setSaved(false)
        toast.success("Job removed from saved jobs")
      } else {
        await saveJob(job.id)
        setSaved(true)
        toast.success("Job saved successfully")
      }
    } catch (error) {
      toast.error("Failed to save job")
    }
  }

  const handleApplyJob = async (applicationData: any) => {
    if (!job) return
    
    try {
      await applyToJob(job.id, applicationData)
      setShowApplicationModal(false)
      toast.success("Application submitted successfully")
    } catch (error) {
      toast.error("Failed to submit application")
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getMatchColor = (score: number) => {
    if (score >= 90) return "from-emerald-500 to-green-500"
    if (score >= 75) return "from-blue-500 to-cyan-500"
    if (score >= 60) return "from-amber-500 to-yellow-500"
    return "from-rose-500 to-pink-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "The job you're looking for doesn't exist."}</p>
          <Button onClick={() => window.history.back()} className="rounded-full">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const mockMatchScore = Math.floor(Math.random() * 20) + 80
  const sections = [
    {
      key: "description" as const,
      title: "Job Description",
      content: job.description,
      type: "text",
    },
    {
      key: "responsibilities" as const,
      title: "Key Responsibilities",
      content: job.responsibilities,
      type: "list",
    },
    {
      key: "requirements" as const,
      title: "Requirements",
      content: job.requirements,
      type: "list",
    },
    {
      key: "benefits" as const,
      title: "Benefits & Perks",
      content: job.benefits,
      type: "list",
    },
    {
      key: "company" as const,
      title: "About the Company",
      content: {
        about: job.company?.description || "A forward-thinking company committed to inclusive hiring practices.",
        culture: "Our culture values diversity, inclusion, and creating accessible workplaces for all employees.",
        values: ["Inclusion", "Innovation", "Accessibility", "Growth", "Impact"],
      },
      type: "company",
    },
  ]

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 py-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-5"
        >
          <BackButton title={job.title} subtitle={job.company?.name || "Unknown Company"} />
        </motion.header>
        
        {/* Job Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-2xl mb-6 p-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2 text-foreground">{job.title}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{job.company?.name || "Unknown Company"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="relative">
                      <motion.div
                        className={`relative w-20 h-20 rounded-full bg-gradient-to-r ${getMatchColor(mockMatchScore)} p-0.5`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-600">{mockMatchScore}%</span>
                        </div>
                      </motion.div>
                      <p className="text-xs text-center mt-2 text-muted-foreground">Match Score</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {job.salaryMin && job.salaryMax 
                          ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                          : "Salary not specified"}
                      </span>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {job.workType.replace("_", " ").toLowerCase()}
                    </Badge>
                    {job.isRemote && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 rounded-full">
                        Remote
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-full">
                      {job.experience.replace("_", " ").toLowerCase()}
                    </Badge>
                  </div>

                  {/* Match Reason */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                          Why this is a great match
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-200">
                          Great match based on your skills and the company's commitment to accessibility and inclusive hiring practices.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Accommodations */}
                  {job.accommodations.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Available Accommodations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {job.accommodations.map((accommodation) => {
                          const config = accommodationIcons[accommodation]
                          if (!config) return null

                          const Icon = config.icon
                          return (
                            <motion.div key={accommodation} whileHover={{ scale: 1.02 }} className="group relative">
                              <div
                                className={`p-4 rounded-xl bg-${config.color}-50 dark:bg-${config.color}-950/20 border border-${config.color}-200 dark:border-${config.color}-800 hover:shadow-md transition-all`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className={`h-5 w-5 text-${config.color}-600`} />
                                  <div>
                                    <p className="font-medium text-sm">{config.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {config.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowApplicationModal(true)}
                  className="flex-1 bg-primary text-white rounded-xl py-5 text-md font-semibold"
                >
                  Apply Now
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveJob}
                    className={`rounded-xl transition-colors h-full ${saved ? "text-red-500 border-red-200 hover:bg-red-200 hover:text-red-500" : ""
                      }`}
                  >
                    {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </Button>

                  <Button variant="outline" onClick={() => setShowShareModal(true)} className="rounded-xl h-full">
                    <Share2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowReportModal(true)}
                    className="rounded-xl px-6 text-muted-foreground hover:text-red-500 h-full"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Job Details Sections */}
        <div className="gap-2 grid grid-cols-2">
          {sections.map((section, index) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="rounded-2xl overflow-hidden p-0 ">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full text-left hover:bg-muted/50 bg-white border-none transition-colors h-full p-5 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                    {expandedSections[section.key] ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedSections[section.key] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <CardContent className="p-6 pt-0">
                        <div className="">
                          {section.type === "text" && (
                            <div className="prose prose-sm max-w-none">
                              {(section.content as string).split("\n\n").map((paragraph, i) => (
                                <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          )}

                          {section.type === "list" && (
                            <ul className="space-y-3">
                              {(section.content as string[]).map((item, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-start gap-3"
                                >
                                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          )}

                          {section.type === "company" && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="font-semibold mb-2">About Us</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                  {(section.content as any).about}
                                </p>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Our Culture</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                  {(section.content as any).culture}
                                </p>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-3">Our Values</h3>
                                <div className="flex flex-wrap gap-2">
                                  {(section.content as any).values.map((value: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="rounded-full">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {section.type === "process" && (
                            <div className="space-y-4">
                              {(section.content as string[]).map((step, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-start gap-4"
                                >
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                    {i + 1}
                                  </div>
                                  <div className="pt-1">
                                    <p className="text-muted-foreground">{step}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sticky Apply Button for Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=" z-50 md:hidden"
        >
          <Button
            onClick={() => setShowApplicationModal(true)}
            className="w-full text-white rounded-xl py-4 text-lg font-semibold shadow-lg"
          >
            Apply Now
          </Button>
        </motion.div>
      </div>

      {/* Modals */}
      <ApplicationModal 
        isOpen={showApplicationModal} 
        onClose={() => setShowApplicationModal(false)} 
        job={{
          id: job.id,
          title: job.title,
          company: job.company?.name || "Unknown Company",
          location: job.location,
        }}
        onSubmit={handleApplyJob}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        job={{ 
          title: job.title, 
          company: job.company?.name || "Unknown Company", 
          url: job.id 
        }}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        job={{ 
          title: job.title, 
          company: job.company?.name || "Unknown Company" 
        }}
      />
    </div>
  )
}
