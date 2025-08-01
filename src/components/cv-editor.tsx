"use client"

import { motion } from "motion/react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cvApiService, CVFile } from "@/services/cv-api.service"
import { CVData, PersonalInfo, Experience, Education } from "@/services/cv-database.service"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  Eye,
  Code,
  Edit,
  Save,
  Download,
  Share2,
  GitBranch,
  Clock,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Check,
  ChevronDown,
} from "lucide-react"

interface CVEditorProps {
  selectedFile: string | null
}

export default function CVEditor({ selectedFile }: CVEditorProps) {
  const [cvData, setCVData] = useState<CVData>(cvApiService.getDefaultCVData())
  const [currentFile, setCurrentFile] = useState<CVFile | null>(null)
  const [activeTab, setActiveTab] = useState("preview")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const cvPreviewRef = useRef<HTMLDivElement>(null)

  // Load file data when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      loadFileData(selectedFile)
    } else {
      setCurrentFile(null)
      setCVData(cvApiService.getDefaultCVData())
    }
  }, [selectedFile])

  const loadFileData = async (fileId: string) => {
    try {
      setIsLoading(true)
      const file = await cvApiService.getFile(fileId)
      
      if (file) {
        setCurrentFile(file)
        setCVData(file.data)
        setHasUnsavedChanges(false)
        setLastSaved(file.updatedAt)
        toast.success(`Loaded ${file.name}`)
      }
    } catch (error) {
      toast.error("Failed to load file")
      console.error("Error loading file:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && selectedFile) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave()
      }, 3000) // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(autoSaveTimer)
    }
  }, [cvData, hasUnsavedChanges, selectedFile])

  const handleAutoSave = async () => {
    if (!selectedFile) return
    
    try {
      setIsSaving(true)
      await cvApiService.autoSave(selectedFile, cvData)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      toast.success("Auto-saved", {
        description: "Your changes have been automatically saved.",
        duration: 2000,
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
      toast.error("Auto-save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    if (!selectedFile) return
    
    try {
      setIsSaving(true)
      const updatedFile = await cvApiService.updateFile(selectedFile, { data: cvData })
      setCurrentFile(updatedFile)
      setLastSaved(updatedFile.updatedAt)
      setHasUnsavedChanges(false)
      
      toast.success("Saved successfully", {
        description: "Your CV has been saved.",
        duration: 3000,
      })
    } catch (error) {
      toast.error("Save failed", {
        description: "There was an error saving your CV. Please try again.",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportJSON = async () => {
    if (!currentFile) return
    
    try {
      const blob = await cvApiService.exportFile(currentFile.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentFile.name}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("CV exported as JSON successfully")
    } catch (error) {
      toast.error("Failed to export CV as JSON")
    }
  }

  const handleExportPDF = async () => {
    if (!cvPreviewRef.current || !currentFile) return
    
    try {
      setIsExporting(true)
      toast.info("Generating PDF...", { duration: 2000 })
      
      // Temporarily switch to preview tab if not already there
      const wasPreview = activeTab === "preview"
      if (!wasPreview) {
        setActiveTab("preview")
        // Wait for tab switch to complete
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Configure html2canvas options for better compatibility
      const canvas = await html2canvas(cvPreviewRef.current, {
        scale: 2, // Higher resolution for crisp text
        useCORS: true,
        allowTaint: false, // Changed to false to avoid Lab color issues
        backgroundColor: '#ffffff',
        width: cvPreviewRef.current.scrollWidth,
        height: cvPreviewRef.current.scrollHeight,
        windowWidth: 1200, // Consistent width
        windowHeight: 1600, // Consistent height
        ignoreElements: (element) => {
          // Skip elements that might cause Lab color issues
          const tagName = element.tagName?.toLowerCase()
          return tagName === 'script' || tagName === 'style'
        },
        onclone: (clonedDoc) => {
          // Remove any CSS that might contain Lab colors
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')
          styles.forEach(styleElement => {
            if (styleElement.textContent?.includes('lab(') || 
                styleElement.textContent?.includes('oklch(') ||
                (styleElement as HTMLLinkElement).href?.includes('globals.css')) {
              styleElement.remove()
            }
          })
          
          // Apply safe inline styles to problematic elements
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach(el => {
            const element = el as HTMLElement
            // Reset any problematic CSS custom properties or Lab colors
            const computedStyle = window.getComputedStyle(element)
            if (computedStyle.color?.includes('lab(') || computedStyle.color?.includes('oklch(')) {
              element.style.color = '#000000'
            }
            if (computedStyle.backgroundColor?.includes('lab(') || computedStyle.backgroundColor?.includes('oklch(')) {
              element.style.backgroundColor = '#ffffff'
            }
            if (computedStyle.borderColor?.includes('lab(') || computedStyle.borderColor?.includes('oklch(')) {
              element.style.borderColor = '#cccccc'
            }
            
            // Remove CSS custom properties that might contain Lab colors
            element.style.removeProperty('--color')
            element.style.removeProperty('--background')
            element.style.removeProperty('--border')
            element.style.removeProperty('--foreground')
            element.style.removeProperty('--muted')
            element.style.removeProperty('--muted-foreground')
          })
        }
      })

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Add margins
      const margin = 10
      const availableWidth = pdfWidth - (2 * margin)
      const availableHeight = pdfHeight - (2 * margin)
      
      // Calculate scaling to fit content properly
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(availableWidth / (imgWidth * 0.264583), availableHeight / (imgHeight * 0.264583))
      
      const scaledWidth = (imgWidth * 0.264583) * ratio
      const scaledHeight = (imgHeight * 0.264583) * ratio
      
      // Center the content on the page
      const x = (pdfWidth - scaledWidth) / 2
      const y = margin

      // If content is too long, we might need multiple pages
      if (scaledHeight > availableHeight) {
        // For now, scale to fit on one page
        const singlePageRatio = availableHeight / (imgHeight * 0.264583)
        const singlePageWidth = (imgWidth * 0.264583) * singlePageRatio
        const singlePageHeight = availableHeight
        const centeredX = (pdfWidth - singlePageWidth) / 2
        
        pdf.addImage(imgData, 'PNG', centeredX, margin, singlePageWidth, singlePageHeight)
      } else {
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
      }
      
      // Add metadata
      pdf.setProperties({
        title: currentFile.name,
        subject: 'CV/Resume',
        author: cvData.personalInfo.name || 'CV Editor User',
        creator: 'CV Editor',
        producer: 'CV Editor PDF Export'
      })
      
      // Save the PDF
      const fileName = `${currentFile.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`
      pdf.save(fileName)
      
      // Restore original tab if it was changed
      if (!wasPreview) {
        setActiveTab("editor")
      }
      
      toast.success("CV exported as PDF successfully")
    } catch (error) {
      console.error('Error exporting PDF:', error)
      
      // If Lab color error occurs, try a fallback method
      if (error instanceof Error && error.message.includes('lab')) {
        try {
          toast.info("Trying alternative PDF export method...", { duration: 2000 })
          await handleExportPDFBasic()
        } catch (fallbackError) {
          console.error('Fallback PDF export also failed:', fallbackError)
          toast.error(`Failed to export PDF: ${error.message}. Please try using a different browser.`)
        }
      } else {
        toast.error(`Failed to export CV as PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsExporting(false)
    }
  }

  // Basic PDF export fallback method
  const handleExportPDFBasic = async () => {
    if (!currentFile) return

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const margin = 20
    let yPosition = margin

    // Add title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(cvData.personalInfo.name || 'CV', margin, yPosition)
    yPosition += 15

    // Add contact info
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    if (cvData.personalInfo.email) {
      pdf.text(`Email: ${cvData.personalInfo.email}`, margin, yPosition)
      yPosition += 7
    }
    if (cvData.personalInfo.phone) {
      pdf.text(`Phone: ${cvData.personalInfo.phone}`, margin, yPosition)
      yPosition += 7
    }
    if (cvData.personalInfo.location) {
      pdf.text(`Location: ${cvData.personalInfo.location}`, margin, yPosition)
      yPosition += 10
    }

    // Add summary
    if (cvData.personalInfo.summary) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Summary', margin, yPosition)
      yPosition += 7
      pdf.setFont('helvetica', 'normal')
      const summaryLines = pdf.splitTextToSize(cvData.personalInfo.summary, 170)
      pdf.text(summaryLines, margin, yPosition)
      yPosition += summaryLines.length * 5 + 10
    }

    // Add experience
    if (cvData.experience.length > 0) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Work Experience', margin, yPosition)
      yPosition += 10
      
      cvData.experience.forEach((exp) => {
        pdf.setFont('helvetica', 'bold')
        pdf.text(exp.position, margin, yPosition)
        yPosition += 5
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${exp.company} | ${exp.startDate} - ${exp.endDate || 'Present'}`, margin, yPosition)
        yPosition += 5
        if (exp.description) {
          const descLines = pdf.splitTextToSize(exp.description, 170)
          pdf.text(descLines, margin, yPosition)
          yPosition += descLines.length * 5 + 5
        }
        yPosition += 5
      })
    }

    // Save the basic PDF
    const fileName = `${currentFile.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_basic.pdf`
    pdf.save(fileName)
    toast.success("CV exported as basic PDF successfully")
  }

  const handleShare = async () => {
    if (!selectedFile) return
    
    try {
      const shareUrl = `${window.location.origin}/cv-demo?file=${selectedFile}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Share link copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy share link")
    }
  }

  const updateCVData = useCallback((updatedData: CVData) => {
    setCVData(updatedData)
    setHasUnsavedChanges(true)
  }, [])

  const updatePersonalInfo = useCallback((field: keyof PersonalInfo, value: string) => {
    const newData = { ...cvData }
    newData.personalInfo = { ...newData.personalInfo, [field]: value }
    updateCVData(newData)
  }, [cvData, updateCVData])

  const updateExperience = useCallback((index: number, field: keyof Experience, value: string) => {
    const newData = { ...cvData }
    const newExperience = [...newData.experience]
    if (newExperience[index]) {
      newExperience[index] = { ...newExperience[index], [field]: value }
      newData.experience = newExperience
      updateCVData(newData)
    }
  }, [cvData, updateCVData])

  const updateEducation = useCallback((index: number, field: keyof Education, value: string) => {
    const newData = { ...cvData }
    const newEducation = [...newData.education]
    if (newEducation[index]) {
      newEducation[index] = { ...newEducation[index], [field]: value }
      newData.education = newEducation
      updateCVData(newData)
    }
  }, [cvData, updateCVData])

  const updateSkills = useCallback((skills: string) => {
    const newData = { ...cvData }
    newData.skills = skills.split(",").map(skill => skill.trim()).filter(skill => skill !== "")
    updateCVData(newData)
  }, [cvData, updateCVData])

  const updateLanguages = useCallback((languages: string) => {
    const newData = { ...cvData }
    newData.languages = languages.split(",").map(lang => lang.trim()).filter(lang => lang !== "")
    updateCVData(newData)
  }, [cvData, updateCVData])

  const updateCertifications = useCallback((certifications: string) => {
    const newData = { ...cvData }
    newData.certifications = certifications.split(",").map(cert => cert.trim()).filter(cert => cert !== "")
    updateCVData(newData)
  }, [cvData, updateCVData])

  const addExperience = useCallback(() => {
    const newData = { ...cvData }
    const newExp: Experience = {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    }
    newData.experience = [...newData.experience, newExp]
    updateCVData(newData)
  }, [cvData, updateCVData])

  const removeExperience = useCallback((index: number) => {
    const newData = { ...cvData }
    newData.experience = newData.experience.filter((_, i) => i !== index)
    updateCVData(newData)
  }, [cvData, updateCVData])

  const addEducation = useCallback(() => {
    const newData = { ...cvData }
    const newEdu: Education = {
      institution: "",
      degree: "",
      year: "",
      gpa: ""
    }
    newData.education = [...newData.education, newEdu]
    updateCVData(newData)
  }, [cvData, updateCVData])

  const removeEducation = useCallback((index: number) => {
    const newData = { ...cvData }
    newData.education = newData.education.filter((_, i) => i !== index)
    updateCVData(newData)
  }, [cvData, updateCVData])

  const renderPreview = () => (
    <div 
      ref={cvPreviewRef} 
      className="max-w-2xl mx-auto bg-white text-black p-8 shadow-lg rounded-lg"
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Times, serif'
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>{cvData.personalInfo.name}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600" style={{ color: '#666666' }}>
          <span>{cvData.personalInfo.email}</span>
          <span>{cvData.personalInfo.phone}</span>
          <span>{cvData.personalInfo.location}</span>
        </div>
        {cvData.personalInfo.summary && (
          <p className="mt-4 text-gray-700 max-w-xl mx-auto" style={{ color: '#333333' }}>
            {cvData.personalInfo.summary}
          </p>
        )}
      </div>

      {/* Experience */}
      {cvData.experience.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2" style={{ color: '#000000', borderColor: '#cccccc' }}>Work Experience</h3>
          {cvData.experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-lg" style={{ color: '#000000' }}>{exp.position}</h4>
                  <p className="text-gray-600" style={{ color: '#666666' }}>{exp.company}</p>
                </div>
                <span className="text-sm text-gray-500" style={{ color: '#888888' }}>
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              {exp.description && (
                <p className="text-gray-700" style={{ color: '#333333' }}>{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {cvData.education.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2" style={{ color: '#000000', borderColor: '#cccccc' }}>Education</h3>
          {cvData.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold" style={{ color: '#000000' }}>{edu.degree}</h4>
                  <p className="text-gray-600" style={{ color: '#666666' }}>{edu.institution}</p>
                  {edu.gpa && <p className="text-sm text-gray-500" style={{ color: '#888888' }}>GPA: {edu.gpa}</p>}
                </div>
                <span className="text-sm text-gray-500" style={{ color: '#888888' }}>{edu.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {cvData.skills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2" style={{ color: '#000000', borderColor: '#cccccc' }}>Skills</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" style={{ backgroundColor: '#f0f0f0', color: '#000000' }}>
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {cvData.languages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2" style={{ color: '#000000', borderColor: '#cccccc' }}>Languages</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.languages.map((language, index) => (
              <Badge key={index} variant="outline" style={{ borderColor: '#cccccc', color: '#000000' }}>
                {language}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2" style={{ color: '#000000', borderColor: '#cccccc' }}>Certifications</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700" style={{ color: '#333333' }}>
            {cvData.certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderEditor = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold">Personal Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="Full Name" 
              value={cvData.personalInfo.name}
              onChange={(e) => updatePersonalInfo("name", e.target.value)}
            />
            <Input 
              placeholder="Email" 
              value={cvData.personalInfo.email}
              onChange={(e) => updatePersonalInfo("email", e.target.value)}
            />
            <Input 
              placeholder="Phone" 
              value={cvData.personalInfo.phone}
              onChange={(e) => updatePersonalInfo("phone", e.target.value)}
            />
            <Input 
              placeholder="Location" 
              value={cvData.personalInfo.location}
              onChange={(e) => updatePersonalInfo("location", e.target.value)}
            />
            <div className="col-span-2">
              <Textarea 
                placeholder="Summary" 
                value={cvData.personalInfo.summary}
                onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Work Experience</h3>
            <Button size="sm" onClick={addExperience}>
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </Button>
          </div>
          <div className="space-y-4">
            {cvData.experience.map((exp, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Experience {index + 1}</h4>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeExperience(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="Company" 
                    value={exp.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                  />
                  <Input 
                    placeholder="Position" 
                    value={exp.position}
                    onChange={(e) => updateExperience(index, "position", e.target.value)}
                  />
                  <Input 
                    placeholder="Start Date" 
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                  />
                  <Input 
                    placeholder="End Date" 
                    value={exp.endDate || ""}
                    onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                  />
                  <div className="col-span-2">
                    <Textarea 
                      placeholder="Description" 
                      value={exp.description}
                      onChange={(e) => updateExperience(index, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Education</h3>
            <Button size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          </div>
          <div className="space-y-4">
            {cvData.education.map((edu, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Education {index + 1}</h4>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeEducation(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="Institution" 
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  />
                  <Input 
                    placeholder="Degree" 
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  />
                  <Input 
                    placeholder="Year" 
                    value={edu.year}
                    onChange={(e) => updateEducation(index, "year", e.target.value)}
                  />
                  <Input 
                    placeholder="GPA (optional)" 
                    value={edu.gpa || ""}
                    onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Skills</h3>
          <Textarea 
            placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)" 
            value={cvData.skills.join(", ")}
            onChange={(e) => updateSkills(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Languages */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Languages</h3>
          <Textarea 
            placeholder="Enter languages separated by commas (e.g., English, Spanish, French)" 
            value={cvData.languages.join(", ")}
            onChange={(e) => updateLanguages(e.target.value)}
            rows={2}
          />
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Certifications</h3>
          <Textarea 
            placeholder="Enter certifications separated by commas" 
            value={cvData.certifications.join(", ")}
            onChange={(e) => updateCertifications(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  )

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No file selected</h3>
          <p className="text-muted-foreground">Select a resume from the explorer to start editing</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading CV...</h3>
          <p className="text-muted-foreground">Please wait while we load your file</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="rounded-lg">
              <TabsTrigger value="preview" className="rounded-md">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="editor" className="rounded-md">
                <Edit className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="code" className="rounded-md">
                <Code className="h-4 w-4 mr-2" />
                JSON
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span className="font-medium">{currentFile?.name || "Untitled CV"}</span>
            <GitBranch className="h-3 w-3 ml-2" />
            <span>v{currentFile?.version || 1}</span>
            
            {isSaving ? (
              <Badge variant="outline" className="rounded-full bg-yellow-50 border-yellow-200 text-yellow-700">
                <Clock className="h-2 w-2 mr-1 animate-spin" />
                Saving...
              </Badge>
            ) : hasUnsavedChanges ? (
              <Badge variant="outline" className="rounded-full bg-orange-50 border-orange-200 text-orange-700">
                <Clock className="h-2 w-2 mr-1" />
                Unsaved changes
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full bg-green-50 border-green-200 text-green-700">
                <Check className="h-2 w-2 mr-1" />
                {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Saved"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-lg bg-transparent"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-lg bg-transparent"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
                <Code className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="preview" className="h-full p-6 bg-gray-100">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {renderPreview()}
            </motion.div>
          </TabsContent>

          <TabsContent value="editor" className="h-full p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {renderEditor()}
            </motion.div>
          </TabsContent>

          <TabsContent value="code" className="h-full p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="rounded-xl h-full">
                <CardContent className="p-6 h-full">
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto h-full">
                    {JSON.stringify(cvData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
