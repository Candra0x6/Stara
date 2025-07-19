"use client"

import type React from "react"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Download, Eye, Trash2, Star, CheckCircle, File, ImageIcon, Paperclip } from "lucide-react"

interface Document {
  id: string
  name: string
  type: "resume" | "cover-letter" | "certificate" | "portfolio" | "other"
  size: string
  uploadDate: string
  status: "active" | "draft" | "archived"
  isPrimary?: boolean
  url?: string
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Sarah_Johnson_Resume_2024.pdf",
    type: "resume",
    size: "245 KB",
    uploadDate: "2024-01-15",
    status: "active",
    isPrimary: true,
    url: "/documents/resume.pdf",
  },
  {
    id: "2",
    name: "Cover_Letter_Frontend.pdf",
    type: "cover-letter",
    size: "156 KB",
    uploadDate: "2024-01-12",
    status: "active",
    url: "/documents/cover-letter.pdf",
  },
  {
    id: "3",
    name: "AWS_Certification.pdf",
    type: "certificate",
    size: "892 KB",
    uploadDate: "2024-01-10",
    status: "active",
    url: "/documents/certificate.pdf",
  },
  {
    id: "4",
    name: "Portfolio_Projects.pdf",
    type: "portfolio",
    size: "2.1 MB",
    uploadDate: "2024-01-08",
    status: "active",
    url: "/documents/portfolio.pdf",
  },
  {
    id: "5",
    name: "Old_Resume_2023.pdf",
    type: "resume",
    size: "198 KB",
    uploadDate: "2023-12-15",
    status: "archived",
  },
]

const documentTypes = [
  { value: "resume", label: "Resume", icon: FileText, color: "blue" },
  { value: "cover-letter", label: "Cover Letter", icon: File, color: "emerald" },
  { value: "certificate", label: "Certificate", icon: CheckCircle, color: "amber" },
  { value: "portfolio", label: "Portfolio", icon: ImageIcon, color: "purple" },
  { value: "other", label: "Other", icon: Paperclip, color: "gray" },
]

export default function ResumeDocumentsTab() {
  const [documents, setDocuments] = useState(mockDocuments)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(documents[0])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Add new document
          const newDoc: Document = {
            id: Date.now().toString(),
            name: files[0].name,
            type: "resume",
            size: `${Math.round(files[0].size / 1024)} KB`,
            uploadDate: new Date().toISOString().split("T")[0],
            status: "active",
          }
          setDocuments((prev) => [newDoc, ...prev])
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const setPrimaryDocument = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        isPrimary: doc.id === id ? true : false,
      })),
    )
  }

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    if (selectedDocument?.id === id) {
      setSelectedDocument(documents[0] || null)
    }
  }

  const getTypeConfig = (type: string) => {
    return documentTypes.find((t) => t.value === type) || documentTypes[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "emerald"
      case "draft":
        return "amber"
      case "archived":
        return "gray"
      default:
        return "gray"
    }
  }

  const activeDocuments = documents.filter((doc) => doc.status === "active")
  const archivedDocuments = documents.filter((doc) => doc.status === "archived")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Upload Area */}
      <Card className="rounded-2xl">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />

            {isUploading ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium mb-2">Uploading document...</p>
                  <Progress value={uploadProgress} className="w-64 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% complete</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOC, DOCX, TXT files up to 10MB</p>
                  <label htmlFor="file-upload">
                    <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
                  <TabsTrigger value="active" className="rounded-lg">
                    Active ({activeDocuments.length})
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="rounded-lg">
                    Archived ({archivedDocuments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-0">
                  <div className="space-y-1 p-4 pt-2">
                    {activeDocuments.map((doc) => {
                      const typeConfig = getTypeConfig(doc.type)
                      const TypeIcon = typeConfig.icon

                      return (
                        <motion.div
                          key={doc.id}
                          whileHover={{ scale: 1.01 }}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedDocument?.id === doc.id
                              ? "bg-blue-100 dark:bg-blue-950/30 border border-blue-200"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <div className="flex items-start gap-3">
                            <TypeIcon className={`h-4 w-4 text-${typeConfig.color}-600 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{doc.name}</p>
                                {doc.isPrimary && <Star className="h-3 w-3 text-amber-500 fill-current" />}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge
                                  variant="outline"
                                  className={`rounded-full text-xs bg-${typeConfig.color}-50 text-${typeConfig.color}-700 border-${typeConfig.color}-200`}
                                >
                                  {typeConfig.label}
                                </Badge>
                                <span>{doc.size}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="archived" className="mt-0">
                  <div className="space-y-1 p-4 pt-2">
                    {archivedDocuments.map((doc) => {
                      const typeConfig = getTypeConfig(doc.type)
                      const TypeIcon = typeConfig.icon

                      return (
                        <motion.div
                          key={doc.id}
                          whileHover={{ scale: 1.01 }}
                          className="p-3 rounded-lg cursor-pointer hover:bg-muted/50 opacity-60"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <div className="flex items-start gap-3">
                            <TypeIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{doc.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="rounded-full text-xs">
                                  Archived
                                </Badge>
                                <span>{doc.size}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedDocument ? selectedDocument.name : "Select a document"}
                  </CardTitle>
                  {selectedDocument && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`rounded-full text-xs bg-${getStatusColor(selectedDocument.status)}-50 text-${getStatusColor(selectedDocument.status)}-700 border-${getStatusColor(selectedDocument.status)}-200`}
                      >
                        {selectedDocument.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Uploaded {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {selectedDocument && (
                  <div className="flex items-center gap-2">
                    {!selectedDocument.isPrimary && selectedDocument.type === "resume" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrimaryDocument(selectedDocument.id)}
                        className="rounded-lg bg-transparent"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Set Primary
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="rounded-lg bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectedDocument && deleteDocument(selectedDocument.id)}
                      className="rounded-lg text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="h-[500px]">
              {selectedDocument ? (
                <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Document Preview</h3>
                    <p className="text-muted-foreground mb-4">
                      Preview for {selectedDocument.name}
                      <br />
                      <span className="text-sm">Size: {selectedDocument.size}</span>
                    </p>
                    <Button className="rounded-lg">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Full Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No document selected</h3>
                    <p className="text-muted-foreground">Select a document from the list to preview it here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {documentTypes.slice(0, 4).map((type) => {
          const count = documents.filter((doc) => doc.type === type.value && doc.status === "active").length
          const Icon = type.icon

          return (
            <Card key={type.value} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${type.color}-100 text-${type.color}-600`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{type.label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}
