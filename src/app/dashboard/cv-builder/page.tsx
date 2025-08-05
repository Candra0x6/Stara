"use client"

import { useCallback, useState } from "react"
import FileExplorer from "@/components/file-explorer"
import CVEditor from "@/components/cv-editor"
import AIAssistant from "@/components/ai-assistant"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Monitor, Smartphone } from "lucide-react"
interface FileItem {
  id: string
  name: string
  type: string
}

export default function CVBuilderPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFile(fileId)
    if (fileId) {
      toast.success(`Opened CV file`)
    }
  }, [])


  return (
    <main className="h-screen flex flex-col bg-background container mx-auto accessibility-text click-assist" role="main" aria-label="CV Builder">

      {/* Breadcrumb */}
        <div className="flex h-14 items-center px-4 mb-4">

          <div className="ml-auto flex items-center gap-2">

            <div className="flex items-center rounded-lg border bg-background">
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("desktop")}
                className={`rounded-r-none  ${viewMode === "desktop" ? "bg-primary" : "bg-transparent"}`}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("mobile")}
                className={`rounded-l-none ${viewMode === "mobile" ? "bg-primary" : "bg-transparent"}`}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      {/* Main Content */}
      <div className="">
        <ResizablePanelGroup direction="horizontal" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border h-full transition-all duration-300 hover:shadow-lg hover:border-accent/30 shadow-xl shadow-/10">
          {/* File Explorer */}
          <div className={`${viewMode === "mobile" ? "hidden" : "w-80"} border-r bg-background`}>

            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card border-r border-border">
              <FileExplorer
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            </ResizablePanel>
          </div>

          {/* Resizable Handle */}

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


    </main>
  )
}
