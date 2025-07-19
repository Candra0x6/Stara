"use client"

import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Eye, Calendar, UserCheck, XCircle } from "lucide-react"

interface TimelineStep {
  id: string
  status: "completed" | "current" | "upcoming"
  title: string
  description: string
  date?: string
  icon: any
  color: string
}

interface ApplicationTimelineProps {
  currentStage: string
  applicationDate: string
  viewedDate?: string
  interviewDate?: string
  finalDate?: string
  finalStatus?: "hired" | "rejected"
}

export default function ApplicationTimeline({
  currentStage,
  applicationDate,
  viewedDate,
  interviewDate,
  finalDate,
  finalStatus,
}: ApplicationTimelineProps) {
  const getSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: "applied",
        status: "completed",
        title: "Application Submitted",
        description: "Your application has been successfully submitted",
        date: applicationDate,
        icon: CheckCircle,
        color: "emerald",
      },
      {
        id: "viewed",
        status: viewedDate ? "completed" : currentStage === "viewed" ? "current" : "upcoming",
        title: "Application Viewed",
        description: "Employer has reviewed your application",
        date: viewedDate,
        icon: Eye,
        color: "blue",
      },
      {
        id: "interview",
        status: interviewDate
          ? "completed"
          : currentStage === "interview_scheduled"
            ? "current"
            : currentStage === "applied" || currentStage === "viewed"
              ? "upcoming"
              : "completed",
        title: "Interview Scheduled",
        description: "Interview has been arranged",
        date: interviewDate,
        icon: Calendar,
        color: "purple",
      },
      {
        id: "final",
        status: finalDate ? "completed" : "upcoming",
        title:
          finalStatus === "hired"
            ? "Offer Received"
            : finalStatus === "rejected"
              ? "Application Closed"
              : "Final Decision",
        description:
          finalStatus === "hired"
            ? "Congratulations! You received an offer"
            : finalStatus === "rejected"
              ? "Application was not successful"
              : "Awaiting final decision",
        date: finalDate,
        icon: finalStatus === "hired" ? UserCheck : finalStatus === "rejected" ? XCircle : Clock,
        color: finalStatus === "hired" ? "emerald" : finalStatus === "rejected" ? "red" : "amber",
      },
    ]

    return steps
  }

  const steps = getSteps()

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isLast = index === steps.length - 1

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative flex items-start gap-4 pb-8"
          >
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={`absolute left-6 top-12 w-0.5 h-full ${
                  step.status === "completed" ? "bg-emerald-300" : "bg-muted-foreground/20"
                }`}
              />
            )}

            {/* Timeline Icon */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                step.status === "completed"
                  ? `bg-${step.color}-100 text-${step.color}-600 border-2 border-${step.color}-200`
                  : step.status === "current"
                    ? `bg-${step.color}-100 text-${step.color}-600 border-2 border-${step.color}-400 ring-4 ring-${step.color}-100`
                    : "bg-muted text-muted-foreground border-2 border-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
            </motion.div>

            {/* Timeline Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold ${
                    step.status === "completed" || step.status === "current"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </h3>
                {step.status === "current" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 rounded-full text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <p
                className={`text-sm mb-2 ${
                  step.status === "completed" || step.status === "current"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
                }`}
              >
                {step.description}
              </p>
              {step.date && <p className="text-xs text-muted-foreground font-medium">{step.date}</p>}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
