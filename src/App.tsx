import { AppShell } from './components/AppShell'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { IpPage } from './pages/IpPage'
import { NslookupPage } from './pages/NslookupPage'

function resolvePage() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/ip') {
    return <IpPage />
  }

  if (pathname === '/nslookup') {
    return <NslookupPage />
  }

  if (pathname === '/about') {
    return <AboutPage />
  }

  if (pathname !== '/') {
    window.location.replace('/')
    return null
  }

  return <HomePage />
}

export default function App() {
  const page = resolvePage()
  if (page === null) {
    return null
  }

  return <AppShell>{page}</AppShell>
}
