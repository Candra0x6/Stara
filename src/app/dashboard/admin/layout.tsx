import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
      </div>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
