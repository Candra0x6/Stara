import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

interface BackButtonProps {
    title: string
    subtitle?: string
}

function BackButton({ title, subtitle }: BackButtonProps) {
    return (
        <div className="flex items-center gap-4 py-5">
            <Button variant="ghost" size="sm" className="text-white py-5 w-12" onClick={() => window.history.back()}>
                <ArrowLeft className="h-6 w-6 " />
            </Button>
            <div>
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    )
}

export default BackButton