import { HomePage } from './pages/HomePage'
import { IpPage } from './pages/IpPage'

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/ip') {
    return <IpPage />
  }

  if (pathname !== '/') {
    window.location.replace('/')
    return null
  }

  return <HomePage />
}
