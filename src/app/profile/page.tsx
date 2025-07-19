"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import PersonalInfoTab from "@/components/personal-info-tab"
import DisabilityAccessTab from "@/components/disability-access-tab"
import ResumeDocumentsTab from "@/components/resume-documents-tab"
import AccessibilitySettingsTab from "@/components/accessibility-settings-tab"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Shield,
  FileText,
  Settings,
  Download,
  Share2,
  Bell,
  HelpCircle,
  LogOut,
  Palette,
  Keyboard,
} from "lucide-react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal")
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExporting(false)

    // In a real app, this would trigger the PDF download
    console.log("Exporting profile as PDF...")
  }

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      icon: User,
      description: "Basic information and contact details",
    },
    {
      id: "accessibility",
      label: "Disability & Access",
      icon: Shield,
      description: "Accommodation needs and preferences",
    },
    {
      id: "documents",
      label: "Resume & Documents",
      icon: FileText,
      description: "Upload and manage your documents",
    },
    {
      id: "settings",
      label: "Accessibility Settings",
      icon: Settings,
      description: "Interface and accessibility preferences",
    },
  ]

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Badge variant="secondary" className="rounded-full">
                Last updated 2 hours ago
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                variant="outline"
                className="rounded-xl bg-transparent"
              >
                {isExporting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export PDF
              </Button>

              <Button variant="outline" className="rounded-xl bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-lg">
                  <DropdownMenuItem className="rounded-md">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-md">
                    <Palette className="h-4 w-4 mr-2" />
                    Theme Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-md">
                    <Keyboard className="h-4 w-4 mr-2" />
                    Keyboard Shortcuts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-md">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-md text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-2xl p-1 h-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-xl p-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-sm">{tab.label}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{tab.description}</div>
                      </div>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Tab Content */}
            <div className="mt-8">
              <TabsContent value="personal" className="mt-0">
                <PersonalInfoTab />
              </TabsContent>

              <TabsContent value="accessibility" className="mt-0">
                <DisabilityAccessTab />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <ResumeDocumentsTab />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <AccessibilitySettingsTab />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border-t bg-card mt-12"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Profile last updated: 2 hours ago</span>
              <span>•</span>
              <span>Auto-save: Enabled</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="rounded-lg">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                Help Center
              </Button>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
