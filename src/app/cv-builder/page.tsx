"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import FileExplorer from "@/components/file-explorer"
import CVEditor from "@/components/cv-editor"
import AIAssistant from "@/components/ai-assistant"
import BreadcrumbNav from "@/components/breadcrumb-nav"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User, LogOut, HelpCircle, Keyboard, Palette, Download, Share2, GitBranch } from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: string
}

export default function CVBuilderPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>("frontend-cv")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aiCollapsed, setAiCollapsed] = useState(false)

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file.id)
  }

  const handleNavigate = (path: string) => {
    console.log("Navigate to:", path)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-4 py-2 bg-card border-b"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
            <h1 className="font-semibold">CV Builder</h1>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="rounded-md">
              File
            </Button>
            <Button size="sm" variant="ghost" className="rounded-md">
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="rounded-md">
              View
            </Button>
            <Button size="sm" variant="ghost" className="rounded-md">
              Tools
            </Button>
            <Button size="sm" variant="ghost" className="rounded-md">
              Help
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-lg bg-transparent">
            <GitBranch className="h-4 w-4 mr-2" />
            Version History
          </Button>

          <Button size="sm" variant="outline" className="rounded-lg bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            size="sm"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="rounded-lg">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg">
              <DropdownMenuItem className="rounded-md">
                <User className="h-4 w-4 mr-2" />
                Profile Settings
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
      </motion.header>

      {/* Breadcrumb */}
      <BreadcrumbNav currentFile={selectedFile} onNavigate={handleNavigate} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <FileExplorer onFileSelect={handleFileSelect} selectedFile={selectedFile} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* CV Editor */}
          <ResizablePanel defaultSize={55} minSize={40}>
            <CVEditor selectedFile={selectedFile} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* AI Assistant */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <AIAssistant />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-between px-4 py-1 bg-card border-t text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>•</span>
          <span>Ln 1, Col 1</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Auto-save: On</span>
          <span>•</span>
          <span>AI Assistant: Active</span>
          <span>•</span>
          <span>Version: 1.5.0</span>
        </div>
      </motion.footer>
    </div>
  )
}
