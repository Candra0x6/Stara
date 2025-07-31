'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Job, WorkType, ExperienceLevel, JobStatus } from '@/types/job'
import { Company } from '@/hooks/use-companies'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

// Form schema that matches the Prisma schema
const jobFormSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(255),
  description: z.string().min(1, 'Job description is required'),
  location: z.string().min(1, 'Location is required').max(255),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional().default('USD'),
  workType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'REMOTE', 'HYBRID', 'ON_SITE']),
  experience: z.enum(['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  isRemote: z.boolean(),
  isHybrid: z.boolean(),
  applicationDeadline: z.string().optional(),
  companyId: z.string().min(1, 'Company is required'),
  accommodationDetails: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'EXPIRED']).default('DRAFT'),
  isActive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
})

type JobFormData = z.infer<typeof jobFormSchema>

interface JobModalProps {
  open: boolean
  onClose: () => void
  job?: Job | null
  companies: Company[]
  onSave: (data: any) => Promise<void>
}

const workTypes = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ON_SITE', label: 'On Site' }
]

const experienceLevels = [
  { value: 'ENTRY_LEVEL', label: 'Entry Level' },
  { value: 'JUNIOR', label: 'Junior Level' },
  { value: 'MID_LEVEL', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' }
]

const accommodationTypes = [
  { value: 'VISUAL', label: 'Visual Accommodations' },
  { value: 'HEARING', label: 'Hearing Accommodations' },
  { value: 'MOBILITY', label: 'Mobility Accommodations' },
  { value: 'COGNITIVE', label: 'Cognitive Accommodations' },
  { value: 'MOTOR', label: 'Motor Accommodations' },
  { value: 'SOCIAL', label: 'Social Accommodations' },
  { value: 'SENSORY', label: 'Sensory Accommodations' },
  { value: 'COMMUNICATION', label: 'Communication Accommodations' },
  { value: 'LEARNING', label: 'Learning Accommodations' },
  { value: 'MENTAL_HEALTH', label: 'Mental Health Accommodations' }
]

const jobStatuses = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'EXPIRED', label: 'Expired' }
]

