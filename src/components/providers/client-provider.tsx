import React from 'react'
import { NavbarWithChildren } from '../blocks/navbars/navbar-with-children'

function ClientProvider() {
  return (
    <React.StrictMode>
<NavbarWithChildren />
      {/* Other components can be added here as needed */}
    </React.StrictMode>
  )
}

export default ClientProvider