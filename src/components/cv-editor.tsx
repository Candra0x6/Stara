"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

interface CVSection {
  id: string
  type: "personal" | "experience" | "education" | "skills" | "projects" | "custom"
  title: string
  content: any
  order: number
}

const mockCVData: CVSection[] = [
  {
    id: "personal",
    type: "personal",
    title: "Personal Information",
    order: 1,
    content: {
      name: "Alex Johnson",
      title: "Senior Frontend Developer",
      email: "alex.johnson@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "alexjohnson.dev",
      linkedin: "linkedin.com/in/alexjohnson",
      github: "github.com/alexjohnson",
    },
  },
  {
    id: "experience",
    type: "experience",
    title: "Work Experience",
    order: 2,
    content: [
      {
        id: "exp1",
        company: "TechCorp Inc.",
        position: "Senior Frontend Developer",
        location: "San Francisco, CA",
        startDate: "Jan 2022",
        endDate: "Present",
        description: [
          "Led development of accessible React applications serving 2M+ users",
          "Implemented design system reducing development time by 40%",
          "Mentored 5 junior developers on modern frontend practices",
          "Collaborated with UX team to improve user experience metrics by 25%",
        ],
      },
      {
        id: "exp2",
        company: "StartupXYZ",
        position: "Frontend Developer",
        location: "Remote",
        startDate: "Jun 2020",
        endDate: "Dec 2021",
        description: [
          "Built responsive web applications using React and TypeScript",
          "Optimized application performance resulting in 50% faster load times",
          "Integrated third-party APIs and payment systems",
        ],
      },
    ],
  },
  {
    id: "skills",
    type: "skills",
    title: "Technical Skills",
    order: 3,
    content: {
      languages: ["JavaScript", "TypeScript", "Python", "HTML", "CSS"],
      frameworks: ["React", "Next.js", "Vue.js", "Node.js", "Express"],
      tools: ["Git", "Docker", "AWS", "Figma", "Jest"],
      databases: ["PostgreSQL", "MongoDB", "Redis"],
    },
  },
]

interface CVEditorProps {
  selectedFile: string | null
}

export default function CVEditor({ selectedFile }: CVEditorProps) {
  const [cvData, setCVData] = useState(mockCVData)
  const [activeTab, setActiveTab] = useState("preview")
  const [isEditing, setIsEditing] = useState(false)

  const renderPreview = () => (
    <div className="max-w-2xl mx-auto bg-white text-black p-8 shadow-lg rounded-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{cvData[0]?.content.name}</h1>
        <h2 className="text-xl text-gray-600 mb-4">{cvData[0]?.content.title}</h2>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span>{cvData[0]?.content.email}</span>
          <span>{cvData[0]?.content.phone}</span>
          <span>{cvData[0]?.content.location}</span>
        </div>
        <div className="flex justify-center gap-4 mt-2 text-sm text-blue-600">
          <span>{cvData[0]?.content.website}</span>
          <span>{cvData[0]?.content.linkedin}</span>
          <span>{cvData[0]?.content.github}</span>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Work Experience</h3>
        {cvData[1]?.content.map((exp: any) => (
          <div key={exp.id} className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-lg">{exp.position}</h4>
                <p className="text-gray-600">
                  {exp.company} • {exp.location}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {exp.startDate} - {exp.endDate}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {exp.description.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Technical Skills</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(cvData[2]?.content || {}).map(([category, skills]) => (
            <div key={category}>
              <h4 className="font-semibold capitalize mb-2">{category}:</h4>
              <p className="text-gray-700">{(skills as string[]).join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderEditor = () => (
    <div className="space-y-6">
      {cvData.map((section) => (
        <Card key={section.id} className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <h3 className="font-semibold">{section.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {section.type === "personal" && (
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Full Name" defaultValue={section.content.name} />
                <Input placeholder="Job Title" defaultValue={section.content.title} />
                <Input placeholder="Email" defaultValue={section.content.email} />
                <Input placeholder="Phone" defaultValue={section.content.phone} />
                <Input placeholder="Location" defaultValue={section.content.location} />
                <Input placeholder="Website" defaultValue={section.content.website} />
              </div>
            )}

            {section.type === "experience" && (
              <div className="space-y-4">
                {section.content.map((exp: any, index: number) => (
                  <Card key={exp.id} className="rounded-lg">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input placeholder="Company" defaultValue={exp.company} />
                        <Input placeholder="Position" defaultValue={exp.position} />
                        <Input placeholder="Start Date" defaultValue={exp.startDate} />
                        <Input placeholder="End Date" defaultValue={exp.endDate} />
                      </div>
                      <Textarea
                        placeholder="Job description (one bullet point per line)"
                        defaultValue={exp.description.join("\n")}
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" size="sm" className="w-full rounded-lg bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            )}

            {section.type === "skills" && (
              <div className="space-y-4">
                {Object.entries(section.content).map(([category, skills]) => (
                  <div key={category} className="flex items-center gap-4">
                    <Input placeholder="Category" defaultValue={category} className="w-32" />
                    <Input
                      placeholder="Skills (comma separated)"
                      defaultValue={(skills as string[]).join(", ")}
                      className="flex-1"
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full rounded-lg bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill Category
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full rounded-xl py-6 border-dashed bg-transparent">
        <Plus className="h-4 w-4 mr-2" />
        Add New Section
      </Button>
    </div>
  )

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No file selected</h3>
          <p className="text-muted-foreground">Select a resume from the explorer to start editing</p>
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
            <GitBranch className="h-3 w-3" />
            <span>v1.5</span>
            <Badge variant="outline" className="rounded-full">
              <Clock className="h-2 w-2 mr-1" />
              Auto-saved
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-lg bg-transparent">
            <Save className="h-4 w-4 mr-2" />
            Save
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
