import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3500} newestOnTop />
    </AuthProvider>
  )
}

export default App
