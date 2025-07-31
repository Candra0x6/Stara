import { SavedJobsList } from '@/components/saved-jobs-list'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saved Jobs | Inclusive Employment Platform',
  description: 'View and manage your saved job opportunities',
}

export default function SavedJobsPage() {
  return <SavedJobsList />
}
