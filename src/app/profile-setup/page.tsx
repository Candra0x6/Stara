import { Metadata } from 'next'
import { ProfileSetupWizard } from '@/components/profile-setup-wizard'

export const metadata: Metadata = {
  title: 'Profile Setup | Get Started',
  description: 'Complete your profile setup to get started with your personalized experience.',
}

export default function ProfileSetupPage() {
  return (
    <main className="min-h-screen bg-white font-inter">
      <div className="container mx-auto px-4 py-8">
       
        
        <section className="max-w-4xl mx-auto">
          <ProfileSetupWizard />
        </section>
      </div>
    </main>
  )
}