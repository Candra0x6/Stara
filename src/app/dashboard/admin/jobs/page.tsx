'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { JobList } from '@/components/job-list'
import { JobModal } from '@/components/job-modal'
import { useJobManagement } from '@/hooks/use-companies'
import { useCompanies } from '@/hooks/use-companies'
import { useJobs } from '@/hooks/use-jobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Users, TrendingUp, Clock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Job } from '@prisma/client'

export default function AdminJobsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const { createJob, updateJob, deleteJob, loading } = useJobManagement()
  const { companies } = useCompanies()
  const { fetchJobs } = useJobs()

  // Mock stats - in real app these would come from API
  const stats = {
    totalJobs: 284,
    activeJobs: 267,
    newThisWeek: 15,
    pendingReview: 8
  }

  const handleCreateJob = () => {
    setSelectedJob(null)
    setIsModalOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleSaveJob = async (data: any) => {
    try {
      if (selectedJob) {
        await updateJob(selectedJob.id, data)
      } else {
        await createJob(data)
      }
      // Refresh the job list
      fetchJobs()
    } catch (error) {
      throw error
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId)
      // Refresh the job list
      fetchJobs()
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Job Management</h1>
            <p className="text-muted-foreground">
              Manage job postings and applications on the platform
            </p>
          </div>
          <Button onClick={handleCreateJob} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Job</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newThisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeJobs / stats.totalJobs) * 100).toFixed(1)}% active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                Jobs posted this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility Friendly</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <JobList
            onCreateJob={handleCreateJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            showActions={true}
            isManagementView={true}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Active Jobs Filter</h3>
            <p className="text-muted-foreground">
              This would show only currently active job postings.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pending Review</h3>
            <p className="text-muted-foreground">
              This would show jobs awaiting admin approval.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accessibility Friendly Jobs</h3>
            <p className="text-muted-foreground">
              This would show only accessibility-friendly job postings.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Modal */}
      <JobModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
        companies={companies}
        onSave={handleSaveJob}
      />
    </div>
  )
}
