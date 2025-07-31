import { NextRequest, NextResponse } from "next/server"
import prisma  from "@/lib/prisma"
import { UpdateCompanySchema } from "@/lib/validations/job"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        jobs: {
          where: {
            isActive: true,
            status: "PUBLISHED"
          },
          select: {
            id: true,
            title: true,
            location: true,
            workType: true,
            experience: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            accommodations: true,
            createdAt: true,
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
                status: "PUBLISHED"
              }
            }
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: company
    })
  } catch (error) {
    console.error("Error fetching company:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateCompanySchema.parse(body)

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    // Update company
    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: company
    })
  } catch (error) {
    console.error("Error updating company:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { jobs: true }
        }
      }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    // Check if company has jobs
    if (existingCompany._count.jobs > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete company with active jobs" },
        { status: 400 }
      )
    }

    // Delete company
    await prisma.company.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting company:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
