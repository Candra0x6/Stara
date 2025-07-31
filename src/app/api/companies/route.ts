import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { CreateCompanySchema } from "@/lib/validations/job"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const industry = searchParams.get("industry")
    const size = searchParams.get("size")

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } }
      ]
    }

    if (industry) {
      where.industry = industry
    }

    if (size) {
      where.size = size
    }

    const skip = (page - 1) * limit

    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
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
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.company.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        companies,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateCompanySchema.parse(body)

    // Create company
    const company = await prisma.company.create({
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: company
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating company:", error)
    
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
