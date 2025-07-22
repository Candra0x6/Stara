import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { validateFile } from '@/lib/utils/file-upload'
import prisma from '@/lib/prisma'

// Get user from API session or NextAuth session
async function getAuthenticatedUser() {
  // First try NextAuth session
  const nextAuthSession = await getAuthSession()
  if (nextAuthSession?.user?.id) {
    return nextAuthSession.user
  }

  // Then try API session
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('next-auth.session-token')?.value || 
                      cookieStore.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) {
    return null
  }

  // Find session in database
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  })

  if (!session || session.expires < new Date()) {
    return null
  }

  return session.user
}

/**
 * POST /api/upload
 * Upload file to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'resume' | 'certification'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['resume', 'certification'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be "resume" or "certification"' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(file, type)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${type}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: error.message || 'Upload failed' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-documents')
      .getPublicUrl(fileName)

    // Log the upload for audit purposes
    console.log(`File uploaded: ${fileName} by user ${user.id}`)

    return NextResponse.json({
      success: true,
      url: data.path,
      publicUrl: urlData.publicUrl,
      fileName: data.path,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload
 * Delete file from Supabase Storage
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }

    // Check if the file belongs to the user (security check)
    if (!fileName.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('profile-documents')
      .remove([fileName])

    if (error) {
      console.error('File deletion error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log(`File deleted: ${fileName} by user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
