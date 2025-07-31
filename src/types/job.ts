export type WorkType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "REMOTE" | "HYBRID" | "ON_SITE"
export type ExperienceLevel = "ENTRY_LEVEL" | "JUNIOR" | "MID_LEVEL" | "SENIOR" | "LEAD" | "EXECUTIVE"
export type AccommodationType = 
  | "VISUAL"
  | "HEARING"
  | "MOBILITY"
  | "COGNITIVE"
  | "MOTOR"
  | "SOCIAL"
  | "SENSORY"
  | "COMMUNICATION"
  | "LEARNING"
  | "MENTAL_HEALTH"

export type JobStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED" | "EXPIRED"
export type ApplicationStatus = "PENDING" | "REVIEWING" | "INTERVIEW_SCHEDULED" | "INTERVIEW_COMPLETED" | "OFFER_EXTENDED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
export type CompanySize = "STARTUP" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE"

export interface Job {
  id: string
  title: string
  slug: string
  description: string
  responsibilities: string[]
  requirements: string[]
  preferredSkills: string[]
  benefits: string[]
  companyId: string
  company?: Company
  location: string
  workType: WorkType
  isRemote: boolean
  isHybrid: boolean
  experience: ExperienceLevel
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  accommodations: AccommodationType[]
  accommodationDetails?: string
  applicationProcess: string[]
  applicationDeadline?: Date
  status: JobStatus
  isActive: boolean
  isFeatured: boolean
  metaTitle?: string
  metaDescription?: string
  viewCount: number
  applicationCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  closedAt?: Date
  applications?: JobApplication[]
  savedBy?: SavedJob[]
}

export interface Company {
  id: string
  name: string
  description?: string
  website?: string
  logo?: string
  size?: CompanySize
  industry?: string
  location?: string
  culture?: string
  values: string[]
  contactEmail?: string
  contactPhone?: string
  linkedinUrl?: string
  twitterUrl?: string
  createdAt: Date
  updatedAt: Date
  jobs?: Job[]
}

export interface JobApplication {
  id: string
  jobId: string
  job?: Job
  userId: string
  status: ApplicationStatus
  appliedAt: Date
  notes?: string
  resumeUrl?: string
  coverLetter?: string
  expectedSalary?: number
  availableStartDate?: Date
  accommodationNeeds?: string
  createdAt: Date
  updatedAt: Date
}

export interface SavedJob {
  id: string
  jobId: string
  job?: Job
  userId: string
  savedAt: Date
}

export interface JobFilters {
  search?: string
  workType?: WorkType[]
  experience?: ExperienceLevel[]
  location?: string
  isRemote?: boolean
  accommodations?: AccommodationType[]
  salaryMin?: number
  salaryMax?: number
  companySize?: CompanySize[]
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'salary' | 'applicationCount' | 'viewCount'
  sortOrder?: 'asc' | 'desc'
}

export interface JobSearchResponse {
  jobs: Job[]
  total: number
  page: number
  limit: number
  totalPages: number
}
