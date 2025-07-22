import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { ProfileSetupService } from '@/lib/services/profile.service'
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
 * GET /api/admin/profile-setups/stats
 * Get profile setup statistics (admin only)
 */
export async function GET() {
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

    const stats = await ProfileSetupService.getStats()
    
    return NextResponse.json({ 
      stats,
      message: 'Profile setup statistics retrieved successfully' 
    })
    
  } catch (error) {
    console.error('Admin profile setup stats GET error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
