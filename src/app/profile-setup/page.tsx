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
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Complete Your Profile
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Let's get you set up with a personalized experience. This will only take a few minutes.
          </p>
        </header>
        
        <section className="max-w-4xl mx-auto">
          <ProfileSetupWizard />
        </section>
      </div>
    </main>
  )
}