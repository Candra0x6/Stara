"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Home, Folder, FileText, GitBranch, Clock } from "lucide-react"

interface BreadcrumbItem {
  name: string
  path: string
  type: "root" | "folder" | "file"
}

interface BreadcrumbNavProps {
  currentFile: string | null
  onNavigate: (path: string) => void
}

export default function BreadcrumbNav({ currentFile, onNavigate }: BreadcrumbNavProps) {
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (!currentFile) {
      return [{ name: "CV Builder", path: "/", type: "root" }]
    }

    // Mock breadcrumb based on current file
    if (currentFile === "frontend-cv") {
      return [
        { name: "CV Builder", path: "/", type: "root" },
        { name: "Resumes", path: "/resumes", type: "folder" },
        { name: "Frontend_Developer_CV.cv", path: "/resumes/frontend-cv", type: "file" },
      ]
    }

    return [
      { name: "CV Builder", path: "/", type: "root" },
      { name: "Untitled", path: "/untitled", type: "file" },
    ]
  }

  const breadcrumbs = getBreadcrumbs()

  const getIcon = (type: string) => {
    switch (type) {
      case "root":
        return Home
      case "folder":
        return Folder
      case "file":
        return FileText
      default:
        return Home
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 bg-card border-b"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((item, index) => {
          const Icon = getIcon(item.type)
          const isLast = index === breadcrumbs.length - 1

          return (
            <div key={item.path} className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 rounded-md ${isLast ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => onNavigate(item.path)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {item.name}
              </Button>

              {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          )
        })}
      </div>

      {/* File Info */}
      {currentFile && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>v1.5</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>2 hours ago</span>
          </div>

          <Badge variant="outline" className="rounded-full text-xs">
            Auto-saved
          </Badge>
        </div>
      )}
    </motion.div>
  )
}
