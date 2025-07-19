"use client"

import type React from "react"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Accessibility,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react"

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  job: {
    title: string
    company: string
    location: string
  }
}

const adaProfile = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
  accommodations: ["visual", "cognitive"],
  experience: "5+ years in Frontend Development",
  skills: ["React", "TypeScript", "Accessibility", "CSS"],
  resumeUrl: "/resume-ada-profile.pdf",
}

export default function ApplicationModal({ isOpen, onClose, job }: ApplicationModalProps) {
  const [activeTab, setActiveTab] = useState("ada-profile")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [customApplication, setCustomApplication] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    resume: null as File | null,
  })

  const handleSubmit = async (type: "ada" | "custom") => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setSubmitted(true)

    // Auto close after success
    setTimeout(() => {
      onClose()
      setSubmitted(false)
    }, 3000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCustomApplication((prev) => ({ ...prev, resume: file }))
    }
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose} >
        <DialogContent className="sm:max-w-md rounded-2xl absolute">
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
            <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground mb-4">
              Your application for {job.title} at {job.company} has been successfully submitted.
            </p>
            <p className="text-sm text-muted-foreground">You'll receive a confirmation email shortly.</p>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Apply for {job.title}</DialogTitle>
          <p className="text-muted-foreground">
            {job.company} • {job.location}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="ada-profile" className="rounded-lg flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              ADA Profile
            </TabsTrigger>
            <TabsTrigger value="custom" className="rounded-lg flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Custom Application
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="ada-profile" className="mt-6">
              <motion.div
                key="ada-profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{adaProfile.name}</h3>
                        <p className="text-sm text-muted-foreground">ADA Profile</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{adaProfile.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{adaProfile.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{adaProfile.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{adaProfile.experience}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Required Accommodations</Label>
                      <div className="flex gap-2">
                        {adaProfile.accommodations.map((accommodation) => (
                          <Badge key={accommodation} variant="secondary" className="rounded-full">
                            {accommodation === "visual" ? "Visual" : "Cognitive"} Support
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Key Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {adaProfile.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="rounded-full">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Resume: ADA_Profile_Resume.pdf</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Quick Application with ADA Profile
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                        Your accommodation needs and accessibility preferences will be automatically included with your
                        application.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit("ada")}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-6 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Apply with ADA Profile"
                  )}
                </Button>
              </motion.div>
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customApplication.name}
                      onChange={(e) => setCustomApplication((prev) => ({ ...prev, name: e.target.value }))}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customApplication.email}
                      onChange={(e) => setCustomApplication((prev) => ({ ...prev, email: e.target.value }))}
                      className="rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customApplication.phone}
                    onChange={(e) => setCustomApplication((prev) => ({ ...prev, phone: e.target.value }))}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume/CV *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label htmlFor="resume" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        {customApplication.resume ? customApplication.resume.name : "Click to upload resume"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover-letter">Cover Letter</Label>
                  <Textarea
                    id="cover-letter"
                    placeholder="Tell us why you're interested in this position..."
                    value={customApplication.coverLetter}
                    onChange={(e) => setCustomApplication((prev) => ({ ...prev, coverLetter: e.target.value }))}
                    className="rounded-lg min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={() => handleSubmit("custom")}
                  disabled={
                    isSubmitting || !customApplication.name || !customApplication.email || !customApplication.resume
                  }
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-6 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Submit Custom Application"
                  )}
                </Button>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
