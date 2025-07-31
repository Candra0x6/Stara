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
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Company, CreateCompanyData, UpdateCompanyData } from '@/hooks/use-companies'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  location: z.string().optional(),
  accessibilityRating: z.number().min(0).max(5).optional(),
  isAccessibilityFocused: z.boolean().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyModalProps {
  open: boolean
  onClose: () => void
  company?: Company | null
  onSave: (data: CreateCompanyData | UpdateCompanyData) => Promise<void>
  onUploadLogo?: (file: File) => Promise<string>
}

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Government',
  'Non-profit',
  'Other'
]

const sizeOptions = [
  { value: 'STARTUP', label: 'Startup (1-10)' },
  { value: 'SMALL', label: 'Small (11-50)' },
  { value: 'MEDIUM', label: 'Medium (51-200)' },
  { value: 'LARGE', label: 'Large (201-1000)' },
  { value: 'ENTERPRISE', label: 'Enterprise (1000+)' }
]

export function CompanyModal({
  open,
  onClose,
  company,
  onSave,
  onUploadLogo
}: CompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>(company?.logo || '')
  const [accessibilityRating, setAccessibilityRating] = useState<number[]>([
    company?.accessibilityRating || 0
  ])

  const isEditing = !!company

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      description: company?.description || '',
      website: company?.website || '',
      industry: company?.industry || '',
      size: company?.size as any || undefined,
      location: company?.location || '',
      accessibilityRating: company?.accessibilityRating || 0,
      isAccessibilityFocused: company?.isAccessibilityFocused || false,
    },
  })

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onUploadLogo) return

    try {
      const url = await onUploadLogo(file)
      setLogoPreview(url)
      toast.success('Logo uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload logo')
    }
  }

  const removeLogo = () => {
    setLogoPreview('')
  }

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true)
    
    try {
      const submitData = {
        ...data,
        accessibilityRating: accessibilityRating[0],
        website: data.website || undefined,
      }
      
      await onSave(submitData)
      toast.success(isEditing ? 'Company updated successfully' : 'Company created successfully')
      onClose()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update company' : 'Failed to create company')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Company' : 'Add New Company'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the company information below.' 
              : 'Fill in the details to add a new company to the platform.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label>Company Logo</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={logoPreview} alt="Company logo" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                    {form.watch('name')?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </label>
                    </Button>
                    {logoPreview && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={removeLogo}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Industry */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Size */}
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sizeOptions.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
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
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the company, its mission, and what makes it special..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the company (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Accessibility Features */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Accessibility Features</h4>
              
              <FormField
                control={form.control}
                name="isAccessibilityFocused"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Accessibility Focused Company
                      </FormLabel>
                      <FormDescription>
                        This company specifically focuses on accessibility and inclusion
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

              <div className="space-y-3">
                <Label>Accessibility Rating</Label>
                <div className="px-3">
                  <Slider
                    value={accessibilityRating}
                    onValueChange={setAccessibilityRating}
                    max={5}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>0</span>
                    <span className="font-medium">
                      {accessibilityRating[0].toFixed(1)} / 5.0
                    </span>
                    <span>5</span>
                  </div>
                </div>
                <FormDescription>
                  Rate the company's accessibility features and inclusivity (0-5)
                </FormDescription>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update Company' : 'Add Company'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
