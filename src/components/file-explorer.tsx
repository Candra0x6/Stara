"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Search,
  ChevronRight,
  Copy,
  Trash2,
  Edit,
  Download,
  Share,
  GitBranch,
  Clock,
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "folder" | "resume" | "template" | "component"
  children?: FileItem[]
  lastModified?: string
  versions?: number
  isActive?: boolean
  isExpanded?: boolean
}

const mockFileStructure: FileItem[] = [
  {
    id: "resumes",
    name: "Resumes",
    type: "folder",
    isExpanded: true,
    children: [
      {
        id: "frontend-cv",
        name: "Frontend_Developer_CV.cv",
        type: "resume",
        lastModified: "2 hours ago",
        versions: 5,
        isActive: true,
      },
      {
        id: "fullstack-cv",
        name: "Fullstack_Engineer_CV.cv",
        type: "resume",
        lastModified: "1 day ago",
        versions: 3,
      },
      {
        id: "senior-cv",
        name: "Senior_Developer_CV.cv",
        type: "resume",
        lastModified: "3 days ago",
        versions: 8,
      },
    ],
  },
  {
    id: "templates",
    name: "Templates",
    type: "folder",
    isExpanded: false,
    children: [
      {
        id: "modern-template",
        name: "Modern_Tech.template",
        type: "template",
        lastModified: "1 week ago",
      },
      {
        id: "classic-template",
        name: "Classic_Professional.template",
        type: "template",
        lastModified: "1 week ago",
      },
      {
        id: "creative-template",
        name: "Creative_Designer.template",
        type: "template",
        lastModified: "1 week ago",
      },
    ],
  },
  {
    id: "components",
    name: "Components",
    type: "folder",
    isExpanded: false,
    children: [
      {
        id: "work-experience",
        name: "WorkExperience.component",
        type: "component",
        lastModified: "5 days ago",
      },
      {
        id: "skills",
        name: "Skills.component",
        type: "component",
        lastModified: "5 days ago",
      },
      {
        id: "education",
        name: "Education.component",
        type: "component",
        lastModified: "1 week ago",
      },
      {
        id: "projects",
        name: "Projects.component",
        type: "component",
        lastModified: "1 week ago",
      },
    ],
  },
]

interface FileExplorerProps {
  onFileSelect: (file: FileItem) => void
  selectedFile: string | null
}

export default function FileExplorer({ onFileSelect, selectedFile }: FileExplorerProps) {
  const [fileStructure, setFileStructure] = useState(mockFileStructure)
  const [searchTerm, setSearchTerm] = useState("")

  const toggleFolder = (folderId: string) => {
    setFileStructure((prev) =>
      prev.map((item) => (item.id === folderId ? { ...item, isExpanded: !item.isExpanded } : item)),
    )
  }

  const getFileIcon = (type: string, isExpanded?: boolean) => {
    switch (type) {
      case "folder":
        return isExpanded ? FolderOpen : Folder
      case "resume":
        return FileText
      case "template":
        return FileText
      case "component":
        return FileText
      default:
        return FileText
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case "folder":
        return "text-blue-600"
      case "resume":
        return "text-emerald-600"
      case "template":
        return "text-purple-600"
      case "component":
        return "text-amber-600"
      default:
        return "text-muted-foreground"
    }
  }

  const renderFileItem = (item: FileItem, depth = 0) => {
    const Icon = getFileIcon(item.type, item.isExpanded)
    const isSelected = selectedFile === item.id

    return (
      <div key={item.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                isSelected ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : ""
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => {
                if (item.type === "folder") {
                  toggleFolder(item.id)
                } else {
                  onFileSelect(item)
                }
              }}
            >
              {item.type === "folder" && (
                <motion.div animate={{ rotate: item.isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </motion.div>
              )}

              <Icon className={`h-4 w-4 ${getFileColor(item.type)}`} />

              <span className="text-sm font-medium truncate flex-1">{item.name}</span>

              {item.versions && (
                <Badge variant="outline" className="text-xs rounded-full">
                  <GitBranch className="h-2 w-2 mr-1" />
                  {item.versions}
                </Badge>
              )}

              {item.isActive && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
            </motion.div>
          </ContextMenuTrigger>

          <ContextMenuContent className="rounded-lg">
            <ContextMenuItem className="rounded-md">
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem className="rounded-md">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </ContextMenuItem>
            <ContextMenuItem className="rounded-md">
              <Download className="h-4 w-4 mr-2" />
              Export
            </ContextMenuItem>
            <ContextMenuItem className="rounded-md">
              <Share className="h-4 w-4 mr-2" />
              Share
            </ContextMenuItem>
            <ContextMenuItem className="rounded-md text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {item.lastModified && (
          <div
            className="flex items-center gap-1 px-2 text-xs text-muted-foreground mb-1"
            style={{ paddingLeft: `${depth * 16 + 32}px` }}
          >
            <Clock className="h-3 w-3" />
            <span>{item.lastModified}</span>
          </div>
        )}

        <AnimatePresence>
          {item.isExpanded && item.children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              {item.children.map((child) => renderFileItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">EXPLORER</h2>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-md">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-7 text-xs rounded-md"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">{fileStructure.map((item) => renderFileItem(item))}</div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>3 resumes</span>
          <span>Auto-saved</span>
        </div>
      </div>
    </div>
  )
}
