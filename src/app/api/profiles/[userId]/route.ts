/**
 * User Profile API Route - GET /api/profiles/[userId]
 * Handles retrieving user profile data
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Check if user can access this profile (own profile or admin)
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user profile with related user data
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            isProfileComplete: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Check if user can update this profile (own profile only)
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields based on status
    if (body.status === 'COMPLETED') {
      const requiredFields = ['fullName', 'location', 'email', 'phone', 'disabilityTypes'];
      const missingFields = requiredFields.filter(field => !body[field]);
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Missing required fields for completion', 
            missingFields 
          },
          { status: 400 }
        );
      }
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        status: body.status,
        currentStep: body.currentStep,
        completedSteps: body.completedSteps || [],
        fullName: body.fullName,
        preferredName: body.preferredName,
        location: body.location,
        email: body.email,
        phone: body.phone,
        disabilityTypes: body.disabilityTypes || [],
        supportNeeds: body.supportNeeds,
        assistiveTech: body.assistiveTech || [],
        accommodations: body.accommodations,
        softSkills: body.softSkills || [],
        hardSkills: body.hardSkills || [],
        industries: body.industries || [],
        workArrangement: body.workArrangement,
        education: body.education || [],
        experience: body.experience || [],
        resumeUrl: body.resumeUrl,
        certificationUrls: body.certificationUrls || [],
        certifications: body.certifications || [],
        customSummary: body.customSummary,
        additionalInfo: body.additionalInfo,
        completedAt: body.status === 'COMPLETED' ? new Date() : null,
      },
      create: {
        userId,
        status: body.status || 'IN_PROGRESS',
        currentStep: body.currentStep || 1,
        completedSteps: body.completedSteps || [],
        fullName: body.fullName,
        preferredName: body.preferredName,
        location: body.location,
        email: body.email,
        phone: body.phone,
        disabilityTypes: body.disabilityTypes || [],
        supportNeeds: body.supportNeeds,
        assistiveTech: body.assistiveTech || [],
        accommodations: body.accommodations,
        softSkills: body.softSkills || [],
        hardSkills: body.hardSkills || [],
        industries: body.industries || [],
        workArrangement: body.workArrangement,
        education: body.education || [],
        experience: body.experience || [],
        resumeUrl: body.resumeUrl,
        certificationUrls: body.certificationUrls || [],
        certifications: body.certifications || [],
        customSummary: body.customSummary,
        additionalInfo: body.additionalInfo,
        completedAt: body.status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update user's profile completion status
    if (body.status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: userId },
        data: { isProfileComplete: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: body.status === 'COMPLETED' ? 'Profile completed successfully' : 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    // Check if user can delete this profile (own profile or admin)
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the profile
    await prisma.userProfile.delete({
      where: { userId },
    });

    // Update user's profile completion status
    await prisma.user.update({
      where: { id: userId },
      data: { isProfileComplete: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting user profile:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
