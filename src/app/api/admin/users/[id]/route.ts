import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// User update schema
const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(["JOB_SEEKER", "EMPLOYER", "ADMIN"]).optional(),
  status: z.string().optional(),
  isProfileComplete: z.boolean().optional(),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional()
})

// GET single user (admin only)
export async function GET(
  request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const id = (await params).id
    // Check if user is admin or requesting their own data
    const isAdmin = session?.user?.role === "ADMIN"
    const isOwnData = session?.user?.id === id

    if (!session?.user?.id || (!isAdmin && !isOwnData)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isProfileComplete: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          include: {
            user: false // Avoid circular reference
          }
        },
        _count: {
          select: {
            jobApplications: true,
            savedJobs: true,
            accounts: true,
            sessions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // If not admin, limit data returned
    if (!isAdmin) {
      const { _count, ...userData } = user
      return NextResponse.json({
        success: true,
        data: userData
      })
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update user (admin only or own data)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    // Check if user is admin or updating their own data
    const isAdmin = session?.user?.role === "ADMIN"
    const isOwnData = session?.user?.id === id
    
    if (!session?.user?.id || (!isAdmin && !isOwnData)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = id
    const body = await request.json()
    
    // Validate request body
    const validatedData = UpdateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    // Only admins can change role and status
    if (isAdmin) {
      if (validatedData.role !== undefined) updateData.role = validatedData.role
      if (validatedData.status !== undefined) updateData.status = validatedData.status
      if (validatedData.isProfileComplete !== undefined) updateData.isProfileComplete = validatedData.isProfileComplete
    }
    
    // Both admin and user can update basic info
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.firstName !== undefined) updateData.firstName = validatedData.firstName
    if (validatedData.lastName !== undefined) updateData.lastName = validatedData.lastName
    
    // Only admin can change email (to prevent conflicts)
    if (validatedData.email !== undefined && isAdmin) {
      // Check if email already exists
      const emailExists = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: userId }
        }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 400 }
        )
      }
      
      updateData.email = validatedData.email
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isProfileComplete: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully"
    })

  } catch (error) {
    console.error("Error updating user:", error)
    
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

// DELETE user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const userId = id

    // Don't allow admin to delete themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Soft delete - set deletedAt timestamp
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${existingUser.email}` // Prevent email conflicts
      }
    })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
