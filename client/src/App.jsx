import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

import Landing from './pages/public/Landing';
import ListingsSearch from './pages/public/ListingsSearch';
import ListingDetail from './pages/public/ListingDetail';
import FlatmatesSearch from './pages/public/FlatmatesSearch';
import FlatmateDetail from './pages/public/FlatmateDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TenantDashboard from './pages/tenant/TenantDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/listings" element={<ListingsSearch />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/flatmates" element={<FlatmatesSearch />} />
              <Route path="/flatmates/:id" element={<FlatmateDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tenant/*" element={<TenantDashboard />} />
              <Route path="/owner/*" element={<OwnerDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
        <ToastContainer position="bottom-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
