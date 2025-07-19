"use client"

export default function SimpleCentered() {
    return (
      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-[var(--color-primary)] sm:text-5xl">
              Ready to Start Your Inclusive Career Journey?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-[var(--color-secondary)]">
              Join thousands of professionals who've found meaningful work with employers who truly value diversity and inclusion.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-[var(--color-accent)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Create Your Free Profile Today
              </a>
              <p className="text-sm/6 font-medium text-[var(--color-secondary)]">
                Free to use • Always
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }