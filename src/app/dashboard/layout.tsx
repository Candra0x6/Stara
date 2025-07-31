"use client"
import { DashboardNavigation } from '@/components/blocks/navbars/dashboard-navbar'
import { NavbarWithChildren } from '@/components/blocks/navbars/navbar-with-children'
import React, { useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {


    return (

        <div className="">
            <main>
                {children}
            </main>
        </div>

    )
}

