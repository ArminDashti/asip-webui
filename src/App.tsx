import { HomePage } from './pages/HomePage'
import { IpPage } from './pages/IpPage'
import { NslookupPage } from './pages/NslookupPage'

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/ip') {
    return <IpPage />
  }

  if (pathname === '/nslookup') {
    return <NslookupPage />
  }

  if (pathname !== '/') {
    window.location.replace('/')
    return null
  }

  return <HomePage />
}
