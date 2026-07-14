import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import TenantProfile from './TenantProfile';
import MyInterests from './MyInterests';
import ChatList from './ChatList';

const TenantDashboard = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-primary-600 border-b-2 border-primary-600 font-semibold"
      : "text-gray-500 hover:text-gray-700 font-medium";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your profile, interests, and chats.</p>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <Link to="/tenant" className={`pb-4 px-1 ${getLinkClass('/tenant')}`}>
            Profile
          </Link>
          <Link to="/tenant/interests" className={`pb-4 px-1 ${getLinkClass('/tenant/interests')}`}>
            My Interests
          </Link>
          <Link to="/tenant/chats" className={`pb-4 px-1 ${getLinkClass('/tenant/chats')}`}>
            Chats
          </Link>
        </nav>
      </div>

      <div>
        <Routes>
          <Route path="/" element={<TenantProfile />} />
          <Route path="/interests" element={<MyInterests />} />
          <Route path="/chats" element={<ChatList />} />
        </Routes>
      </div>
    </div>
  );
};

export default TenantDashboard;