export function JobModal({
  open,
  onClose,
  job,
  companies,
  onSave
}: JobModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // State for array fields
  const [newRequirement, setNewRequirement] = useState('')
  const [requirements, setRequirements] = useState<string[]>(job?.requirements || [])
  const [newResponsibility, setNewResponsibility] = useState('')
  const [responsibilities, setResponsibilities] = useState<string[]>(job?.responsibilities || [])
  const [newSkill, setNewSkill] = useState('')
  const [preferredSkills, setPreferredSkills] = useState<string[]>(job?.preferredSkills || [])
  const [newBenefit, setNewBenefit] = useState('')
  const [benefits, setBenefits] = useState<string[]>(job?.benefits || [])
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([])
  const [applicationProcess, setApplicationProcess] = useState<string[]>(job?.applicationProcess || [])
  const [newApplicationStep, setNewApplicationStep] = useState('')

  const isEditing = !!job

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      location: job?.location || '',
      salaryMin: job?.salaryMin || undefined,
      salaryMax: job?.salaryMax || undefined,
      salaryCurrency: job?.salaryCurrency || 'USD',
      workType: (job?.workType as WorkType) || 'FULL_TIME',
      experience: (job?.experience as ExperienceLevel) || 'ENTRY_LEVEL',
      isRemote: job?.isRemote || false,
      isHybrid: job?.isHybrid || false,
      applicationDeadline: job?.applicationDeadline 
        ? new Date(job.applicationDeadline).toISOString().split('T')[0] 
        : '',
      companyId: job?.companyId || '',
      accommodationDetails: job?.accommodationDetails || '',
      status: (job?.status as JobStatus) || 'DRAFT',
      isActive: job?.isActive || false,
      isFeatured: job?.isFeatured || false,
      metaTitle: job?.metaTitle || '',
      metaDescription: job?.metaDescription || ''
    },
  })

  // Helper functions for array management
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()])
      setNewResponsibility('')
    }
  }

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setPreferredSkills([...preferredSkills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setPreferredSkills(preferredSkills.filter((_, i) => i !== index))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()])
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  const addApplicationStep = () => {
    if (newApplicationStep.trim()) {
      setApplicationProcess([...applicationProcess, newApplicationStep.trim()])
      setNewApplicationStep('')
    }
  }

  const removeApplicationStep = (index: number) => {
    setApplicationProcess(applicationProcess.filter((_, i) => i !== index))
  }

  const handleAccommodationChange = (accommodation: string, checked: boolean) => {
    setSelectedAccommodations(prev => 
      checked
        ? [...prev, accommodation]
        : prev.filter(a => a !== accommodation)
    )
  }

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true)
    
    try {
      const submitData = {
        title: data.title,
        description: data.description,
        responsibilities,
        requirements,
        preferredSkills,
        benefits,
        companyId: data.companyId,
        location: data.location,
        workType: data.workType,
        isRemote: data.isRemote,
        isHybrid: data.isHybrid,
        experience: data.experience,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryCurrency: data.salaryCurrency,
        accommodations: selectedAccommodations,
        accommodationDetails: data.accommodationDetails,
        applicationProcess,
        applicationDeadline: data.applicationDeadline 
          ? new Date(data.applicationDeadline).toISOString()
          : undefined,
        status: data.status,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription
      }
      
      console.log('Submitting job data:', submitData)
      await onSave(submitData)
      toast.success(isEditing ? 'Job updated successfully' : 'Job created successfully')
      onClose()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(isEditing ? 'Failed to update job' : 'Failed to create job')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Job' : 'Add New Job'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the job posting details below.' 
              : 'Fill in the details to create a new job posting.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company */}
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Type */}
              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience Level */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary Min */}
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 70000" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Optional minimum salary</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary Max */}
              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 90000" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Optional maximum salary</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary Currency */}
              <FormField
                control={form.control}
                name="salaryCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Application Deadline */}
              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Optional deadline for applications</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remote Work */}
              <FormField
                control={form.control}
                name="isRemote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Remote Work</FormLabel>
                      <FormDescription>
                        This position allows remote work
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Hybrid Work */}
              <FormField
                control={form.control}
                name="isHybrid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Hybrid Work</FormLabel>
                      <FormDescription>
                        This position supports hybrid work arrangement
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Job Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be doing..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirements */}
            <div className="space-y-4">
              <Label>Job Requirements *</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a requirement..."
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {requirements.length > 0 && (
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{req}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Responsibilities */}
            <div className="space-y-4">
              <FormLabel>Key Responsibilities</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a key responsibility..."
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                />
                <Button type="button" onClick={addResponsibility} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {responsibilities.length > 0 && (
                <div className="space-y-2">
                  {responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{resp}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResponsibility(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            <div className="space-y-4">
              <FormLabel>Preferred Skills</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a preferred skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {preferredSkills.length > 0 && (
                <div className="space-y-2">
                  {preferredSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{skill}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <FormLabel>Benefits & Perks</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a benefit or perk..."
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {benefits.length > 0 && (
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{benefit}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application Process */}
            <div className="space-y-4">
              <FormLabel>Application Process Steps</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an application step..."
                  value={newApplicationStep}
                  onChange={(e) => setNewApplicationStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addApplicationStep())}
                />
                <Button type="button" onClick={addApplicationStep} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {applicationProcess.length > 0 && (
                <div className="space-y-2">
                  {applicationProcess.map((step, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{step}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeApplicationStep(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accommodation Details */}
            <FormField
              control={form.control}
              name="accommodationDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accommodation Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe specific accommodations or accessibility features available..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional detailed information about accommodations provided
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Accommodations */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Accessibility & Accommodations</h4>

              <div className="space-y-3">
                <Label>Accommodation Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accommodationTypes.map((accommodation) => (
                    <div key={accommodation.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={accommodation.value}
                        checked={selectedAccommodations.includes(accommodation.value)}
                        onCheckedChange={(checked) => 
                          handleAccommodationChange(accommodation.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={accommodation.value} className="text-sm">
                        {accommodation.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedAccommodations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedAccommodations.map((accommodation) => {
                      const accommodationType = accommodationTypes.find(a => a.value === accommodation)
                      return (
                        <Badge key={accommodation} variant="secondary">
                          {accommodationType?.label || accommodation}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Job Status and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
              <h4 className="md:col-span-2 font-medium">Job Status & Settings</h4>
              
              {/* Job Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Job</FormLabel>
                      <FormDescription>
                        Job is actively accepting applications
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Is Featured */}
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured Job</FormLabel>
                      <FormDescription>
                        Job will be highlighted on job boards
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* SEO and Metadata */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">SEO & Metadata</h4>
              
              {/* Meta Title */}
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SEO title for this job posting..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional SEO title (will use job title if not provided)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meta Description */}
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="SEO description for this job posting..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional SEO description for search engines
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
