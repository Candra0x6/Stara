"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, Mail, MessageCircle, Linkedin, Twitter, CheckCircle } from "lucide-react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  job: {
    title: string
    company: string
    url: string
  }
}

export default function ShareModal({ isOpen, onClose, job }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")

  const jobUrl = `https://jobmatcher.com/jobs/${job.url}`
  const shareText = `Check out this job opportunity: ${job.title} at ${job.company}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareOptions = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`),
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`,
        ),
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      action: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${jobUrl}`)}`,
        ),
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${jobUrl}`)}`),
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl absolute">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Job
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Info */}
          <div className="p-4 bg-muted/50 rounded-xl">
            <h3 className="font-semibold text-sm">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label>Job Link</Label>
            <div className="flex gap-2">
              <Input value={jobUrl} readOnly className="rounded-lg" />
              <Button onClick={handleCopyLink} variant="outline" className="rounded-lg px-3 bg-transparent">
                {copied ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </motion.div>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <Label>Share via</Label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon
                return (
                  <motion.button
                    key={option.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={option.action}
                    className={`${option.color} text-white p-3 rounded-xl flex items-center gap-3 transition-colors`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{option.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
