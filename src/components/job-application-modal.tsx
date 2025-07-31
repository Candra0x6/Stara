'use client'

import { useState } from 'react'
import { useJobActions } from '@/hooks/use-jobs'
import { Job } from '@/types/job'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Upload, X, Building, MapPin, DollarSign } from 'lucide-react'

interface JobApplicationModalProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function JobApplicationModal({
  job,
  open,
  onOpenChange,
  onSuccess
}: JobApplicationModalProps) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableStartDate: '',
    accommodationNeeds: '',
    resumeUrl: ''
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  
  const { applyToJob, loading } = useJobActions()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'resume')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (!response.ok) {
        throw new Error('Failed to upload resume')
      }

      const { url } = await response.json()
      setFormData(prev => ({ ...prev, resumeUrl: url }))
      setResumeFile(file)
      toast.success('Resume uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload resume')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.resumeUrl) {
      toast.error('Please upload your resume')
      return
    }

    try {
      await applyToJob(job.id, {
        coverLetter: formData.coverLetter || undefined,
        expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : undefined,
        availableStartDate: formData.availableStartDate ? new Date(formData.availableStartDate) : undefined,
        accommodationNeeds: formData.accommodationNeeds || undefined,
        resumeUrl: formData.resumeUrl
      })

      toast.success('Application submitted successfully!')
      onSuccess()
      
      // Reset form
      setFormData({
        coverLetter: '',
        expectedSalary: '',
        availableStartDate: '',
        accommodationNeeds: '',
        resumeUrl: ''
      })
      setResumeFile(null)
    } catch (error) {
      toast.error('Failed to submit application')
    }
  }

  const handleRemoveResume = () => {
    setFormData(prev => ({ ...prev, resumeUrl: '' }))
    setResumeFile(null)
  }

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return null
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`
    }
    if (min) {
      return `From $${min.toLocaleString()} ${currency}`
    }
    if (max) {
      return `Up to $${max.toLocaleString()} ${currency}`
    }
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Position</DialogTitle>
          <DialogDescription>
            Submit your application for this job opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Job Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{job.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {job.company && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{job.company.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
                {job.isRemote && <Badge variant="secondary" className="ml-1">Remote</Badge>}
              </div>
              {salary && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{salary}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Badge variant="outline">{job.workType.replace('_', ' ')}</Badge>
                <Badge variant="outline">{job.experience} Level</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="required">Resume *</Label>
            {!formData.resumeUrl ? (
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your resume or click to browse
                  </p>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleResumeUpload(file)
                    }}
                    disabled={uploadingResume}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, or DOCX up to 10MB
                  </p>
                </div>
                {uploadingResume && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {resumeFile?.name || 'Resume uploaded'}
                  </span>
                  <Badge variant="outline" className="text-xs">Uploaded</Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveResume}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Explain your interest and qualifications for this role
            </p>
          </div>

          {/* Expected Salary */}
          <div className="space-y-2">
            <Label htmlFor="expectedSalary">Expected Salary (USD)</Label>
            <Input
              id="expectedSalary"
              type="number"
              placeholder="e.g., 75000"
              value={formData.expectedSalary}
              onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Your salary expectations for this role
            </p>
          </div>

          {/* Available Start Date */}
          <div className="space-y-2">
            <Label htmlFor="availableStartDate">Available Start Date</Label>
            <Input
              id="availableStartDate"
              type="date"
              value={formData.availableStartDate}
              onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional: When can you start working?
            </p>
          </div>

          {/* Accommodation Needs */}
          <div className="space-y-2">
            <Label htmlFor="accommodationNeeds">Accommodation Needs</Label>
            <Textarea
              id="accommodationNeeds"
              placeholder="Please describe any workplace accommodations you may need..."
              value={formData.accommodationNeeds}
              onChange={(e) => handleInputChange('accommodationNeeds', e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Let us know about any accommodations that would help you succeed in this role
            </p>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              By submitting this application, you consent to the processing of your personal data 
              for recruitment purposes. Your information will be kept confidential and used only 
              for evaluating your candidacy for this position.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || uploadingResume}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingResume || !formData.resumeUrl}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
