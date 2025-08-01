import { NextRequest, NextResponse } from 'next/server'
import { cvDatabaseService } from '@/services/cv-database.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // For demo purposes, use a default user ID

    const session = await getServerSession(authOptions)
    const userId = session?.user.id as string
    const { id } = await context.params;
    const { shareWithEmail, permissions = 'VIEW' } = await request.json()

    if (!shareWithEmail) {
      return NextResponse.json(
        { error: 'Email is required for sharing' },
        { status: 400 }
      )
    }

    const shareToken = await cvDatabaseService.shareCVFile(
      id,
      userId,
      shareWithEmail,
      permissions
    )
    
    return NextResponse.json({ shareToken }, { status: 201 })
  } catch (error) {
    console.error('Error sharing CV file:', error)
    return NextResponse.json(
      { error: 'Failed to share CV file' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url)
    const shareToken = searchParams.get('token')

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      )
    }

    const cvFile = await cvDatabaseService.getSharedCVFile(shareToken)
    
    if (!cvFile) {
      return NextResponse.json({ error: 'Shared CV not found' }, { status: 404 })
    }

    return NextResponse.json({ cvFile })
  } catch (error) {
    console.error('Error fetching shared CV file:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared CV file' },
      { status: 500 }
    )
  }
}
