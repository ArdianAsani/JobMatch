import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Sigurohu që i ke të gjitha importet e nevojshme
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rrugët Publike */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rruga e Adminit (mund ta lësh me Protected nëse dëshiron ta testosh login-in e adminit) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Këtu i kemi hequr ProtectedRoute përkohësisht 
            që të mund t'i shohësh faqet direkt me URL 
        */}
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;