import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// User query schema
const UserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(["JOB_SEEKER", "EMPLOYER", "ADMIN"]).optional(),
  status: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

// User update schema
const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(["JOB_SEEKER", "EMPLOYER", "ADMIN"]).optional(),
  status: z.string().optional(),
  isProfileComplete: z.boolean().optional()
})

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Parse and validate query parameters
    const {
      page,
      limit,
      search,
      role,
      status,
      sortBy,
      sortOrder
    } = UserQuerySchema.parse(queryParams)

    // Build where clause
    const where: any = {
      deletedAt: null // Exclude soft-deleted users
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } }
      ]
    }

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isProfileComplete: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              status: true,
              fullName: true,
              location: true
            }
          },
          _count: {
            select: {
              jobApplications: true,
              savedJobs: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = z.object({
      name: z.string().min(1).max(255),
      email: z.string().email(),
      role: z.enum(["JOB_SEEKER", "EMPLOYER", "ADMIN"]).default("JOB_SEEKER"),
      firstName: z.string().min(1).max(255).optional(),
      lastName: z.string().min(1).max(255).optional()
    }).parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        agreeToTerms: true, // Admin created users
        agreeToPrivacy: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "User created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating user:", error)
    
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
