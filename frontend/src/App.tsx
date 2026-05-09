import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import NetworkActivityIndicator from './components/NetworkActivityIndicator'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <NetworkActivityIndicator />
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </AuthProvider>
  )
}

export default App
