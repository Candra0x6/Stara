import { NextRequest, NextResponse } from "next/server"
import { JobQuerySchema, CreateJobSchema } from "@/lib/validations/job"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Parse and validate query parameters
    const {
      page,
      limit,
      search,
      workType,
      experience,
      accommodations,
      location,
      companyId,
      salaryMin,
      salaryMax,
      isRemote,
      isActive,
      sortBy,
      sortOrder
    } = JobQuerySchema.parse(queryParams)

    // Build where clause
    const where: Prisma.JobWhereInput = {
      isActive,
      status: "PUBLISHED"
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } }
      ]
    }

    if (workType && workType.length > 0) {
      where.workType = { in: workType }
    }

    if (experience && experience.length > 0) {
      where.experience = { in: experience }
    }

    if (accommodations && accommodations.length > 0) {
      where.accommodations = {
        hasSome: accommodations
      }
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (salaryMin || salaryMax) {
      where.AND = []
      if (salaryMin) {
        where.AND.push({ salaryMax: { gte: salaryMin } })
      }
      if (salaryMax) {
        where.AND.push({ salaryMin: { lte: salaryMax } })
      }
    }

    if (isRemote !== undefined) {
      where.isRemote = isRemote
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build order by clause
    const orderBy: Prisma.JobOrderByWithRelationInput = {}
    if (sortBy === "title") {
      orderBy.title = sortOrder
    } else if (sortBy === "salaryMin") {
      orderBy.salaryMin = sortOrder
    } else if (sortBy === "salaryMax") {
      orderBy.salaryMax = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Execute queries
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              size: true,
              industry: true,
              location: true
            }
          },
          _count: {
            select: {
              applications: true,
              savedJobs: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // // Only admins and employers can create jobs
    // if (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYER") {
    //   return NextResponse.json(
    //     { success: false, error: "Permission denied. Only employers and admins can create jobs." },
    //     { status: 403 }
    //   )
    // }

    const body = await request.json()
    const validatedData = CreateJobSchema.parse(body)

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    // For employers, ensure they can only create jobs for their company
    if (session.user.role === "EMPLOYER" && session.user.companyId !== validatedData.companyId) {
      return NextResponse.json(
        { success: false, error: "You can only create jobs for your own company" },
        { status: 403 }
      )
    }

    // Generate slug from title
    const baseSlug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Ensure slug is unique
    let slug = baseSlug
    let counter = 1
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Convert applicationDeadline string to Date if provided
    const jobData: any = {
      ...validatedData,
      slug,
      publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null
    }

    if (validatedData.applicationDeadline) {
      jobData.applicationDeadline = new Date(validatedData.applicationDeadline)
    }

    // Create the job
    const newJob = await prisma.job.create({
      data: jobData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            size: true,
            industry: true,
            location: true
          }
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: newJob,
      message: "Job created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating job:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
