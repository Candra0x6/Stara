import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ProfileSetupService } from '@/lib/services/profile.service'
import { 
  CreateProfileSetupSchema, 
  UpdateProfileSetupSchema,
  ProfileSetupQuerySchema,
  validateStep
} from '@/lib/validations/profile'
import { ZodError } from 'zod'
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
 * GET /api/user/profile-setup
 * Get profile setup for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const queryData = {
      userId: searchParams.get('userId') || undefined,
      status: searchParams.get('status') || undefined,
      includeCompleted: searchParams.get('includeCompleted') || undefined,
    }

    // Validate query parameters
    const validatedQuery = ProfileSetupQuerySchema.parse(queryData)

    // If no userId specified, use the authenticated user's ID
    const targetUserId = validatedQuery.userId || user.id

    // Check if user is trying to access another user's profile setup
    if (targetUserId !== user.id) {
      // Only allow admin users to access other users' data
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id }
      })
      
      if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden: Cannot access another user\'s profile setup' },
          { status: 403 }
        )
      }
    }

    const profileSetup = await ProfileSetupService.getByUserId(targetUserId)
    
    if (!profileSetup) {
      return NextResponse.json(
        { error: 'Profile setup not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      profileSetup,
      message: 'Profile setup retrieved successfully' 
    })
    
  } catch (error) {
    console.error('Profile setup GET error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/profile-setup
 * Create a new profile setup for the authenticated user
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

    const body = await request.json()
    
    // Validate request body
    const validatedData = CreateProfileSetupSchema.parse({
      ...body,
      userId: user.id // Force use of authenticated user's ID
    })

    const profileSetup = await ProfileSetupService.create(validatedData)
    
    return NextResponse.json(
      { 
        profileSetup,
        message: 'Profile setup created successfully' 
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Profile setup POST error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
      
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile-setup
 * Update profile setup for the authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = UpdateProfileSetupSchema.parse(body)

    // Get the user's profile setup
    const existingProfileSetup = await ProfileSetupService.getByUserId(user.id)
    
    if (!existingProfileSetup) {
      return NextResponse.json(
        { error: 'Profile setup not found. Create one first.' },
        { status: 404 }
      )
    }
 
    const profileSetup = await ProfileSetupService.update(
      existingProfileSetup.id, 
      validatedData
    )
    
    return NextResponse.json({ 
      profileSetup,
      message: 'Profile setup updated successfully' 
    })
    
  } catch (error) {
    console.error('Profile setup PUT error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/profile-setup
 * Delete profile setup for the authenticated user
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

    // Get the user's profile setup
    const existingProfileSetup = await ProfileSetupService.getByUserId(user.id)
    
    if (!existingProfileSetup) {
      return NextResponse.json(
        { error: 'Profile setup not found' },
        { status: 404 }
      )
    }

    await ProfileSetupService.delete(existingProfileSetup.id)
    
    return NextResponse.json({ 
      message: 'Profile setup deleted successfully' 
    })
    
  } catch (error) {
    console.error('Profile setup DELETE error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
