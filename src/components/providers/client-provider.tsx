import React from 'react'
import { NavbarWithChildren } from '../blocks/navbars/navbar-with-children'
import { Toaster } from 'react-hot-toast'
import AccessibilityButton from '../accessibility/accessibility-button'
function ClientProvider() {
  return (
    <React.StrictMode>
      <NavbarWithChildren />
      <Toaster

      />
      <AccessibilityButton />
    </React.StrictMode>
  )
}

export default ClientProvider