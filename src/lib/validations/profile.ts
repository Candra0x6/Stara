    import { z } from 'zod'

// Profile Setup Status enum validation
export const ProfileSetupStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS', 
  'COMPLETED'
])

// Education entry schema
export const EducationEntrySchema = z.object({
  degree: z.string().optional(),
  institution: z.string().optional(), 
  year: z.string().optional(),
  description: z.string().optional(),
})

// Experience entry schema  
export const ExperienceEntrySchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  duration: z.string().optional(), 
  description: z.string().optional(),
})

// Certification entry schema
export const CertificationEntrySchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().url().optional(),
})

// Base profile setup schema with all fields
export const ProfileSetupSchema = z.object({
  // Progress tracking
  status: ProfileSetupStatusSchema.optional(),
  currentStep: z.number().int().min(1).max(6).optional(),
  completedSteps: z.array(z.number().int()).optional(),
  
  // Basic Information (Step 1)
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  preferredName: z.string().optional(),
  location: z.string().min(2, 'Location is required').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  
  // Disability Profile (Step 2)
  disabilityTypes: z.array(z.string()).optional(),
  supportNeeds: z.string().optional(),
  assistiveTech: z.array(z.string()).optional(),
  accommodations: z.string().optional(),
  
  // Skills & Work Preferences (Step 3)
  softSkills: z.array(z.string()).optional(),
  hardSkills: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  workArrangement: z.string().optional(),
  
  // Education & Experience (Step 4)
  education: z.array(EducationEntrySchema).optional(),
  experience: z.array(ExperienceEntrySchema).optional(),
  
  // Documents (Step 5)
  resumeUrl: z.string().optional(),
  certificationUrls: z.array(z.string()).optional(),
  certifications: z.array(CertificationEntrySchema).optional(),
  
  // Preview & Additional Info (Step 6)
  customSummary: z.string().optional(),
  additionalInfo: z.string().optional(),
})

// Create profile setup schema (for POST requests)
export const CreateProfileSetupSchema = ProfileSetupSchema.extend({
  userId: z.string().cuid('Invalid user ID format')
})

// Update profile setup schema (for PUT/PATCH requests)
export const UpdateProfileSetupSchema = ProfileSetupSchema.partial()

// Step-specific validation schemas
export const Step1Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  preferredName: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

export const Step2Schema = z.object({
  disabilityTypes: z.array(z.string()).min(1, 'Please select at least one disability type'),
  supportNeeds: z.string().optional(),
  assistiveTech: z.array(z.string()).optional(),
  accommodations: z.string().optional(),
})

export const Step3Schema = z.object({
  softSkills: z.array(z.string()).min(1, 'Please select at least one soft skill'),
  hardSkills: z.array(z.string()).min(1, 'Please select at least one hard skill'),
  industries: z.array(z.string()).min(1, 'Please select at least one industry'),
  workArrangement: z.string().min(1, 'Please select your preferred work arrangement'),
})

export const Step4Schema = z.object({
  education: z.array(EducationEntrySchema).optional(),
  experience: z.array(ExperienceEntrySchema).optional(),
})

export const Step5Schema = z.object({
  resumeUrl: z.string().optional(),
  certificationUrls: z.array(z.string()).optional(),
  certifications: z.array(CertificationEntrySchema).optional(),
})

export const Step6Schema = z.object({
  customSummary: z.string().optional(),
  additionalInfo: z.string().optional(),
})

// Validate specific step data
export const validateStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return Step1Schema.parse(data)
    case 2:
      return Step2Schema.parse(data)
    case 3:
      return Step3Schema.parse(data)
    case 4:
      return Step4Schema.parse(data)
    case 5:
      return Step5Schema.parse(data)
    case 6:
      return Step6Schema.parse(data)
    default:
      throw new Error(`Invalid step: ${step}`)
  }
}

// Query parameters schema for GET requests
export const ProfileSetupQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  status: ProfileSetupStatusSchema.optional(),
  includeCompleted: z.string().transform(val => val === 'true').optional(),
})

// Response schemas
export const ProfileSetupResponseSchema = ProfileSetupSchema.extend({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
})

export const ProfileSetupListResponseSchema = z.object({
  profiles: z.array(ProfileSetupResponseSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

// Type exports
export type ProfileSetup = z.infer<typeof ProfileSetupSchema>
export type CreateProfileSetup = z.infer<typeof CreateProfileSetupSchema>
export type UpdateProfileSetup = z.infer<typeof UpdateProfileSetupSchema>
export type ProfileSetupResponse = z.infer<typeof ProfileSetupResponseSchema>
export type ProfileSetupListResponse = z.infer<typeof ProfileSetupListResponseSchema>
export type EducationEntry = z.infer<typeof EducationEntrySchema>
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>
export type ProfileSetupQuery = z.infer<typeof ProfileSetupQuerySchema>
