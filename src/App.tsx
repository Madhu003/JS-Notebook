import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import LandingPage from './components/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import { default as Notebook } from './components/Notebook'
import AuthDebugPage from './components/AuthDebugPage'
import { queryClient } from './lib/queryClient'
import { useAuth } from './hooks/useAuth'
import { useTheme, Theme } from './hooks/useTheme'
import KeyboardIcon from '@mui/icons-material/Keyboard';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const AppContent = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`min-h-screen ${theme === Theme.Dark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      {user && (
        <header className={`${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors`}>
          <div className="max-w-7xl mx-auto py-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-semibold ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>JS Notebook</h1>
              <span className={`px-2 py-1 text-xs ${theme === Theme.Dark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'} rounded-full`}>
                Authenticated
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsKeyboardShortcutsOpen(true)}
                className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                title="Keyboard shortcuts"
              >
                <KeyboardIcon />
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                title="Toggle theme"
              >
                {theme === Theme.Dark ? <LightModeIcon /> : <DarkModeIcon />}
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <PersonIcon className={theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'} />
                  <span className={`text-sm ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors flex items-center gap-1`}
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </button>
              </div>
              <Link to="/" className={`text-sm ${theme === Theme.Dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}>Home</Link>
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
        <Route path="/debug-auth" element={<AuthDebugPage />} />
        <Route path="/notebook/:id" element={
          <ProtectedRoute>
            <Notebook />
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={isKeyboardShortcutsOpen}
        onClose={() => setIsKeyboardShortcutsOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
