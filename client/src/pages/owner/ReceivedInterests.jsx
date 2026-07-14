import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Users, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

const ReceivedInterests = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const res = await api.get('/interests/received');
      setInterests(res.data.data);
    } catch (error) {
      toast.error('Failed to load received interests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setActionLoading(id);
    try {
      await api.patch(`/interests/${id}/${action}`);
      toast.success(`Interest request ${action}ed successfully`);
      fetchInterests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200 uppercase tracking-wider">Accepted</span>;
      case 'declined': return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200 uppercase tracking-wider">Declined</span>;
      case 'withdrawn': return <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 uppercase tracking-wider">Withdrawn</span>;
      default: return <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 uppercase tracking-wider">Pending</span>;
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
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Requests Yet</h2>
        <p className="text-gray-500 mb-6">You haven't received any interest requests for your properties yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      {interests.map(interest => (
        <div key={interest._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
          <div className="p-5 border-b border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">For Property</p>
              <h3 className="font-bold text-gray-900">{interest.listing?.title || 'Deleted Listing'}</h3>
            </div>
            {getStatusBadge(interest.status)}
          </div>
          
          <div className="p-5 flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-500">
                {interest.tenant?.profileImage ? (
                  <img src={interest.tenant.profileImage} alt={interest.tenant.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-6 h-6" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{interest.tenant?.name || 'Unknown User'}</h4>
                <p className="text-sm text-gray-500">Applied {format(new Date(interest.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>

            <div className="mb-4 bg-primary-50 rounded-lg p-3 border border-primary-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary-800 uppercase tracking-wider mb-0.5">AI Match Score</p>
                <p className="text-xs text-primary-600">Based on lifestyle preferences</p>
              </div>
              <div className="text-2xl font-black text-primary-700">{interest.scoreSnapshot}%</div>
            </div>

            {interest.message && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                <div className="flex gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</p>
                </div>
                <p className="text-sm text-gray-700 italic">"{interest.message}"</p>
              </div>
            )}
          </div>

          {interest.status === 'pending' && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => handleAction(interest._id, 'decline')}
                disabled={actionLoading === interest._id}
                className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {actionLoading === interest._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Decline
              </button>
              <button 
                onClick={() => handleAction(interest._id, 'accept')}
                disabled={actionLoading === interest._id}
                className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg transition shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {actionLoading === interest._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Accept Request
              </button>
            </div>
          )}
          
          {interest.status === 'accepted' && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex">
               <button className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 font-medium rounded-lg transition shadow-sm flex justify-center items-center gap-2">
                 <MessageSquare className="w-4 h-4" /> Message Tenant
               </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReceivedInterests;
