import './App.css'
import Notebook from './components/Notebook'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-semibold text-gray-800">JS Notebook</h1>
        </div>
      </header>
      <Notebook />
    </div>
  )
}

export default App
