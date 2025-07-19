"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
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
} from "lucide-react"
import BackButton from "@/components/blocks/navigation/back-button"

// Mock job data
const jobData = {
  id: "1",
  title: "Senior Frontend Developer",
  company: "TechCorp Inc.",
  location: "San Francisco, CA",
  salary: "$120,000 - $150,000",
  type: "Full-time",
  remote: true,
  posted: "2 days ago",
  matchScore: 95,
  matchReason:
    "Perfect match! Your React and TypeScript skills align perfectly with this role. The company offers excellent visual and cognitive accommodations.",
  accommodations: ["visual", "cognitive", "hearing"],
  companySize: "500-1000 employees",
  industry: "Technology",
  experience: "5+ years",

  description: `We're looking for a senior frontend developer to join our accessibility-focused team. You'll work on building inclusive web applications that serve millions of users worldwide.

Our team is passionate about creating digital experiences that work for everyone, regardless of their abilities. You'll be working with cutting-edge technologies while making a real impact on accessibility in tech.`,

  responsibilities: [
    "Develop and maintain accessible React applications using TypeScript",
    "Collaborate with UX designers to implement inclusive design patterns",
    "Write comprehensive tests and documentation for accessibility features",
    "Mentor junior developers on accessibility best practices",
    "Participate in code reviews with focus on WCAG compliance",
    "Work with product managers to prioritize accessibility improvements",
  ],

  requirements: [
    "5+ years of experience with React and modern JavaScript",
    "Strong proficiency in TypeScript and modern CSS",
    "Deep understanding of web accessibility standards (WCAG 2.1)",
    "Experience with testing frameworks (Jest, React Testing Library)",
    "Knowledge of assistive technologies and screen readers",
    "Bachelor's degree in Computer Science or equivalent experience",
  ],

  preferred: [
    "Experience with accessibility testing tools (axe, WAVE)",
    "Knowledge of ARIA patterns and semantic HTML",
    "Previous work on accessibility-focused projects",
    "Familiarity with design systems and component libraries",
    "Experience with performance optimization techniques",
  ],

  benefits: [
    "Comprehensive health, dental, and vision insurance",
    "Flexible work arrangements and remote work options",
    "Professional development budget ($3,000 annually)",
    "Accessibility equipment and software provided",
    "Mental health support and wellness programs",
    "Generous PTO and parental leave policies",
    "Stock options and 401(k) matching",
    "Inclusive and diverse work environment",
  ],

  companyInfo: {
    about:
      "TechCorp Inc. is a leading technology company committed to building accessible digital experiences. We believe that technology should be inclusive and work for everyone.",
    culture:
      "Our culture is built on innovation, inclusivity, and impact. We foster an environment where diverse perspectives are valued and accessibility is a core principle.",
    values: ["Accessibility First", "Innovation", "Inclusivity", "Collaboration", "Impact"],
  },

  applicationProcess: [
    "Submit your application through our accessible portal",
    "Initial screening call with our recruiting team",
    "Technical interview focusing on accessibility",
    "Team interview and culture fit assessment",
    "Final interview with hiring manager",
    "Reference checks and offer",
  ],
}

const accommodationIcons: Record<string, { icon: any; label: string; color: string; description: string }> = {
  visual: {
    icon: Eye,
    label: "Visual accommodations",
    color: "blue",
    description: "Screen readers, high contrast displays, magnification software, and alternative text support",
  },
  hearing: {
    icon: Headphones,
    label: "Hearing accommodations",
    color: "purple",
    description: "Sign language interpreters, captioning services, visual alerts, and hearing loop systems",
  },
  mobility: {
    icon: Accessibility,
    label: "Mobility accommodations",
    color: "emerald",
    description: "Ergonomic workstations, adjustable desks, accessible parking, and mobility device support",
  },
  cognitive: {
    icon: Brain,
    label: "Cognitive accommodations",
    color: "amber",
    description: "Flexible schedules, quiet workspaces, task management tools, and memory aids",
  },
  motor: {
    icon: Hand,
    label: "Motor accommodations",
    color: "rose",
    description: "Alternative input devices, voice recognition software, and adaptive keyboards",
  },
  social: {
    icon: Users,
    label: "Social accommodations",
    color: "cyan",
    description: "Structured communication, social skills support, and inclusive team activities",
  },
}

export default function JobDetailPage() {
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

  const sections = [
    {
      key: "description" as const,
      title: "Job Description",
      content: jobData.description,
      type: "text",
    },
    {
      key: "responsibilities" as const,
      title: "Key Responsibilities",
      content: jobData.responsibilities,
      type: "list",
    },
    {
      key: "requirements" as const,
      title: "Requirements",
      content: jobData.requirements,
      type: "list",
    },
    {
      key: "benefits" as const,
      title: "Benefits & Perks",
      content: jobData.benefits,
      type: "list",
    },
    {
      key: "company" as const,
      title: "About the Company",
      content: jobData.companyInfo,
      type: "company",
    },
    {
      key: "process" as const,
      title: "Application Process",
      content: jobData.applicationProcess,
      type: "process",
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
          <BackButton title={jobData.title} subtitle={jobData.company} />
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
                      <h1 className="text-3xl font-bold mb-2 text-foreground">{jobData.title}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{jobData.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{jobData.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{jobData.posted}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="relative">
                      <motion.div
                        className={`relative w-20 h-20 rounded-full bg-gradient-to-r ${getMatchColor(jobData.matchScore)} p-0.5`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-600">{jobData.matchScore}%</span>
                        </div>
                      </motion.div>
                      <p className="text-xs text-center mt-2 text-muted-foreground">Match Score</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{jobData.salary}</span>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {jobData.type}
                    </Badge>
                    {jobData.remote && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 rounded-full">
                        Remote
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-full">
                      {jobData.experience}
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
                        <p className="text-sm text-emerald-700 dark:text-emerald-200">{jobData.matchReason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Accommodations */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Available Accommodations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {jobData.accommodations.map((accommodation) => {
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 ">
                <Button
                  onClick={() => setShowApplicationModal(true)}
                  className="flex-1 bg-primary text-white rounded-xl py-5 text-md font-semibold"
                >
                  Apply Now
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSaved(!saved)}
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
                    className="rounded-xl px-6 text-muted-foreground hover:text-red-500 h-full "
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
      <ApplicationModal isOpen={showApplicationModal} onClose={() => setShowApplicationModal(false)} job={jobData} />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        job={{ title: jobData.title, company: jobData.company, url: jobData.id }}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        job={{ title: jobData.title, company: jobData.company }}
      />
    </div>
  )
}
