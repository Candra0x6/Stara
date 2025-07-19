"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Accessibility,
  Headphones,
  Eye,
  Hand,
  Brain,
  Users,
  Info,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    salary: string
    type: string
    matchScore: number
    matchReason: string
    accommodations: string[]
    description: string
    requirements: string[]
    benefits: string[]
    remote: boolean
    posted: string
  }
  onSave: (jobId: string) => void
  onApply: (jobId: string) => void
  saved: boolean
}

const accommodationIcons: Record<string, { icon: any; label: string; color: string }> = {
  visual: { icon: Eye, label: "Visual accommodations", color: "blue" },
  hearing: { icon: Headphones, label: "Hearing accommodations", color: "purple" },
  mobility: { icon: Accessibility, label: "Mobility accommodations", color: "emerald" },
  cognitive: { icon: Brain, label: "Cognitive accommodations", color: "amber" },
  motor: { icon: Hand, label: "Motor accommodations", color: "rose" },
  social: { icon: Users, label: "Social accommodations", color: "cyan" },
}

export default function JobCard({ job, onSave, onApply, saved }: JobCardProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [showMatchReason, setShowMatchReason] = useState(false)

  const getMatchColor = (score: number) => {
    if (score >= 90) return "from-emerald-500 to-green-500"
    if (score >= 75) return "from-blue-500 to-cyan-500"
    if (score >= 60) return "from-amber-500 to-yellow-500"
    return "from-rose-500 to-pink-500"
  }

  const getMatchTextColor = (score: number) => {
    if (score >= 90) return "text-emerald-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-amber-600"
    return "text-rose-600"
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="group"
    >
      <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 border-2 hover:border-primary bg-card">
        <CardContent className="p-6">
          <div onClick={() => setShowDetails(!showDetails)}   className="">

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                {job.remote && (
                  <Badge variant="secondary" className="bg-blue-100 text-primary rounded-full">
                    Remote
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{job.posted}</span>
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="relative">
              <motion.div
                className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${getMatchColor(job.matchScore)} p-0.5`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                  <span className={`text-sm font-bold ${getMatchTextColor(job.matchScore)}`}>{job.matchScore}%</span>
                </div>
              </motion.div>

              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0 bg-background border shadow-sm hover:bg-background hover:text-foreground"
                onClick={() => setShowMatchReason(!showMatchReason)}
                aria-label="Show match explanation"
              >
                <Info className="h-3 w-3" />
              </Button>

              <AnimatePresence>
                {showMatchReason && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-64 p-3 bg-popover border rounded-lg shadow-lg z-10"
                  >
                    <p className="text-sm text-popover-foreground">{job.matchReason}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Accommodations */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground">Accommodations:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.accommodations.map((accommodation) => {
                const config = accommodationIcons[accommodation]
                if (!config) return null

                const Icon = config.icon
                return (
                  <motion.div key={accommodation} whileHover={{ scale: 1.1 }} className="group/accommodation relative">
                    <div
                      className={`p-2 rounded-lg bg-${config.color}-100 text-${config.color}-600 hover:bg-${config.color}-200 transition-colors cursor-help`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/accommodation:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {config.label}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Salary and Type */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{job.salary}</span>
            </div>
            <Badge variant="outline" className="rounded-full">
              {job.type}
            </Badge>
          </div>

          {/* Description Preview */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              onClick={() => router.push(`/job/${job.id}`)}
              className="rounded-full transition-colors"
            >
              View Details
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSave(job.id)}
                className={`rounded-full p-2 transition-colors ${
                  saved ? "text-white bg-destructive border-none hover:bg-destructive" : "text-white"
                }`}
                aria-label={saved ? "Remove from saved jobs" : "Save job"}
              >
                {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>

              <Button
                onClick={() => onApply(job.id)}
                className="bg-text-white rounded-full px-6 transition-all duration-300 hover:shadow-lg"
              >
                Apply Now
              </Button>
            </div>
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="mt-4 pt-4 border-t"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ol className="list-disc pl-4">
                            <li>{req}</li>
                          </ol>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {job.benefits.map((benefit, index) => (
                         <li key={index} className="flex items-center gap-2">
                          <ol className="list-disc pl-4">
                            <li>{benefit}</li>
                          </ol>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
