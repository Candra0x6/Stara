import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { cookies } from 'next/headers'
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

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true
      },

    })
    
    if (!userWithProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { hashedPassword: _, ...userWithoutPassword } = userWithProfile

    return NextResponse.json({ user: userWithoutPassword })
    
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { profile, ...userData } = body
    
    // Update user and profile data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...userData,
        isProfileComplete: true,
        profile: profile ? {
          upsert: {
            create: profile,
            update: profile
          }
        } : undefined
      },
      include: {
        profile: true
      }
    })
    
    return NextResponse.json({ 
      user: updatedUser,
      message: 'Profile updated successfully' 
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
