"use client"

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Menu, X, Eye, EyeOff } from 'lucide-react'

const navigation = [
  { name: 'Jobs', href: '#' },
  { name: 'Employers', href: '#' },
  { name: 'Resources', href: '#' },
  { name: 'About', href: '#' },
]

export default function SimpleCentered() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [highContrastMode, setHighContrastMode] = useState(false)

  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode)
    document.documentElement.classList.toggle('high-contrast')
  }

  return (
    <div className={`bg-background ${highContrastMode ? 'high-contrast' : ''}`}>
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-ring rounded-md">
              <span className="sr-only">AccessibleJobs</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
            >
              <span className="sr-only">Open main menu</span>
              <Menu aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a 
                key={item.name} 
                href={item.href} 
                className="text-sm/6 font-semibold text-foreground hover:text-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring rounded-md px-2 py-1"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
            <button
              onClick={toggleHighContrast}
              className="p-2 rounded-md text-foreground hover:text-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring"
              aria-label={highContrastMode ? 'Disable high contrast mode' : 'Enable high contrast mode'}
            >
              {highContrastMode ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
            <a href="#" className="text-sm/6 font-semibold text-foreground hover:text-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring rounded-md px-2 py-1">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background p-6 sm:max-w-sm sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-ring rounded-md">
                <span className="sr-only">AccessibleJobs</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring"
              >
                <span className="sr-only">Close menu</span>
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-foreground hover:bg-muted focus:outline-2 focus:outline-offset-2 focus:outline-ring"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6 flex flex-col space-y-4">
                  <button
                    onClick={toggleHighContrast}
                    className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-base/7 font-semibold text-foreground hover:bg-muted focus:outline-2 focus:outline-offset-2 focus:outline-ring"
                    aria-label={highContrastMode ? 'Disable high contrast mode' : 'Enable high contrast mode'}
                  >
                    {highContrastMode ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    {highContrastMode ? 'Disable High Contrast' : 'Enable High Contrast'}
                  </button>
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-foreground hover:bg-muted focus:outline-2 focus:outline-offset-2 focus:outline-ring"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-accent/30 to-primary/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-muted-foreground ring-1 ring-border hover:ring-accent/20 focus-within:ring-2 focus-within:ring-accent">
              Now featuring 10,000+ inclusive employers.{' '}
              <a href="#" className="font-semibold text-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring rounded-md">
                <span aria-hidden="true" className="absolute inset-0" />
                Learn more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
              Find Your Dream Job in an Inclusive Workplace
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
              Connect with employers who value diverse talent and create accessible work environments. Your skills matter, your potential is limitless.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-accent px-3.5 py-2.5 text-sm font-semibold text-accent-foreground shadow-xs hover:bg-accent/90 focus:outline-2 focus:outline-offset-2 focus:outline-ring"
              >
                Start Your Job Search
              </a>
              <a href="#" className="text-sm/6 font-semibold text-foreground hover:text-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring rounded-md px-2 py-1">
                For Employers <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          
          {/* Diverse illustration placeholder */}
          <div className="mt-16 flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-3xl"></div>
              <div className="relative bg-background border border-border rounded-2xl p-8 shadow-lg">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl" role="img" aria-label="Person working">👩‍💻</span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Sarah</div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl" role="img" aria-label="Person in wheelchair">🧑‍🦽</span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Carlos</div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl" role="img" aria-label="Person with guide dog">🦮</span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Maya</div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl" role="img" aria-label="Person working">👨‍💼</span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Alex</div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Diverse professionals thriving in inclusive workplaces
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-accent/30 to-primary/30 opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
    </div>
  )
}