import { NextRequest, NextResponse } from 'next/server'
import { cvDatabaseService } from '@/services/cv-database.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user.id as string

    const cvFiles = await cvDatabaseService.getUserCVFiles(userId)
    return NextResponse.json({ cvFiles })
  } catch (error) {
    console.error('Error fetching CV files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CV files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, use a default user ID

    const session = await getServerSession(authOptions)
    const userId = session?.user.id as string
    const { name, data, templateId } = await request.json()

    if (!name || !data) {
      return NextResponse.json(
        { error: 'Name and data are required' },
        { status: 400 }
      )
    }

    const cvFile = await cvDatabaseService.createCVFile(userId, name, data, templateId)
    return NextResponse.json({ cvFile }, { status: 201 })
  } catch (error) {
    console.error('Error creating CV file:', error)
    return NextResponse.json(
      { error: 'Failed to create CV file' },
      { status: 500 }
    )
  }
}
