import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import RecipeList from './pages/RecipeList'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Permissions from './pages/Permissions'
import { PermissionProvider, usePermissions } from './context/PermissionContext'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { setPermissions } = usePermissions();

  useEffect(() => {
     // Fetch permissions on load if token exists
     const token = localStorage.getItem('token'); // Assuming token is stored here
     if (token) {
         fetch('http://localhost:8000/api/v1/users/me', {
             headers: { 'Authorization': `Bearer ${token}` }
         })
         .then(res => res.json())
         .then(data => {
             if (data.permissions) {
                 setPermissions(data.permissions);
             }
         })
         .catch(err => console.error("Failed to fetch user info", err));
     }
  }, []);
  
  return (
    <div className="flex w-full h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-6 relative">
          <Routes>
             <Route path="/" element={<Navigate to="/dashboard" replace />} />
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/recipes" element={<RecipeList />} />
             <Route path="/permissions" element={<Permissions />} />
             <Route path="*" element={<div className="p-4">Page not implemented yet</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <PermissionProvider>
        <Router>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />} />
        </Routes>
        </Router>
    </PermissionProvider>
  )
}

export default App
