import { CompanyList } from '@/components/company-list'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Companies | Inclusive Employment Platform',
  description: 'Discover inclusive employers committed to accessibility, diversity, and creating accommodating workplaces for all employees.',
  keywords: ['companies', 'inclusive employers', 'accessibility', 'diversity', 'accommodating workplaces']
}

export default function CompaniesPage() {
  return <CompanyList />
}
