import { Metadata } from "next"
import ApplicationDashboard from "@/components/application-dashboard"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "My Applications | Job Platform",
  description: "Track and manage your job applications",
}

export default async function ApplicationsPage() {
  const session = await getAuthSession()
  
  if (!session?.user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications and manage your application pipeline.
          </p>
        </div>
        
        <ApplicationDashboard userId={session.user.id} />
      </div>
    </div>
  )
}
