import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

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
