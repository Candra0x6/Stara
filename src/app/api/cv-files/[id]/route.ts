import { NextRequest, NextResponse } from 'next/server'
import { cvDatabaseService } from '@/services/cv-database.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user.id as string
    const { id } = await context.params;

    const cvFile = await cvDatabaseService.getCVFile(id, userId)

    if (!cvFile) {
      return NextResponse.json({ error: 'CV file not found' }, { status: 404 })
    }

    return NextResponse.json({ cvFile })
  } catch (error) {
    console.error('Error fetching CV file:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CV file' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const updates = await request.json()
    const { id } = await context.params;
    const cvFile = await cvDatabaseService.updateCVFile(id, session?.user.id as string, updates)

    return NextResponse.json({ cvFile })
  } catch (error) {
    console.error('Error updating CV file:', error)
    return NextResponse.json(
      { error: 'Failed to update CV file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // For demo purposes, use a default user ID

    const session = await getServerSession(authOptions)
    const userId = session?.user.id as string
    const { id } = await context.params;
    const success = await cvDatabaseService.deleteCVFile(id, userId)

    if (!success) {
      return NextResponse.json({ error: 'CV file not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting CV file:', error)
    return NextResponse.json(
      { error: 'Failed to delete CV file' },
      { status: 500 }
    )
  }
}
