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
                    className="rounded-xl p-4 data-[state=active]:bg-primary data-[state=active]:shadow-sm"
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-sm">{tab.label}</div>
                        <div className="text-xs hidden sm:block">{tab.description}</div>
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
