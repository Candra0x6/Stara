'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CompanyList } from '@/components/company-list'
import { CompanyModal } from '@/components/company-modal'
import { useCompanyActions, Company, CreateCompanyData, UpdateCompanyData } from '@/hooks/use-companies'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, TrendingUp, Star, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCompaniesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const { createCompany, updateCompany, deleteCompany, uploadLogo, loading } = useCompanyActions()

  // Mock stats - in real app these would come from API
  const stats = {
    totalCompanies: 156,
    activeCompanies: 142,
    newThisMonth: 8,
    averageRating: 4.2
  }

  const handleCreateCompany = () => {
    setSelectedCompany(null)
    setIsModalOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsModalOpen(true)
  }

  const handleSaveCompany = async (data: CreateCompanyData | UpdateCompanyData) => {
    try {
      if (selectedCompany) {
        await updateCompany(selectedCompany.id, data)
      } else {
        await createCompany(data as CreateCompanyData)
      }
    } catch (error) {
      throw error
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await deleteCompany(companyId)
    } catch (error) {
      throw error
    }
  }

  const handleUploadLogo = async (file: File): Promise<string> => {
    if (!selectedCompany) {
      throw new Error('No company selected')
    }
    
    const result = await uploadLogo(selectedCompany.id, file)
    return result.url
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
            <h1 className="text-4xl font-bold">Company Management</h1>
            <p className="text-muted-foreground">
              Manage companies and their information on the platform
            </p>
          </div>
          <Button onClick={handleCreateCompany} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newThisMonth} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCompanies}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeCompanies / stats.totalCompanies) * 100).toFixed(1)}% active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Companies added this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Accessibility rating
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Companies</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility Focused</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <CompanyList
            onCreateCompany={handleCreateCompany}
            onEditCompany={handleEditCompany}
            onDeleteCompany={handleDeleteCompany}
            showActions={true}
            isManagementView={true}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Active Companies Filter</h3>
            <p className="text-muted-foreground">
              This would show only companies with active job postings.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accessibility Focused Companies</h3>
            <p className="text-muted-foreground">
              This would show only companies marked as accessibility focused.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Company Modal */}
      <CompanyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={selectedCompany}
        onSave={handleSaveCompany}
        onUploadLogo={selectedCompany ? handleUploadLogo : undefined}
      />
    </div>
  )
}
