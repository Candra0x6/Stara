"use client"

import { Quote } from "lucide-react"
import Image from "next/image"

interface Testimonial {
  id: string
  name: string
  title: string
  disability: string
  quote: string
  image: string
  alt: string
}

const testimonials: Testimonial[] = [
  {
    id: "sarah-m",
    name: "Sarah M.",
    title: "Software Developer",
    disability: "Vision Impairment",
    quote: "The platform's screen reader compatibility and keyboard navigation made my daily development work seamless. I can focus on what I do best without technology barriers.",
    image: "/testimonials/sarah-m.jpg",
    alt: "Sarah M., a professional woman with dark hair wearing glasses and a navy blue blazer, smiling confidently at the camera"
  },
  {
    id: "marcus-r",
    name: "Marcus R.",
    title: "Marketing Manager",
    disability: "Mobility Disability",
    quote: "Voice commands and adaptive controls transformed how I manage campaigns. The platform understands that accessibility isn't just a feature—it's essential for success.",
    image: "/testimonials/marcus-r.jpg",
    alt: "Marcus R., a professional man with short brown hair wearing a light blue button-down shirt, seated and smiling warmly"
  },
  {
    id: "elena-t",
    name: "Elena T.",
    title: "Data Analyst",
    disability: "Hearing Impairment",
    quote: "Visual notifications and comprehensive closed captions ensure I never miss important information. The platform communicates in ways that work for everyone.",
    image: "/testimonials/elena-t.jpg",
    alt: "Elena T., a professional woman with shoulder-length blonde hair wearing a white blouse and gray cardigan, smiling professionally"
  },
  {
    id: "david-k",
    name: "David K.",
    title: "UX Designer",
    disability: "Cognitive Disability",
    quote: "Clear layouts and consistent navigation patterns help me stay focused and productive. The platform's intuitive design reduces cognitive load and enhances my workflow.",
    image: "/testimonials/david-k.jpg",
    alt: "David K., a professional man with curly dark hair wearing a green sweater, smiling thoughtfully at the camera"
  },
  {
    id: "maria-l",
    name: "Maria L.",
    title: "Project Manager",
    disability: "Learning Disability",
    quote: "Customizable text sizes and reading modes make complex information accessible. I can process data at my own pace and deliver results with confidence.",
    image: "/testimonials/maria-l.jpg",
    alt: "Maria L., a professional woman with long dark hair wearing a burgundy blazer, smiling confidently with arms crossed"
  }
]

export default function InclusiveTestimonialsSection() {
  return (
    <section 
      className="bg-background py-16 sm:py-24" 
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 
            id="testimonials-heading"
            className="text-3xl font-bold tracking-tight text-primary sm:text-4xl"
          >
            Success Stories from Our Community
          </h2>
          <p className="mt-6 text-lg leading-8 text-secondary">
            Hear from professionals who've transformed their workflows with our accessible platform
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface TestimonialCardProps {
  testimonial: Testimonial
  index: number
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <article 
      className="group relative isolate flex flex-col bg-card border border-border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      aria-label={`Testimonial from ${testimonial.name}`}
      tabIndex={0}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            src={testimonial.image}
            alt={testimonial.alt}
            width={48}
            height={48}
            sizes="48px"
            priority={index < 3}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-6 text-card-foreground">
            {testimonial.name}
          </h3>
          <div className="text-sm text-muted-foreground">
            <p className="truncate">{testimonial.title}</p>
            <p className="truncate">
              <span className="sr-only">Disability context: </span>
              {testimonial.disability}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <Quote 
          className="h-5 w-5 text-accent mb-3" 
          aria-hidden="true"
        />
        <blockquote className="text-card-foreground leading-relaxed">
          <p>"{testimonial.quote}"</p>
        </blockquote>
      </div>
      
      <div className="sr-only">
        End of testimonial from {testimonial.name}, {testimonial.title}
      </div>
    </article>
  )
}