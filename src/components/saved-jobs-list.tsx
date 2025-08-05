'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heart, Briefcase } from 'lucide-react'
import Link from 'next/link'
import JobCard from './job-card'
import { Job } from '@prisma/client'

export function SavedJobsList() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSavedJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs/saved')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch saved jobs: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSavedJobs(data.savedJobs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved jobs')
      setSavedJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const handleJobUnsaved = () => {
    fetchSavedJobs() // Refresh the list
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={fetchSavedJobs} 
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 accessibility-text click-assist" role="main" aria-label="Saved Jobs">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">Saved Jobs</h1>
          </div>
          <p className="text-muted-foreground">
            Jobs you've saved for later review
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : savedJobs.length === 0 ? (
            // No saved jobs
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start saving jobs that interest you to review them later
                    </p>
                    <Button asChild>
                      <Link href="/jobs">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Browse Jobs
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Saved job cards
            savedJobs.map((job) => (
              <JobCard
                key={job.id}
                // @ts-ignore
                job={job}
                // @ts-ignore
                onJobSaved={handleJobUnsaved}
                isSaved={true}
                showCompany={true}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {savedJobs.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You have {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" asChild>
              <Link href="/jobs">
                Browse More Jobs
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
