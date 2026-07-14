import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleScrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="RentMate Logo" className="h-10 w-auto object-contain" />
              <span className="text-2xl font-bold text-primary-600 tracking-tight hidden sm:block">RentMate</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/flatmates" className="text-gray-600 hover:text-primary-600 font-medium transition">Find Flatmates & Rooms</Link>
            <button onClick={() => handleScrollTo('features')} className="text-gray-600 hover:text-primary-600 font-medium transition">Features</button>
            <button onClick={() => handleScrollTo('how-it-works')} className="text-gray-600 hover:text-primary-600 font-medium transition">How it Works</button>
            <button onClick={() => handleScrollTo('contact')} className="text-gray-600 hover:text-primary-600 font-medium transition">Contact</button>
            
            <div className="h-6 w-px bg-gray-300"></div>

            {user ? (
              <>
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/tenant'} 
                  className="text-gray-600 hover:text-primary-600 font-medium"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition">Login</Link>
                <Link to="/register" className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg shadow-md hover:bg-primary-700 transition">Sign Up</Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button (simplified for hackathon) */}
          <div className="flex md:hidden items-center gap-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/tenant'} className="text-primary-600 font-medium text-sm">Dashboard</Link>
                <button onClick={handleLogout} className="text-gray-500 font-medium text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 font-medium text-sm">Login</Link>
                <Link to="/register" className="bg-primary-600 text-white px-3 py-1.5 rounded-md font-medium text-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
