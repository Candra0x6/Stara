'use client'

import { useState } from 'react'
import { useJob, useJobActions } from '@/hooks/use-jobs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { JobApplicationModal } from '@/components/job-application-modal'
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Heart,
  HeartIcon,
  Eye,
  Users,
  Accessibility,
  Calendar,
  ExternalLink,
  Share,
  Flag,
  ArrowLeft
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface JobDetailPageProps {
  jobId: string
}

const accommodationIcons = {
  FLEXIBLE_HOURS: Clock,
  REMOTE_WORK: Building,
  WHEELCHAIR_ACCESS: Accessibility,
  SCREEN_READER: Eye,
  SIGN_LANGUAGE: Users,
  QUIET_WORKSPACE: Building,
  ERGONOMIC_EQUIPMENT: Building,
  MODIFIED_DUTIES: Building,
  EXTENDED_BREAKS: Clock,
  TRANSPORTATION_ASSISTANCE: MapPin
}

const accommodationLabels = {
  FLEXIBLE_HOURS: 'Flexible Hours',
  REMOTE_WORK: 'Remote Work',
  WHEELCHAIR_ACCESS: 'Wheelchair Access',
  SCREEN_READER: 'Screen Reader Support',
  SIGN_LANGUAGE: 'Sign Language',
  QUIET_WORKSPACE: 'Quiet Workspace',
  ERGONOMIC_EQUIPMENT: 'Ergonomic Equipment',
  MODIFIED_DUTIES: 'Modified Duties',
  EXTENDED_BREAKS: 'Extended Breaks',
  TRANSPORTATION_ASSISTANCE: 'Transportation Assistance'
}

export function JobDetailPage({ jobId }: JobDetailPageProps) {
  const [applicationModalOpen, setApplicationModalOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const { job, loading, error, refetch } = useJob(jobId)
  const { saveJob, unsaveJob, loading: actionLoading } = useJobActions()
  const router = useRouter()

  const handleSaveToggle = async () => {
    if (!job) return

    try {
      if (saved) {
        await unsaveJob(job.id)
        setSaved(false)
        toast.success('Job removed from saved jobs')
      } else {
        await saveJob(job.id)
        setSaved(true)
        toast.success('Job saved successfully')
      }
    } catch (error) {
      toast.error('Failed to update saved job')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job opportunity: ${job?.title} at ${job?.company?.name}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Job link copied to clipboard')
    }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Skeletons */}
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Job not found'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={refetch}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const salary = formatSalary(job.salaryMin as number, job.salaryMax as number, job.salaryCurrency)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>

                {job.company && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Building className="h-4 w-4" />
                    <Link
                      href={`/companies/${job.company.id}`}
                      className="hover:text-primary hover:underline text-lg"
                    >
                      {job.company.name}
                    </Link>
                    {job.company.website && (
                      <Link
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                    {job.isRemote && <Badge variant="secondary" className="ml-1">Remote</Badge>}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  </div>

                  {salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{salary}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default">
                    {/* @ts-ignore */}
                    {job.workType.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">
                    {job.experience} Level
                  </Badge>

                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{job.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{job.applicationCount} applications</span>
                  </div>
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-1 text-red-600">
                      <Calendar className="h-3 w-3" />
                      <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToggle}
                  disabled={actionLoading}
                >
                  {saved ? (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  ) : (
                    <HeartIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex gap-3">
              <Button
                onClick={() => setApplicationModalOpen(true)}
                className="flex-1 max-w-sm"
              >
                Apply Now
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveToggle}
                disabled={actionLoading}
              >
                {saved ? 'Saved' : 'Save Job'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        {job.responsibilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.responsibilities.map((responsibility: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {job.requirements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((requirement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Preferred Skills */}
        {job.preferredSkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preferred Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        {job.benefits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Accommodations */}
        {job.accommodations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Available Accommodations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* @ts-ignore */}
                {job.accommodations.map((accommodation: keyof typeof accommodationIcons) => {
                  const IconComponent = accommodationIcons[accommodation] || Accessibility
                  return (
                    <div key={accommodation} className="flex items-center gap-3 p-3 border rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <span>{accommodationLabels[accommodation]}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}


        {/* Company Info */}
        {job.company && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                About {job.company.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.company.description && (
                  <p className="text-muted-foreground">{job.company.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {job.company.industry && (
                    <div>
                      <span className="font-semibold">Industry:</span> {job.company.industry}
                    </div>
                  )}
                  {job.company.size && (
                    <div>
                      <span className="font-semibold">Company Size:</span> {job.company.size}
                    </div>
                  )}
                  {job.company.location && (
                    <div>
                      <span className="font-semibold">Location:</span> {job.company.location}
                    </div>
                  )}
                  {job.company.website && (
                    <div>
                      <span className="font-semibold">Website:</span>{' '}
                      <Link
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {job.company.website}
                      </Link>
                    </div>
                  )}
                </div>

                {job.company.values.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Company Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.company.values.map((value: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Apply Section */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Ready to Apply?</h3>
              <p className="text-muted-foreground">
                Join {job.company?.name} and make a difference in an inclusive workplace
              </p>
              <Button
                onClick={() => setApplicationModalOpen(true)}
                size="lg"
                className="w-full max-w-sm"
              >
                Apply for This Position
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Modal */}
      <JobApplicationModal
        job={job}
        open={applicationModalOpen}
        onOpenChange={setApplicationModalOpen}
        onSuccess={() => {
          setApplicationModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}
