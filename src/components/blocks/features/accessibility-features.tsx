"use client"

import { User, Search, Handshake } from "lucide-react"

const steps = [
  {
    id: "create-profile",
    number: 1,
    title: "Create Your Profile",
    description: "Build a comprehensive profile that highlights your skills, experience, and accessibility needs. Share your story and let employers know how you can contribute to their team.",
    icon: User,
    ariaLabel: "User profile icon representing the creation of a personalized profile"
  },
  {
    id: "find-jobs",
    number: 2,
    title: "Find Inclusive Jobs",
    description: "Browse job opportunities from companies committed to accessibility and inclusion. Use our advanced filters to find roles that match your skills and accommodation needs.",
    icon: Search,
    ariaLabel: "Search icon representing the discovery of inclusive job opportunities"
  },
  {
    id: "apply-with-confidence",
    number: 3,
    title: "Apply with Confidence",
    description: "Submit applications knowing that employers are prepared to support your success. Connect with hiring managers who value diversity and understand accessibility needs.",
    icon: Handshake,
    ariaLabel: "Handshake icon representing confident application and connection with inclusive employers"
  }
]

export default function AccessibilityFeatures() {
  return (
    <section 
      className="bg-background py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h2 
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-bold text-primary mb-4"
          >
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy to find inclusive employment opportunities. 
            Follow these simple steps to get started on your journey.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            
            return (
              <article 
                key={step.id}
                className="relative group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-lg"
                tabIndex={0}
                role="article"
                aria-labelledby={`step-${step.number}-title`}
                aria-describedby={`step-${step.number}-description`}
              >
                <div className="bg-card border border-border rounded-lg p-8 h-full transition-all duration-300 hover:shadow-lg hover:border-accent/30">
                  <div className="flex flex-col items-center text-center">
                    {/* Step Number */}
                    <div 
                      className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-lg font-bold mb-6"
                      aria-label={`Step ${step.number}`}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                      <IconComponent 
                        className="w-16 h-16 text-accent group-hover:scale-110 transition-transform duration-300"
                        aria-label={step.ariaLabel}
                        role="img"
                      />
                    </div>

                    {/* Title */}
                    <h3 
                      id={`step-${step.number}-title`}
                      className="text-xl font-semibold text-primary mb-4"
                    >
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p 
                      id={`step-${step.number}-description`}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line for Desktop */}
                {index < steps.length - 1 && (
                  <div 
                    className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-border z-0"
                    aria-hidden="true"
                  />
                )}
              </article>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Ready to start your journey towards inclusive employment?
          </p>
          <button
            className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-describedby="cta-description"
          >
            Get Started Today
          </button>
          <p 
            id="cta-description"
            className="sr-only"
          >
            Click to begin creating your profile and finding inclusive job opportunities
          </p>
        </div>
      </div>
    </section>
  )
}