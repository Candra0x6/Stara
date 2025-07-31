import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Registration validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // @ts-ignore
  role: z.enum(['JOB_SEEKER', 'EMPLOYER'], {
    errorMap: () => ({ message: 'Role must be either JOB_SEEKER or EMPLOYER' })
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms of service'
  }),
  agreeToPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy policy'
  }),
  subscribeNewsletter: z.boolean().optional().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user with profile
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        hashedPassword,
        role: validatedData.role,
        agreeToTerms: validatedData.agreeToTerms,
        agreeToPrivacy: validatedData.agreeToPrivacy,
        subscribeNewsletter: validatedData.subscribeNewsletter,
        
        profile: {
          create: {
            // Initialize empty profile
          }
        }
      },
      include: {
        profile: true
      }
    })
    

  
    // Remove sensitive data from response
    const { hashedPassword: _, ...userWithoutPassword } = user
    
    // Create response
    const response = NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
      autoSignIn: true // Flag to indicate session was created
    }, { status: 201 })
    
    // Set NextAuth compatible session cookie
   
    
    return response
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
