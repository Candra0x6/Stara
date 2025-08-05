import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getAuthSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import ApplicationDetailView from "@/components/application-detail-view"

interface ApplicationPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: ApplicationPageProps): Promise<Metadata> {
  const { id } = await params
  const application = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      job: {
        select: {
          title: true,
          company: {
            select: { name: true }
          }
        }
      }
    }
  })

  if (!application) {
    return {
      title: "Application Not Found",
    }
  }

  return {
    title: `Application: ${application.job.title} at ${application.job.company.name}`,
    description: `View details of your application for ${application.job.title}`,
  }
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const session = await getAuthSession()
  
  if (!session?.user) {
    redirect("/auth")
  }

  const { id } = await params
  const application = await prisma.jobApplication.findUnique({
    where: { 
      id,
      userId: session.user.id // Ensure user can only see their own applications
    },
    include: {
      job: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              website: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              preferredName: true,
              phone: true
            }
          }
        }
      }
    }
  })

  if (!application) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* @ts-ignore */}
        <ApplicationDetailView application={application} />
      </div>
    </div>
  )
}
