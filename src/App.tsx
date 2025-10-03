import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { default as Notebook } from './components/Notebook'

const AppContent = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-800">JS Notebook</h1>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Authenticated
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <span className="text-sm text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
              <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">Home</Link>
            </div>
          </div>
        </header>
      )}
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        } />
        <Route path="/notebook/:id" element={
          <ProtectedRoute>
            <Notebook />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
