import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Home, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

const MyInterests = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const res = await api.get('/interests/mine');
      setInterests(res.data.data);
    } catch (error) {
      toast.error('Failed to load your interests');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this interest request?')) return;
    
    setActionLoading(id);
    try {
      await api.patch(`/interests/${id}/withdraw`);
      toast.success('Interest request withdrawn');
      fetchInterests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw request');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <span className="flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200"><CheckCircle className="w-4 h-4" /> Accepted</span>;
      case 'declined': return <span className="flex items-center gap-1 text-sm font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200"><XCircle className="w-4 h-4" /> Declined</span>;
      case 'withdrawn': return <span className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">Withdrawn</span>;
      default: return <span className="flex items-center gap-1 text-sm font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200"><Clock className="w-4 h-4" /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (interests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Interests Yet</h2>
        <p className="text-gray-500 mb-6">You haven't expressed interest in any properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {interests.map(interest => (
        <div key={interest._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-shadow hover:shadow-md">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {interest.listing.photos && interest.listing.photos.length > 0 ? (
                <img src={interest.listing.photos[0].url} alt={interest.listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><Home className="w-8 h-8" /></div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{interest.listing.title}</h3>
                {getStatusBadge(interest.status)}
              </div>
              <p className="text-gray-500 text-sm mb-2">{interest.listing.location?.locality}, {interest.listing.location?.city}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <p className="font-semibold text-primary-700">₹{interest.listing.rent} <span className="text-gray-500 font-normal">/mo</span></p>
                <span className="text-gray-300">|</span>
                <p className="text-gray-500">Sent {format(new Date(interest.createdAt), 'MMM d, yyyy')}</p>
                <span className="text-gray-300">|</span>
                <p className="text-primary-600 font-medium">{interest.scoreSnapshot}% Match Score</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[140px]">
            {interest.status === 'pending' && (
              <button 
                onClick={() => handleWithdraw(interest._id)}
                disabled={actionLoading === interest._id}
                className="w-full px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition disabled:opacity-50"
              >
                {actionLoading === interest._id ? 'Withdrawing...' : 'Withdraw Request'}
              </button>
            )}
            
            {interest.status === 'accepted' && (
              <button className="w-full px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 font-medium rounded-lg transition shadow-sm">
                Go to Chat
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyInterests;
