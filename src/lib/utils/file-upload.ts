/**
 * File upload utilities for profile setup
 */

import { supabase } from '@/lib/supabase'

export interface FileUploadResult {
  success: boolean
  url?: string
  publicUrl?: string
  fileName?: string
  error?: string
}

export interface FileUploadProgress {
  progress: number
  uploaded: number
  total: number
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File, 
  type: 'resume' | 'certification',
  userId: string,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<FileUploadResult> {
  try {
    // Validate file first
    const validation = validateFile(file, type)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/${type}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        duplex: 'half'
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { 
        success: false, 
        error: error.message || 'Upload failed' 
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-documents')
      .getPublicUrl(fileName)

    return { 
      success: true, 
      url: data.path,
      publicUrl: urlData.publicUrl,
      fileName: data.path
    }
  } catch (error) {
    console.error('File upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }
  }
}

/**
 * Upload file via API endpoint (for larger files or when auth context is needed)
 */
export async function uploadFileViaAPI(
  file: File, 
  type: 'resume' | 'certification',
  onProgress?: (progress: FileUploadProgress) => void
): Promise<FileUploadResult> {
  try {
    // Validate file first
    const validation = validateFile(file, type)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Upload failed')
    }

    const result = await response.json()
    return { 
      success: true, 
      url: result.url,
      publicUrl: result.publicUrl,
      fileName: result.fileName
    }
  } catch (error) {
    console.error('File upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('profile-documents')
      
      .remove([fileName])

    if (error) {
      console.error('File deletion error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('File deletion error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete file' 
    }
  }
}

/**
 * Convert file to base64 for temporary storage
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, type: 'resume' | 'certification'): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  const allowedTypes = {
    resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    certification: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
  }

  if (!allowedTypes[type].includes(file.type)) {
    const typeNames = {
      resume: 'PDF, DOC, or DOCX',
      certification: 'PDF, DOC, DOCX, JPG, or PNG'
    }
    return { valid: false, error: `File must be ${typeNames[type]}` }
  }

  return { valid: true }
}
