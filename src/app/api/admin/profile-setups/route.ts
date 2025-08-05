import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ProfileSetupService } from '@/lib/services/profile.service'
import { ProfileSetupQuerySchema } from '@/lib/validations/profile'
import { ZodError } from 'zod'
import prisma from '@/lib/prisma'

// Get user from API session or NextAuth session
async function getAuthenticatedUser() {
  const nextAuthSession = await getAuthSession()
  if (nextAuthSession?.user?.id) {
    return nextAuthSession.user
  }

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('next-auth.session-token')?.value || 
                      cookieStore.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  })

  if (!session || session.expires < new Date()) {
    return null
  }

  return session.user
}

// Check if user is admin
async function checkAdminAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  return user?.role === 'ADMIN'
}

/**
 * GET /api/admin/profile-setups
 * Get all profile setups (admin only)
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

    // Check admin access
    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
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

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const result = await ProfileSetupService.getAll(validatedQuery, page, limit)
    
    return NextResponse.json({ 
      ...result,
      message: 'Profile setups retrieved successfully' 
    })
    
  } catch (error) {
    console.error('Admin profile setups GET error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
