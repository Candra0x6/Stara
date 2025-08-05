import { AccommodationType, Company, CompanySize, ExperienceLevel, Job, JobApplication, JobStatus, SavedJob, WorkType } from "@prisma/client"



export interface JobComplete extends Omit<Job, 'workType'> {
  company: Company
  experienceLevel: ExperienceLevel
  workType: WorkType[]
  accommodations: AccommodationType[]
  status : JobStatus
  application : JobApplication[]
  savedBy: SavedJob[]
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
