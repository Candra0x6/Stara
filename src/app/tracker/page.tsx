"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ApplicationTimeline from "@/components/application-timeline"
import MessageCenter from "@/components/message-center"
import InterviewCalendar from "@/components/interview-calendar"
import FollowUpSuggestions from "@/components/follow-up-suggestions"
import {
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  Eye,
  UserCheck,
  XCircle,
} from "lucide-react"

// Mock application data
const mockApplications = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    appliedDate: "Jan 15, 2024",
    status: "interview_scheduled",
    matchScore: 95,
    salary: "$120,000 - $150,000",
    viewedDate: "Jan 16, 2024",
    interviewDate: "Jan 20, 2024",
    lastActivity: "2 hours ago",
    messages: 2,
  },
  {
    id: "2",
    jobTitle: "UX Designer - Accessibility Focus",
    company: "InclusiveDesign Co.",
    location: "Remote",
    appliedDate: "Jan 12, 2024",
    status: "viewed",
    matchScore: 88,
    salary: "$90,000 - $110,000",
    viewedDate: "Jan 14, 2024",
    lastActivity: "1 day ago",
    messages: 1,
  },
  {
    id: "3",
    jobTitle: "Data Analyst",
    company: "Analytics Plus",
    location: "New York, NY",
    appliedDate: "Jan 8, 2024",
    status: "applied",
    matchScore: 72,
    salary: "$75,000 - $95,000",
    lastActivity: "5 days ago",
    messages: 0,
  },
  {
    id: "4",
    jobTitle: "Customer Success Manager",
    company: "SupportFirst",
    location: "Austin, TX",
    appliedDate: "Jan 5, 2024",
    status: "hired",
    matchScore: 81,
    salary: "$65,000 - $80,000",
    viewedDate: "Jan 6, 2024",
    interviewDate: "Jan 10, 2024",
    finalDate: "Jan 12, 2024",
    finalStatus: "hired" as const,
    lastActivity: "3 days ago",
    messages: 5,
  },
  {
    id: "5",
    jobTitle: "Product Manager",
    company: "InnovateTech",
    location: "Seattle, WA",
    appliedDate: "Jan 3, 2024",
    status: "rejected",
    matchScore: 67,
    salary: "$100,000 - $130,000",
    viewedDate: "Jan 4, 2024",
    interviewDate: "Jan 8, 2024",
    finalDate: "Jan 10, 2024",
    finalStatus: "rejected" as const,
    lastActivity: "1 week ago",
    messages: 3,
  },
]

const statusConfig = {
  applied: { label: "Applied", color: "blue", icon: Clock },
  viewed: { label: "Viewed", color: "purple", icon: Eye },
  interview_scheduled: { label: "Interview Scheduled", color: "amber", icon: Calendar },
  hired: { label: "Hired", color: "emerald", icon: UserCheck },
  rejected: { label: "Rejected", color: "red", icon: XCircle },
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState(mockApplications)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: TrendingUp,
      color: "blue",
    },
    {
      label: "In Progress",
      value: applications.filter((app) => ["applied", "viewed", "interview_scheduled"].includes(app.status)).length,
      icon: Clock,
      color: "amber",
    },
    {
      label: "Interviews",
      value: applications.filter((app) => app.status === "interview_scheduled").length,
      icon: Calendar,
      color: "purple",
    },
    {
      label: "Success Rate",
      value: `${Math.round((applications.filter((app) => app.status === "hired").length / applications.length) * 100)}%`,
      icon: CheckCircle,
      color: "emerald",
    },
  ]

  const statusCounts = Object.entries(statusConfig).map(([status, config]) => ({
    status,
    count: applications.filter((app) => app.status === status).length,
    ...config,
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b sticky top-0 z-40 backdrop-blur-sm bg-card/80"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Application Tracker
              </h1>
              <p className="text-sm text-muted-foreground">Monitor your job applications and stay organized</p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6">
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

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-xl">
            <TabsTrigger value="applications" className="rounded-lg">
              Applications
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg">
              Messages
            </TabsTrigger>
            <TabsTrigger value="interviews" className="rounded-lg">
              Interviews
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-lg">
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className="rounded-full whitespace-nowrap"
                >
                  All ({applications.length})
                </Button>
                {statusCounts.map(({ status, count, label, color }) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="rounded-full whitespace-nowrap"
                  >
                    {label} ({count})
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Applications List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredApplications.map((application, index) => {
                const statusInfo = statusConfig[application.status as keyof typeof statusConfig]
                const StatusIcon = statusInfo.icon

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{application.jobTitle}</h3>
                            <p className="text-muted-foreground mb-2">{application.company}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                variant="secondary"
                                className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-700 rounded-full`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                              {application.messages > 0 && (
                                <Badge variant="outline" className="rounded-full">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {application.messages}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600 mb-1">{application.matchScore}%</div>
                            <p className="text-xs text-muted-foreground">Match</p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            <p className="mb-1">
                              <strong>Applied:</strong> {application.appliedDate}
                            </p>
                            <p className="mb-1">
                              <strong>Salary:</strong> {application.salary}
                            </p>
                            <p>
                              <strong>Last Activity:</strong> {application.lastActivity}
                            </p>
                          </div>

                          {/* Timeline */}
                          <div className="border-t pt-4">
                            <ApplicationTimeline
                              currentStage={application.status}
                              applicationDate={application.appliedDate}
                              viewedDate={application.viewedDate}
                              interviewDate={application.interviewDate}
                              finalDate={application.finalDate}
                              finalStatus={application.finalStatus}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <MessageCenter />
          </TabsContent>

          <TabsContent value="interviews">
            <InterviewCalendar />
          </TabsContent>

          <TabsContent value="suggestions">
            <FollowUpSuggestions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
