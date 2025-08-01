import { NextRequest, NextResponse } from 'next/server'
import { cvDatabaseService } from '@/services/cv-database.service'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user.id as string
    const { id } = await context.params;
    const { newName } = await request.json()

    if (!newName) {
      return NextResponse.json(
        { error: 'New name is required' },
        { status: 400 }
      )
    }

    const duplicatedFile = await cvDatabaseService.duplicateCVFile(
      id,
      userId,
      newName
    )
    
    return NextResponse.json({ cvFile: duplicatedFile }, { status: 201 })
  } catch (error) {
    console.error('Error duplicating CV file:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate CV file' },
      { status: 500 }
    )
  }
}
