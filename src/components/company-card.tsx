'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Icons } from '@/components/ui/icons'
import { Company } from '@/hooks/use-companies'
import { motion } from 'framer-motion'
import { Building2, Globe, MapPin, Users, Heart, Star, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CompanyCardProps {
  company: Company
  onEdit?: (company: Company) => void
  onDelete?: (companyId: string) => void
  showActions?: boolean
  isManagementView?: boolean
}

const sizeMap = {
  'STARTUP': 'Startup (1-10)',
  'SMALL': 'Small (11-50)',
  'MEDIUM': 'Medium (51-200)',
  'LARGE': 'Large (201-1000)',
  'ENTERPRISE': 'Enterprise (1000+)'
}

export function CompanyCard({ 
  company, 
  onEdit, 
  onDelete, 
  showActions = false,
  isManagementView = false 
}: CompanyCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = () => {
    if (isManagementView) {
      router.push(`/admin/companies/${company.id}`)
    } else {
      router.push(`/companies/${company.id}`)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(company)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    
    try {
      await onDelete?.(company.id)
      toast.success('Company deleted successfully')
    } catch (error) {
      toast.error('Failed to delete company')
    } finally {
      setIsDeleting(false)
    }
  }

  const accessibilityRating = company.accessibilityRating || 0
  const jobCount = company._count?.jobs || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="accessibility-text"
      role="article"
      aria-label={`Company: ${company.name}`}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 relative group click-assist">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={company.logo || ''} alt={company.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {company.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {company.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {company.industry && (
                    <Badge variant="secondary" className="text-xs">
                      {company.industry}
                    </Badge>
                  )}
                  {company.isAccessibilityFocused && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      Accessibility Focused
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Company</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{company.name}"? This action cannot be undone and will also delete all associated jobs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-4" onClick={handleView}>
          {company.description && (
            <CardDescription className="line-clamp-2 mb-4">
              {company.description}
            </CardDescription>
          )}

          <div className="space-y-3">
            {/* Location and Size */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                {company.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{sizeMap[company.size as keyof typeof sizeMap] || company.size}</span>
                  </div>
                )}
              </div>
              {company.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  <span className="text-blue-600 hover:underline">Website</span>
                </div>
              )}
            </div>

            {/* Accessibility Rating */}
            {accessibilityRating > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Accessibility Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{accessibilityRating.toFixed(1)}/5.0</span>
                  </div>
                </div>
                <Progress value={(accessibilityRating / 5) * 100} className="h-2" />
              </div>
            )}

            {/* Job Count */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-1">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {jobCount} {jobCount === 1 ? 'job' : 'jobs'} available
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {new Date(company.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={handleView}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
