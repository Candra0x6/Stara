"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { toast } from "sonner"
import { cvApiService, CVFile } from "@/services/cv-api.service"
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
  Upload,
  Save,
  FileX,
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

interface FileExplorerProps {
  onFileSelect: (fileId: string) => void
  selectedFile: string | null
}

export default function FileExplorer({ onFileSelect, selectedFile }: FileExplorerProps) {
  const [fileStructure, setFileStructure] = useState<FileItem[]>([
    {
      id: "resumes",
      name: "Resumes",
      type: "folder",
      isExpanded: true,
      children: []
    }
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null)
  const [newFileName, setNewFileName] = useState("")

  // Load CV files from database
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      setIsLoading(true)
      const files = await cvApiService.getAllFiles()
      
      const resumeItems: FileItem[] = files.map(file => ({
        id: file.id,
        name: file.name,
        type: "resume",
        lastModified: formatDate(file.updatedAt),
        versions: file.version,
        isActive: file.id === selectedFile
      }))

      setFileStructure([
        {
          id: "resumes",
          name: "Resumes",
          type: "folder",
          isExpanded: true,
          children: resumeItems
        }
      ])
    } catch (error) {
      console.error('Error loading files:', error)
      toast.error('Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return '1 day ago'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const toggleFolder = (folderId: string) => {
    setFileStructure((prev) =>
      prev.map((item) => (item.id === folderId ? { ...item, isExpanded: !item.isExpanded } : item)),
    )
  }

  const handleRename = useCallback((file: FileItem) => {
    setRenamingFile(file)
    setNewFileName(file.name)
    setIsRenameDialogOpen(true)
  }, [])

  const confirmRename = useCallback(async () => {
    if (!renamingFile || !newFileName.trim()) {
      toast.error("Please enter a valid file name")
      return
    }

    try {
      await cvApiService.updateFile(renamingFile.id, { name: newFileName.trim() })
      await loadFiles() // Reload the file list
      setIsRenameDialogOpen(false)
      setRenamingFile(null)
      setNewFileName("")
      toast.success(`File renamed to "${newFileName.trim()}"`)
    } catch (error) {
      toast.error("Failed to rename file")
      console.error('Error renaming file:', error)
    }
  }, [renamingFile, newFileName])

  const handleDuplicate = useCallback(async (file: FileItem) => {
    try {
      const duplicateName = `${file.name} (Copy)`
      await cvApiService.duplicateFile(file.id, duplicateName)
      await loadFiles() // Reload the file list
      toast.success(`File duplicated as "${duplicateName}"`)
    } catch (error) {
      toast.error("Failed to duplicate file")
      console.error('Error duplicating file:', error)
    }
  }, [])

  const handleDelete = useCallback(async (file: FileItem) => {
    try {
      const success = await cvApiService.deleteFile(file.id)
      if (success) {
        await loadFiles() // Reload the file list
        if (selectedFile === file.id) {
          onFileSelect("") // Clear selection if deleted file was selected
        }
        toast.success(`File "${file.name}" deleted`)
      } else {
        toast.error("Failed to delete file")
      }
    } catch (error) {
      toast.error("Failed to delete file")
      console.error('Error deleting file:', error)
    }
  }, [selectedFile, onFileSelect])

  const createNewFile = useCallback(async () => {
    if (!newFileName.trim()) {
      toast.error("Please enter a valid file name")
      return
    }

    try {
      const defaultData = cvApiService.getDefaultCVData()
      const newFile = await cvApiService.createFile(newFileName.trim(), defaultData)
      await loadFiles() // Reload the file list
      onFileSelect(newFile.id) // Select the new file
      setIsNewFileDialogOpen(false)
      setNewFileName("")
      toast.success(`New file "${newFileName.trim()}" created`)
    } catch (error) {
      toast.error("Failed to create file")
      console.error('Error creating file:', error)
    }
  }, [newFileName, onFileSelect])

  const handleExport = useCallback(async (file: FileItem) => {
    try {
      const blob = await cvApiService.exportFile(file.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`File "${file.name}" exported`)
    } catch (error) {
      toast.error("Failed to export file")
      console.error('Error exporting file:', error)
    }
  }, [])

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importedFile = await cvApiService.importFile(file)
      await loadFiles() // Reload the file list
      onFileSelect(importedFile.id) // Select the imported file
      toast.success(`File imported as "${importedFile.name}"`)
    } catch (error) {
      toast.error("Failed to import file")
      console.error('Error importing file:', error)
    }
  }, [onFileSelect])

  const filteredFiles = fileStructure.map(folder => ({
    ...folder,
    children: folder.children?.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  }))

  const handleFileClick = (file: FileItem) => {
    if (file.type === "resume") {
      onFileSelect(file.id)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">File Explorer</h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="Enter file name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createNewFile} className="flex-1">
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsNewFileDialogOpen(false)
                        setNewFileName("")
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {filteredFiles.map((folder) => (
            <div key={folder.id}>
              <motion.div
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {folder.isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-medium text-sm">{folder.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {folder.children?.length || 0}
                </Badge>
              </motion.div>

              <AnimatePresence>
                {folder.isExpanded && folder.children && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-4 space-y-1 overflow-hidden"
                  >
                    {folder.children.map((file) => (
                      <ContextMenu key={file.id}>
                        <ContextMenuTrigger>
                          <motion.div
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${ 
                              selectedFile === file.id 
                                ? "bg-primary/10 border border-primary/20" 
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => handleFileClick(file)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            layout
                          >
                            <FileText className="h-4 w-4 text-green-600" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {file.name}
                                </span>
                                {file.isActive && (
                                  <Badge variant="default" className="text-xs px-1">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{file.lastModified}</span>
                                {file.versions && (
                                  <>
                                    <GitBranch className="h-3 w-3 ml-2" />
                                    <span>v{file.versions}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleFileClick(file)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleRename(file)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleDuplicate(file)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleExport(file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </ContextMenuItem>
                          <ContextMenuItem 
                            onClick={() => handleDelete(file)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newFileName">New Name</Label>
              <Input
                id="newFileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmRename} className="flex-1">
                Rename
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRenameDialogOpen(false)
                  setRenamingFile(null)
                  setNewFileName("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
