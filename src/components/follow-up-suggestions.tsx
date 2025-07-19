"use client"

import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"

interface FollowUpSuggestion {
  id: string
  jobTitle: string
  company: string
  stage: string
  suggestion: string
  urgency: "low" | "medium" | "high"
  daysWaiting: number
  action: string
  completed?: boolean
}

const mockSuggestions: FollowUpSuggestion[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    stage: "Interview Completed",
    suggestion:
      "It's been 5 days since your interview. Consider sending a thank-you follow-up email to reiterate your interest.",
    urgency: "medium",
    daysWaiting: 5,
    action: "Send Thank You Email",
  },
  {
    id: "2",
    jobTitle: "UX Designer",
    company: "InclusiveDesign Co.",
    stage: "Application Viewed",
    suggestion:
      "Your application was viewed 3 days ago. Consider reaching out to express continued interest and ask about next steps.",
    urgency: "low",
    daysWaiting: 3,
    action: "Send Follow-up Email",
  },
  {
    id: "3",
    jobTitle: "Data Analyst",
    company: "Analytics Plus",
    stage: "Applied",
    suggestion:
      "It's been 10 days since you applied. Consider following up to ensure your application was received and inquire about the timeline.",
    urgency: "high",
    daysWaiting: 10,
    action: "Check Application Status",
  },
  {
    id: "4",
    jobTitle: "Customer Success Manager",
    company: "SupportFirst",
    stage: "Interview Scheduled",
    suggestion:
      "Your interview is tomorrow! Prepare by researching the company's recent accessibility initiatives and prepare thoughtful questions.",
    urgency: "high",
    daysWaiting: 0,
    action: "Prepare for Interview",
    completed: true,
  },
]

export default function FollowUpSuggestions() {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "red"
      case "medium":
        return "amber"
      default:
        return "blue"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return AlertCircle
      case "medium":
        return Clock
      default:
        return Lightbulb
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Follow-up Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">Smart recommendations to keep your applications moving forward</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {mockSuggestions.map((suggestion, index) => {
          const urgencyColor = getUrgencyColor(suggestion.urgency)
          const UrgencyIcon = getUrgencyIcon(suggestion.urgency)

          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={`rounded-xl border-l-4 border-l-${urgencyColor}-500 ${suggestion.completed ? "opacity-60" : "hover:shadow-md"} transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{suggestion.jobTitle}</h3>
                        {suggestion.completed && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-sm text-muted-foreground">{suggestion.company}</p>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {suggestion.stage}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UrgencyIcon className={`h-4 w-4 text-${urgencyColor}-600`} />
                      <Badge
                        variant="secondary"
                        className={`bg-${urgencyColor}-100 text-${urgencyColor}-700 rounded-full text-xs`}
                      >
                        {suggestion.urgency} priority
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{suggestion.suggestion}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {suggestion.daysWaiting === 0
                          ? "Today"
                          : `${suggestion.daysWaiting} day${suggestion.daysWaiting > 1 ? "s" : ""} waiting`}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant={suggestion.completed ? "outline" : "default"}
                      disabled={suggestion.completed}
                      className={`rounded-lg ${
                        !suggestion.completed
                          ? `bg-gradient-to-r from-${urgencyColor}-500 to-${urgencyColor}-600 hover:from-${urgencyColor}-600 hover:to-${urgencyColor}-700 text-white`
                          : ""
                      }`}
                    >
                      {suggestion.completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {suggestion.action}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
