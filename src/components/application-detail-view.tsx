"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
  Share2,
  XCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  Eye,
  Globe,
  Mail,
  Phone,
  User
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { useApplicationActions } from "@/hooks/use-job-applications"
import ShareModal from "@/components/share-modal"

interface ApplicationDetailViewProps {
  application: {
    id: string
    status: string
    coverLetter?: string
    resumeUrl?: string
    customAnswers: Array<{
      question: string
      answer: string
    }>
    appliedAt: string
    reviewedAt?: string
    interviewAt?: string
    rejectedAt?: string
    acceptedAt?: string
    employerNotes?: string
    job: {
      id: string
      title: string
      location: string
      workType: string
      description: string
      responsibilities: string[]
      requirements: string[]
      benefits: string[]
      company: {
        id: string
        name: string
        logo?: string
        website?: string
      }
    }
    user: {
      id: string
      name: string
      email: string
      profile?: {
        fullName?: string
        preferredName?: string
        phone?: string
      }
    }
  }
}

const statusConfig = {
  PENDING: { 
    label: "Pending Review", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Your application has been submitted and is waiting for initial review.",
    icon: Clock 
  },
  REVIEWING: { 
    label: "Under Review", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "The hiring team is currently reviewing your application.",
    icon: Eye 
  },
  INTERVIEW_SCHEDULED: { 
    label: "Interview Scheduled", 
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Congratulations! You've been invited for an interview.",
    icon: Calendar 
  },
  INTERVIEW_COMPLETED: { 
    label: "Interview Completed", 
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Your interview has been completed. The team is making their decision.",
    icon: CheckCircle 
  },
  OFFER_EXTENDED: { 
    label: "Offer Extended", 
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Congratulations! You've received a job offer.",
    icon: CheckCircle 
  },
  ACCEPTED: { 
    label: "Offer Accepted", 
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "You've accepted the job offer. Welcome to the team!",
    icon: CheckCircle 
  },
  REJECTED: { 
    label: "Not Selected", 
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Unfortunately, you were not selected for this position.",
    icon: XCircle 
  },
  WITHDRAWN: { 
    label: "Application Withdrawn", 
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "You have withdrawn your application for this position.",
    icon: XCircle 
  }
}

export default function ApplicationDetailView({ application }: ApplicationDetailViewProps) {
  const router = useRouter()
  const [showShareModal, setShowShareModal] = useState(false)
  const { withdrawApplication, shareApplication } = useApplicationActions()

  const statusInfo = statusConfig[application.status as keyof typeof statusConfig]
  const StatusIcon = statusInfo?.icon || Clock

  const handleWithdrawApplication = async () => {
    try {
      await withdrawApplication(application.id)
      router.push("/applications")
    } catch (error) {
      // Error handled by hook
    }
  }

  const timeline = [
    {
      status: "Applied",
      date: application.appliedAt,
      description: "Application submitted successfully",
      completed: true
    },
    {
      status: "Under Review",
      date: application.reviewedAt,
      description: "Application is being reviewed",
      completed: !!application.reviewedAt || !["PENDING"].includes(application.status)
    },
    {
      status: "Interview",
      date: application.interviewAt,
      description: "Interview scheduled",
      completed: !!application.interviewAt || ["INTERVIEW_COMPLETED", "OFFER_EXTENDED", "ACCEPTED"].includes(application.status)
    },
    {
      status: "Decision",
      date: application.acceptedAt || application.rejectedAt,
      description: application.status === "ACCEPTED" ? "Offer accepted" : application.status === "REJECTED" ? "Application declined" : "Final decision",
      completed: ["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(application.status)
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{application.job.title}</h1>
          <p className="text-muted-foreground">{application.job.company.name}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`rounded-full border text-sm px-3 py-1 ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}
                  >
                    {statusInfo?.label || application.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {statusInfo?.description}
                </p>

                {application.interviewAt && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Interview scheduled for {format(new Date(application.interviewAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {application.employerNotes && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">Employer Note</p>
                        <p className="text-sm text-muted-foreground">{application.employerNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Application Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((step, index) => (
                    <div key={step.status} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? "bg-green-100 text-green-600" 
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.status}
                        </p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(step.date), "PPP 'at' p")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Application Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {application.coverLetter && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Cover Letter</Label>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                    </div>
                  </div>
                )}

                {application.resumeUrl && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Resume</Label>
                    <Button variant="outline" className="rounded-lg" asChild>
                      <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                )}

                {application.customAnswers.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Additional Information</Label>
                    <div className="space-y-3">
                      {application.customAnswers.map((answer, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-1">{answer.question}</p>
                          <p className="text-sm text-muted-foreground">{answer.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setShowShareModal(true)}
                  className="w-full rounded-lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Application
                </Button>
                
                {application.status === "PENDING" && (
                  <Button
                    variant="outline"
                    onClick={handleWithdrawApplication}
                    className="w-full rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Withdraw Application
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{application.job.company.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{application.job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{application.job.workType.replace("_", " ")}</span>
                  </div>
                  {application.job.company.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={application.job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Company Website
                      </a>
                    </div>
                  )}
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full rounded-lg"
                  onClick={() => router.push(`/jobs/${application.job.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Job Posting
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Your Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{application.user.profile?.fullName || application.user.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{application.user.email}</span>
                </div>
                {application.user.profile?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{application.user.profile.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        job={{
          title: `Application: ${application.job.title}`,
          company: application.job.company.name,
          url: application.id
        }}
      />
    </div>
  )
}
