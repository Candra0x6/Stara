import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token'
    
    const sessionToken = request.cookies.get(cookieName)?.value
    
    if (!sessionToken) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 401 })
    }
    
    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })
    
    if (!session || session.expires < new Date()) {
      // Session expired or doesn't exist
      if (session) {
        // Clean up expired session
        await prisma.session.delete({
          where: { sessionToken }
        })
      }
      
      return NextResponse.json({ user: null, authenticated: false }, { status: 401 })
    }
    
    // Return user data
    const { hashedPassword, ...userWithoutPassword } = session.user
    
    return NextResponse.json({
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        role: userWithoutPassword.role,
        image: userWithoutPassword.image,
        isProfileComplete: userWithoutPassword.isProfileComplete,
      },
      authenticated: true,
      session: {
        expires: session.expires.toISOString()
      }
    })
    
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error', authenticated: false },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Get session token from cookies
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')?.value || 
                        cookieStore.get('__Secure-next-auth.session-token')?.value

    // Delete session from database if it exists
    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken }
      })
    }

    // Logout - clear session
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token'
    
    const response = NextResponse.json({
      message: 'Logged out successfully'
    })
    
    // Clear session cookie
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expire immediately
      path: '/'
    })
    
    // Clear remember me cookie
    response.cookies.set('remember-me', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expire immediately
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
