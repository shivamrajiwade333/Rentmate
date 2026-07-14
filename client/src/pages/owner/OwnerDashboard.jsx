import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MyListings from './MyListings';
import ReceivedInterests from './ReceivedInterests';
import OwnerChatList from './OwnerChatList';
import CreateListing from './CreateListing';

const OwnerDashboard = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-primary-600 border-b-2 border-primary-600 font-semibold"
      : "text-gray-500 hover:text-gray-700 font-medium";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your listings, view interests, and chat.</p>
        </div>
        <Link to="/owner/listings/create" className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition">
          + Create Listing
        </Link>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <Link to="/owner" className={`pb-4 px-1 ${getLinkClass('/owner')}`}>
            My Listings
          </Link>
          <Link to="/owner/interests" className={`pb-4 px-1 ${getLinkClass('/owner/interests')}`}>
            Received Interests
          </Link>
          <Link to="/owner/chats" className={`pb-4 px-1 ${getLinkClass('/owner/chats')}`}>
            Chats
          </Link>
        </nav>
      </div>

      <div>
        <Routes>
          <Route path="/" element={<MyListings />} />
          <Route path="/listings/create" element={<CreateListing />} />
          <Route path="/interests" element={<ReceivedInterests />} />
          <Route path="/chats" element={<OwnerChatList />} />
        </Routes>
      </div>
    </div>
  );
};

export default OwnerDashboard;
