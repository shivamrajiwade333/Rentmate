import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform statistics and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.users.tenants} Tenants, {stats.users.owners} Owners</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Listings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.listings.active}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.listings.filled} Filled</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Interests</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.interests.pending}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.interests.accepted} Accepted</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Compatibility Scores</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.compatibilityScores.llm}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.compatibilityScores.fallback} Fallbacks</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">Management Placeholder</h2>
        <p className="text-gray-600">Users, Listings, and Activity logs management tables go here.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
