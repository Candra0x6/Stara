"use client"

import { Accessibility, Target, Users } from 'lucide-react'

const features = [
  {
    name: 'Accessibility-First Search',
    description:
      'Filter jobs by accommodation types, flexible work options, and inclusive company policies.',
    href: '#',
    icon: Accessibility,
  },
  {
    name: 'Skill-Based Matching',
    description:
      'Get matched with roles that focus on your abilities and experience, not your disability.',
    href: '#',
    icon: Target,
  },
  {
    name: 'Supportive Community',
    description:
      'Connect with mentors, career coaches, and other professionals in our inclusive network.',
    href: '#',
    icon: Users,
  },
]

export default function SimpleThreeColumnWithLargeIcons() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-primary sm:text-5xl">
            Key Features for Your Career Success
          </h2>
          <p className="mt-6 text-lg/8 text-secondary">
            Discover how our platform empowers professionals with disabilities to find meaningful employment through innovative tools and supportive resources.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg p-4 -m-4 transition-shadow duration-200">
                <dt className="text-base/7 font-semibold text-primary">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-accent">
                    <feature.icon aria-label={feature.name} className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-secondary">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a 
                      href={feature.href} 
                      className="text-sm/6 font-semibold text-accent hover:text-accent/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm p-1 -m-1 transition-colors duration-200"
                      tabIndex={0}
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}