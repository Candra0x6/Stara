"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Eye,
  MessageSquare,
  Share2,
  MoreVertical,
  Building,
  MapPin,
  Briefcase
} from "lucide-react"
import { useJobApplications, useApplicationStatus, useApplicationActions } from "@/hooks/use-job-applications"
import { formatDistanceToNow } from "date-fns"

interface ApplicationDashboardProps {
  userId?: string
}

const statusConfig = {
  PENDING: { 
    label: "Pending Review", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock 
  },
  REVIEWING: { 
    label: "Under Review", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Eye 
  },
  INTERVIEW_SCHEDULED: { 
    label: "Interview Scheduled", 
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Calendar 
  },
  INTERVIEW_COMPLETED: { 
    label: "Interview Completed", 
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: CheckCircle 
  },
  OFFER_EXTENDED: { 
    label: "Offer Extended", 
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle 
  },
  ACCEPTED: { 
    label: "Accepted", 
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle 
  },
  REJECTED: { 
    label: "Not Selected", 
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle 
  },
  WITHDRAWN: { 
    label: "Withdrawn", 
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle 
  }
}

export default function ApplicationDashboard({ userId }: ApplicationDashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>()
  
  const { status, loading: statusLoading } = useApplicationStatus()
  const { applications, loading: applicationsLoading, fetchApplications } = useJobApplications({
    status: selectedStatus,
    limit: 20
  })
  const { withdrawApplication, shareApplication } = useApplicationActions()

  const handleStatusFilter = (status: string | undefined) => {
    setSelectedStatus(status)
    fetchApplications({ status, page: 1 })
  }

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      await withdrawApplication(applicationId)
      fetchApplications() // Refresh the list
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleShareApplication = async (applicationId: string, shareType: 'link' | 'email' | 'linkedin' | 'twitter') => {
    try {
      await shareApplication({
        applicationId,
        shareType,
        message: "Check out my job application status"
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{status?.totalApplications || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(status?.statusSummary.PENDING || 0) + (status?.statusSummary.REVIEWING || 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(status?.statusSummary.INTERVIEW_SCHEDULED || 0) + (status?.statusSummary.INTERVIEW_COMPLETED || 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {status?.totalApplications && status.totalApplications > 0 
                      ? Math.round(((status.statusSummary.ACCEPTED || 0) / status.totalApplications) * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Applications List */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>My Applications</span>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(undefined)}
                className="rounded-lg"
              >
                All
              </Button>
              <Button
                variant={selectedStatus === "PENDING" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("PENDING")}
                className="rounded-lg"
              >
                Pending
              </Button>
              <Button
                variant={selectedStatus === "REVIEWING" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("REVIEWING")}
                className="rounded-lg"
              >
                Under Review
              </Button>
              <Button
                variant={selectedStatus === "INTERVIEW_SCHEDULED" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter("INTERVIEW_SCHEDULED")}
                className="rounded-lg"
              >
                Interviews
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {selectedStatus ? `No applications with status "${statusConfig[selectedStatus as keyof typeof statusConfig]?.label}"` : "You haven't submitted any applications yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application, index) => {
                const statusInfo = statusConfig[application.status as keyof typeof statusConfig]
                const StatusIcon = statusInfo?.icon || Clock

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="rounded-lg hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{application.job.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-1">
                                    <Building className="h-4 w-4" />
                                    <span>{application.job.company.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{application.job.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    {/* @ts-ignore */}
                                    <span>{application.job.workType.replace("_", " ")}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge 
                                    variant="outline" 
                                    className={`rounded-full border ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}
                                  >
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusInfo?.label || application.status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShareApplication(application.id, 'link')}
                              className="rounded-lg"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            
                            {application.status === "PENDING" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdrawApplication(application.id)}
                                className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button variant="ghost" size="sm" className="rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {application.employerNotes && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm font-medium mb-1">Employer Note</p>
                                <p className="text-sm text-muted-foreground">{application.employerNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {application.interviewAt && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Interview scheduled for {new Date(application.interviewAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
