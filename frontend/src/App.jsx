import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importet e faqeve
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

// Import AuthProvider
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>   {/* ← Kjo është e rëndësishme */}
        <Routes>
          {/* Rrugët Publike */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard-et */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;