"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Video, Phone, Plus, Bell, ExternalLink } from "lucide-react"

interface Interview {
  id: string
  jobTitle: string
  company: string
  date: string
  time: string
  type: "video" | "phone" | "in-person"
  location?: string
  interviewer: string
  notes?: string
  status: "upcoming" | "completed" | "cancelled"
}

const mockInterviews: Interview[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    date: "2024-01-20",
    time: "2:00 PM",
    type: "video",
    interviewer: "Sarah Johnson",
    notes: "Technical interview focusing on React and accessibility",
    status: "upcoming",
  },
  {
    id: "2",
    jobTitle: "UX Designer",
    company: "InclusiveDesign Co.",
    date: "2024-01-22",
    time: "10:00 AM",
    type: "video",
    interviewer: "Mike Chen",
    notes: "Portfolio review and design process discussion",
    status: "upcoming",
  },
  {
    id: "3",
    jobTitle: "Data Analyst",
    company: "Analytics Plus",
    date: "2024-01-18",
    time: "3:30 PM",
    type: "phone",
    interviewer: "Emily Davis",
    status: "completed",
  },
]

export default function InterviewCalendar() {
  const [interviews, setInterviews] = useState(mockInterviews)
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("upcoming")

  const filteredInterviews = interviews.filter((interview) => {
    if (filter === "upcoming") return interview.status === "upcoming"
    if (filter === "completed") return interview.status === "completed"
    return true
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "phone":
        return Phone
      default:
        return MapPin
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "blue"
      case "phone":
        return "emerald"
      default:
        return "purple"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "blue"
      case "completed":
        return "emerald"
      default:
        return "gray"
    }
  }

  const addToCalendar = (interview: Interview) => {
    const startDate = new Date(`${interview.date} ${interview.time}`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later

    const event = {
      title: `Interview: ${interview.jobTitle} at ${interview.company}`,
      start: startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      end: endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      description: `Interview with ${interview.interviewer}${interview.notes ? `\n\nNotes: ${interview.notes}` : ""}`,
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}`

    window.open(googleCalendarUrl, "_blank")
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interview Schedule
          </CardTitle>
          <Button
            size="sm"
            className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Interview
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {[
            { key: "upcoming", label: "Upcoming" },
            { key: "completed", label: "Completed" },
            { key: "all", label: "All" },
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.key as any)}
              className="rounded-full text-xs"
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
            <p className="text-muted-foreground">Your upcoming interviews will appear here</p>
          </div>
        ) : (
          filteredInterviews.map((interview, index) => {
            const TypeIcon = getTypeIcon(interview.type)
            const typeColor = getTypeColor(interview.type)
            const statusColor = getStatusColor(interview.status)

            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="rounded-xl hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{interview.jobTitle}</h3>
                          <Badge
                            variant="secondary"
                            className={`bg-${statusColor}-100 text-${statusColor}-700 rounded-full`}
                          >
                            {interview.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{interview.company}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(interview.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{interview.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TypeIcon className={`h-4 w-4 text-${typeColor}-600`} />
                            <span className="capitalize">{interview.type}</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Interviewer:</strong> {interview.interviewer}
                        </p>

                        {interview.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{interview.notes}</p>
                        )}
                      </div>
                    </div>

                    {interview.status === "upcoming" && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCalendar(interview)}
                          className="rounded-lg flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Add to Calendar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg flex items-center gap-2 bg-transparent"
                        >
                          <Bell className="h-4 w-4" />
                          Set Reminder
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
