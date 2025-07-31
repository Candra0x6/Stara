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
    <div className="h-screen flex flex-col bg-background container mx-auto pt-10">
    
      {/* Breadcrumb */}

      {/* Main Content */}
      <div className="">
        <ResizablePanelGroup direction="horizontal" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border h-full transition-all duration-300 hover:shadow-lg hover:border-accent/30 shadow-xl shadow-/10">
          {/* File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card border-r border-border">
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

      
    </div>
  )
}
