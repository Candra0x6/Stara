"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accessibility,
  Eye,
  Headphones,
  Hand,
  Brain,
  Users,
  Heart,
  Shield,
  AlertCircle,
  CheckCircle,
  Save,
} from "lucide-react"

interface AccessibilityNeed {
  id: string
  category: string
  title: string
  description: string
  icon: any
  color: string
  selected: boolean
  details?: string
}

const accessibilityNeeds: AccessibilityNeed[] = [
  {
    id: "visual",
    category: "Visual",
    title: "Visual Accommodations",
    description: "Screen readers, high contrast displays, magnification software",
    icon: Eye,
    color: "blue",
    selected: true,
    details: "I use NVDA screen reader and prefer high contrast interfaces",
  },
  {
    id: "hearing",
    category: "Hearing",
    title: "Hearing Accommodations",
    description: "Sign language interpreters, captioning services, visual alerts",
    icon: Headphones,
    color: "purple",
    selected: false,
  },
  {
    id: "mobility",
    category: "Mobility",
    title: "Mobility Accommodations",
    description: "Ergonomic workstations, adjustable desks, accessible parking",
    icon: Accessibility,
    color: "emerald",
    selected: true,
    details: "Need adjustable desk and ergonomic chair for extended work sessions",
  },
  {
    id: "cognitive",
    category: "Cognitive",
    title: "Cognitive Accommodations",
    description: "Flexible schedules, quiet workspaces, task management tools",
    icon: Brain,
    color: "amber",
    selected: true,
    details: "Work best in quiet environments with minimal distractions",
  },
  {
    id: "motor",
    category: "Motor",
    title: "Motor Accommodations",
    description: "Alternative input devices, voice recognition software",
    icon: Hand,
    color: "rose",
    selected: false,
  },
  {
    id: "social",
    category: "Social",
    title: "Social Accommodations",
    description: "Structured communication, social skills support",
    icon: Users,
    color: "cyan",
    selected: false,
  },
]

interface AccessibilitySettings {
  shareWithEmployers: boolean
  includeInApplications: boolean
  privacyLevel: "public" | "employers-only" | "private"
  accommodationDetails: string
  emergencyContact: string
  medicalInformation: string
}

const mockSettings: AccessibilitySettings = {
  shareWithEmployers: true,
  includeInApplications: true,
  privacyLevel: "employers-only",
  accommodationDetails:
    "I work best in environments that provide visual accessibility tools and ergonomic accommodations. I'm comfortable discussing my needs during the interview process.",
  emergencyContact: "Jane Johnson - (555) 987-6543",
  medicalInformation: "",
}

export default function DisabilityAccessTab() {
  const [needs, setNeeds] = useState(accessibilityNeeds)
  const [settings, setSettings] = useState(mockSettings)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleNeed = (id: string) => {
    setNeeds((prev) => prev.map((need) => (need.id === id ? { ...need, selected: !need.selected } : need)))
  }

  const updateNeedDetails = (id: string, details: string) => {
    setNeeds((prev) => prev.map((need) => (need.id === id ? { ...need, details } : need)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const selectedNeeds = needs.filter((need) => need.selected)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Disability & Access Needs</h2>
                {saved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Saved</span>
                  </motion.div>
                )}
              </div>
              <p className="text-muted-foreground mb-4">
                Help us understand your accessibility needs to ensure you have the best possible experience.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {selectedNeeds.length} accommodations selected
                </Badge>
                <Badge
                  variant="outline"
                  className={`rounded-full ${settings.shareWithEmployers ? "border-emerald-500 text-emerald-600" : "border-amber-500 text-amber-600"}`}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {settings.privacyLevel === "public"
                    ? "Public"
                    : settings.privacyLevel === "employers-only"
                      ? "Employers Only"
                      : "Private"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="rounded-xl">
                  <Accessibility className="h-4 w-4 mr-2" />
                  Edit Preferences
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    {isSaving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accommodation Categories */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Accommodation Needs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the accommodations that would help you perform at your best.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {needs.map((need) => {
              const Icon = need.icon
              return (
                <motion.div
                  key={need.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    need.selected
                      ? `border-${need.color}-500 bg-${need.color}-50 dark:bg-${need.color}-950/20`
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                  onClick={() => isEditing && toggleNeed(need.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={need.selected}
                        onCheckedChange={() => isEditing && toggleNeed(need.id)}
                        disabled={!isEditing}
                      />
                      <Icon className={`h-5 w-5 text-${need.color}-600`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{need.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{need.description}</p>

                      {need.selected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Textarea
                            placeholder="Describe your specific needs..."
                            value={need.details || ""}
                            onChange={(e) => updateNeedDetails(need.id, e.target.value)}
                            disabled={!isEditing}
                            className="rounded-lg text-sm"
                            rows={2}
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Sharing Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="share-employers">Share with Employers</Label>
                <p className="text-sm text-muted-foreground">Allow employers to see your accommodation needs</p>
              </div>
              <Switch
                id="share-employers"
                checked={settings.shareWithEmployers}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, shareWithEmployers: checked }))}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-applications">Include in Applications</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically include accommodation info in job applications
                </p>
              </div>
              <Switch
                id="include-applications"
                checked={settings.includeInApplications}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, includeInApplications: checked }))}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label>Privacy Level</Label>
              <Select
                value={settings.privacyLevel}
                onValueChange={(value: any) => setSettings((prev) => ({ ...prev, privacyLevel: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="public">Public - Visible to everyone</SelectItem>
                  <SelectItem value="employers-only">Employers Only - Visible to potential employers</SelectItem>
                  <SelectItem value="private">Private - Only visible to you</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accommodation-details">Accommodation Summary</Label>
              <Textarea
                id="accommodation-details"
                value={settings.accommodationDetails}
                onChange={(e) => setSettings((prev) => ({ ...prev, accommodationDetails: e.target.value }))}
                disabled={!isEditing}
                className="rounded-lg min-h-[100px]"
                placeholder="Provide a summary of your accommodation needs..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-contact">Emergency Contact (Optional)</Label>
              <input
                id="emergency-contact"
                value={settings.emergencyContact}
                onChange={(e) => setSettings((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                placeholder="Name and phone number"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Notice */}
      <Card className="rounded-2xl border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Privacy is Protected</h3>
              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                Your accommodation information is encrypted and only shared according to your privacy preferences.
                Employers who receive this information are bound by accessibility and anti-discrimination laws. You can
                update these settings at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
