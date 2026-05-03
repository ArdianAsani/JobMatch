import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import CandidateDashboard from './pages/CandidateDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/company/dashboard" element={
          <ProtectedRoute role="COMPANY"><CompanyDashboard /></ProtectedRoute>
        } />
        <Route path="/candidate/dashboard" element={
          <ProtectedRoute role="CANDIDATE"><CandidateDashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App