"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, CheckCircle, Accessibility, FileX, AlertCircle, SpellCheckIcon as Spam } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  job: {
    title: string
    company: string
  }
}

const reportTypes = [
  {
    id: "accessibility",
    label: "Accessibility Issues",
    description: "Content is not accessible or lacks proper accommodations",
    icon: Accessibility,
    color: "text-blue-600",
  },
  {
    id: "inaccurate",
    label: "Inaccurate Information",
    description: "Job details, requirements, or company info is incorrect",
    icon: FileX,
    color: "text-amber-600",
  },
  {
    id: "inappropriate",
    label: "Inappropriate Content",
    description: "Content violates community guidelines or is offensive",
    icon: AlertCircle,
    color: "text-red-600",
  },
  {
    id: "spam",
    label: "Spam or Fake Job",
    description: "This appears to be a fake job posting or spam",
    icon: Spam,
    color: "text-purple-600",
  },
]

export default function ReportModal({ isOpen, onClose, job }: ReportModalProps) {
  const [reportType, setReportType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reportType) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)

    // Auto close after success
    setTimeout(() => {
      onClose()
      setSubmitted(false)
      setReportType("")
      setDescription("")
    }, 3000)
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for reporting this issue. Our team will review it shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              We're committed to maintaining an accessible and accurate job platform.
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Report an Issue
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Report issues with: {job.title} at {job.company}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>What type of issue are you reporting?</Label>
            <RadioGroup value={reportType} onValueChange={setReportType}>
              {reportTypes.map((type) => {
                const Icon = type.icon
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      reportType === type.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setReportType(type.id)}
                  >
                    <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${type.color}`} />
                        <Label htmlFor={type.id} className="font-medium cursor-pointer">
                          {type.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg min-h-[100px]"
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Anonymous Reporting</p>
                <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                  Your report will be submitted anonymously. We may contact you if additional information is needed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reportType || isSubmitting}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
