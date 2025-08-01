"use client"

import { useState, useCallback } from "react"
import CVEditor from "@/components/cv-editor"
import FileExplorer from "@/components/file-explorer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FileText, Monitor, Smartphone } from "lucide-react"

export default function CVDemoPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFile(fileId)
    if (fileId) {
      toast.success(`Opened CV file`)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h1 className="font-semibold">CV Editor</h1>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Database Connected
            </Badge>
            
            <div className="flex items-center rounded-lg border bg-background">
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("desktop")}
                className="rounded-r-none"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("mobile")}
                className="rounded-l-none"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* File Explorer Sidebar */}
        <div className={`${viewMode === "mobile" ? "hidden" : "w-80"} border-r bg-background`}>
          <FileExplorer
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        </div>

        {/* CV Editor Main Area */}
        <div className="flex-1 overflow-hidden">
          <CVEditor selectedFile={selectedFile} />
        </div>
      </div>
    </div>
  )
}
