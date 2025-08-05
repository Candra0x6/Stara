import { z } from "zod"

// Enums
export const WorkTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME", 
  "CONTRACT",
  "FREELANCE",
  "REMOTE",
  "HYBRID",
  "ON_SITE"
])

export const ExperienceLevelSchema = z.enum([
  "ENTRY_LEVEL",
  "JUNIOR", 
  "MID_LEVEL",
  "SENIOR",
  "LEAD",
  "EXECUTIVE"
])

export const JobStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "PAUSED", 
  "CLOSED",
  "EXPIRED"
])

export const AccommodationTypeSchema = z.enum([
  "VISUAL",
  "HEARING",
  "MOBILITY",
  "COGNITIVE", 
  "MOTOR",
  "SOCIAL",
  "SENSORY",
  "COMMUNICATION",
  "LEARNING",
  "MENTAL_HEALTH"
])

export const CompanySizeSchema = z.enum([
  "STARTUP",
  "SMALL",
  "MEDIUM",
  "LARGE",
  "ENTERPRISE"
])

export const ApplicationStatusSchema = z.enum([
  "PENDING",
  "REVIEWING",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "OFFER_EXTENDED", 
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN"
])

// Company validation schemas
export const CreateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  size: CompanySizeSchema.optional(),
  industry: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  culture: z.string().optional(),
  values: z.array(z.string()).default([]),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal(""))
})

export const UpdateCompanySchema = CreateCompanySchema.partial()

// Job validation schemas
export const CreateJobSchema = z.object({
  title: z.string().min(1, "Job title is required").max(255),
  description: z.string().min(1, "Job description is required"),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  companyId: z.string().cuid("Invalid company ID"),
  location: z.string().min(1, "Location is required").max(255),
  workType: WorkTypeSchema,
  isRemote: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  experience: ExperienceLevelSchema,
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryCurrency: z.string().length(3).default("USD"),
  accommodations: z.array(AccommodationTypeSchema).default([]),
  accommodationDetails: z.string().optional(),
  applicationProcess: z.array(z.string()).default([]),
  applicationDeadline: z.string().datetime().optional(),
  status: JobStatusSchema.default("DRAFT"),
  isActive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional()
}).refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMin <= data.salaryMax
    }
    return true
  },
  {
    message: "Minimum salary must be less than or equal to maximum salary",
    path: ["salaryMin"]
  }
)

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  id: z.string().cuid("Invalid job ID")
})

export const JobQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  workType: z.array(WorkTypeSchema).optional(),
  experience: z.array(ExperienceLevelSchema).optional(),
  accommodations: z.array(AccommodationTypeSchema).optional(),
  location: z.string().optional(),
  companyId: z.string().cuid().optional(),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  isRemote: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().default(true),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "salaryMin", "salaryMax"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

// Job Application validation schemas
export const CreateJobApplicationSchema = z.object({
  jobId: z.string().cuid("Invalid job ID"),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional().refine((val) => {
    if (!val || val === "") return true
    
    // Allow file paths/identifiers (like your file system paths)
    if (val.includes('/') || val.includes('\\')) return true
    
    // Allow URLs
    try {
      new URL(val)
      return true
    } catch {
      // If it's not a URL, check if it's a valid string identifier
      return val.length > 0 && val.length <= 500
    }
  }, "Invalid resume reference format"),
  customAnswers: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).default([])
})

export const UpdateJobApplicationSchema = z.object({
  id: z.string().cuid("Invalid application ID"),
  status: ApplicationStatusSchema.optional(),
  employerNotes: z.string().optional(),
  interviewAt: z.string().datetime().optional()
})

// Saved Job validation schemas
export const CreateSavedJobSchema = z.object({
  jobId: z.string().cuid("Invalid job ID")
})

// Response types
export type CreateJobRequest = z.infer<typeof CreateJobSchema>
export type UpdateJobRequest = z.infer<typeof UpdateJobSchema>
export type JobQueryRequest = z.infer<typeof JobQuerySchema>
export type CreateCompanyRequest = z.infer<typeof CreateCompanySchema>
export type UpdateCompanyRequest = z.infer<typeof UpdateCompanySchema>
export type CreateJobApplicationRequest = z.infer<typeof CreateJobApplicationSchema>
export type UpdateJobApplicationRequest = z.infer<typeof UpdateJobApplicationSchema>
export type CreateSavedJobRequest = z.infer<typeof CreateSavedJobSchema>

// Additional utility schemas
export const CompanyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  industry: z.string().optional(),
  size: CompanySizeSchema.optional(),
  location: z.string().optional(),
  isAccessibilityFocused: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt", "jobCount"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc")
})

export const JobApplicationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: ApplicationStatusSchema.optional(),
  jobId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  sortBy: z.enum(["appliedAt", "updatedAt", "status"]).default("appliedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

export const SavedJobQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  userId: z.string().cuid().optional(),
  sortBy: z.enum(["createdAt", "jobTitle", "companyName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

// File upload validation
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default([
    "image/jpeg",
    "image/png", 
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ])
})

export type CompanyQueryRequest = z.infer<typeof CompanyQuerySchema>
export type JobApplicationQueryRequest = z.infer<typeof JobApplicationQuerySchema>
export type SavedJobQueryRequest = z.infer<typeof SavedJobQuerySchema>
export type FileUploadRequest = z.infer<typeof FileUploadSchema>
