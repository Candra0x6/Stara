import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { CreateJobSchema } from "@/lib/validations/job"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const validatedData = CreateJobSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if company exists and user has access
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        ...validatedData,
        slug: await generateUniqueSlug(slug),
        applicationDeadline: validatedData.applicationDeadline 
          ? new Date(validatedData.applicationDeadline)
          : undefined
      },
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: job
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    
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

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existingJob = await prisma.job.findUnique({
      where: { slug }
    })

    if (!existingJob) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}
