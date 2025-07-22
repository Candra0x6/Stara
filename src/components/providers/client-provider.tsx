import React from 'react'
import { NavbarWithChildren } from '../blocks/navbars/navbar-with-children'
import { Toaster } from 'react-hot-toast'
function ClientProvider() {
  return (
    <React.StrictMode>
      <NavbarWithChildren />
      <Toaster

      />
    </React.StrictMode>
  )
}

export default ClientProvider