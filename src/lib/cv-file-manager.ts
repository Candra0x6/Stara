// File management utilities for CV Editor
import { toast } from "sonner"

export interface CVSection {
  id: string
  type: "personal" | "experience" | "education" | "skills" | "projects" | "custom"
  title: string
  content: any
  order: number
}

export interface CVFile {
  id: string
  name: string
  data: CVSection[]
  lastModified: Date
  versions: number
  type: "resume" | "template" | "component"
}

// Mock database for CV files
export const mockCVDatabase: { [key: string]: CVFile } = {
  "frontend-cv": {
    id: "frontend-cv",
    name: "Frontend_Developer_CV.cv",
    type: "resume",
    lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    versions: 5,
    data: [
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
        ],
      },
      {
        id: "skills",
        type: "skills",
        title: "Technical Skills",
        order: 3,
        content: {
          languages: ["JavaScript", "TypeScript", "HTML", "CSS"],
          frameworks: ["React", "Next.js", "Vue.js", "Tailwind CSS"],
          tools: ["Git", "Webpack", "Figma", "Jest"],
          other: ["Accessibility", "Performance Optimization", "SEO"],
        },
      },
    ],
  },
  "fullstack-cv": {
    id: "fullstack-cv",
    name: "Fullstack_Engineer_CV.cv",
    type: "resume",
    lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    versions: 3,
    data: [
      {
        id: "personal",
        type: "personal",
        title: "Personal Information",
        order: 1,
        content: {
          name: "Sarah Wilson",
          title: "Full Stack Engineer",
          email: "sarah.wilson@email.com",
          phone: "+1 (555) 987-6543",
          location: "Seattle, WA",
          website: "sarahwilson.dev",
          linkedin: "linkedin.com/in/sarahwilson",
          github: "github.com/sarahwilson",
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
            company: "InnovateTech",
            position: "Full Stack Engineer",
            location: "Seattle, WA",
            startDate: "Mar 2021",
            endDate: "Present",
            description: [
              "Built end-to-end web applications using React and Node.js",
              "Designed and implemented RESTful APIs serving 1M+ requests daily",
              "Optimized database queries reducing response time by 60%",
              "Led migration to microservices architecture",
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
          frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
          backend: ["Node.js", "Express", "Python", "Django"],
          databases: ["PostgreSQL", "MongoDB", "Redis"],
          cloud: ["AWS", "Docker", "Kubernetes"],
        },
      },
    ],
  },
  "senior-cv": {
    id: "senior-cv",
    name: "Senior_Developer_CV.cv",
    type: "resume",
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    versions: 8,
    data: [
      {
        id: "personal",
        type: "personal",
        title: "Personal Information",
        order: 1,
        content: {
          name: "Michael Chen",
          title: "Senior Software Architect",
          email: "michael.chen@email.com",
          phone: "+1 (555) 456-7890",
          location: "Austin, TX",
          website: "michaelchen.dev",
          linkedin: "linkedin.com/in/michaelchen",
          github: "github.com/michaelchen",
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
            company: "Enterprise Solutions Inc.",
            position: "Senior Software Architect",
            location: "Austin, TX",
            startDate: "Jun 2019",
            endDate: "Present",
            description: [
              "Architected scalable systems handling 10M+ daily active users",
              "Led team of 12 engineers across multiple product lines",
              "Implemented CI/CD pipelines reducing deployment time by 80%",
              "Designed microservices architecture improving system reliability",
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
          architecture: ["Microservices", "Event-Driven", "Serverless"],
          languages: ["Java", "Python", "Go", "TypeScript"],
          platforms: ["AWS", "GCP", "Kubernetes", "Docker"],
          leadership: ["Team Management", "Technical Strategy", "Mentoring"],
        },
      },
    ],
  },
}

// File operations
export class CVFileManager {
  static async loadFile(fileId: string): Promise<CVFile | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const file = mockCVDatabase[fileId]
    if (!file) {
      throw new Error(`File not found: ${fileId}`)
    }
    
    return { ...file, data: JSON.parse(JSON.stringify(file.data)) }
  }

  static async saveFile(fileId: string, data: CVSection[]): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (mockCVDatabase[fileId]) {
      mockCVDatabase[fileId].data = JSON.parse(JSON.stringify(data))
      mockCVDatabase[fileId].lastModified = new Date()
      mockCVDatabase[fileId].versions += 1
    } else {
      throw new Error(`File not found: ${fileId}`)
    }
  }

  static async createFile(name: string, type: "resume" | "template" | "component", data?: CVSection[]): Promise<CVFile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const id = `new_${Date.now()}`
    const newFile: CVFile = {
      id,
      name,
      type,
      lastModified: new Date(),
      versions: 1,
      data: data || this.getDefaultCVData(),
    }
    
    mockCVDatabase[id] = newFile
    return { ...newFile }
  }

  static async deleteFile(fileId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (mockCVDatabase[fileId]) {
      delete mockCVDatabase[fileId]
    } else {
      throw new Error(`File not found: ${fileId}`)
    }
  }

  static async duplicateFile(fileId: string, newName: string): Promise<CVFile> {
    const originalFile = await this.loadFile(fileId)
    if (!originalFile) {
      throw new Error(`File not found: ${fileId}`)
    }
    
    return this.createFile(newName, originalFile.type, originalFile.data)
  }

  static async renameFile(fileId: string, newName: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (mockCVDatabase[fileId]) {
      mockCVDatabase[fileId].name = newName
      mockCVDatabase[fileId].lastModified = new Date()
    } else {
      throw new Error(`File not found: ${fileId}`)
    }
  }

  static exportFile(file: CVFile): void {
    const exportData = {
      ...file,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file.name.replace(/\.[^.]+$/, '')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  static async importFile(fileContent: string, fileName: string): Promise<CVFile> {
    try {
      const parsedData = JSON.parse(fileContent)
      
      // Validate the data structure
      if (!parsedData.data || !Array.isArray(parsedData.data)) {
        throw new Error("Invalid file format")
      }
      
      return this.createFile(fileName, "resume", parsedData.data)
    } catch (error) {
      throw new Error("Failed to parse JSON file")
    }
  }

  static getDefaultCVData(): CVSection[] {
    return [
      {
        id: "personal",
        type: "personal",
        title: "Personal Information",
        order: 1,
        content: {
          name: "",
          title: "",
          email: "",
          phone: "",
          location: "",
          website: "",
          linkedin: "",
          github: "",
        },
      },
      {
        id: "experience",
        type: "experience",
        title: "Work Experience",
        order: 2,
        content: [],
      },
      {
        id: "skills",
        type: "skills",
        title: "Technical Skills",
        order: 3,
        content: {},
      },
    ]
  }

  static getAllFiles(): CVFile[] {
    return Object.values(mockCVDatabase)
  }
}
