import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Eye, Edit2, Trash2, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const res = await api.get('/listings/mine');
      setListings(res.data.data);
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing deleted successfully');
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>;
      case 'filled':
        return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-200"><Home className="w-3.5 h-3.5" /> Rented</span>;
      default:
        return <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200"><AlertCircle className="w-3.5 h-3.5" /> Hidden</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(n => (
          <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-200 h-80 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl w-full"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No properties listed yet</h3>
        <p className="text-gray-500 mb-6">Create your first listing to start receiving interests from verified tenants.</p>
        <Link to="/owner/listings/create" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition">
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map(listing => (
        <div key={listing._id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
          {/* Image Header */}
          <div className="relative h-56 overflow-hidden">
            <img 
              src={listing.photos && listing.photos.length > 0 ? listing.photos[0].url : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop'} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3">
              {getStatusBadge(listing.status)}
            </div>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
              ₹{listing.rent?.toLocaleString()} <span className="font-normal text-gray-500">/mo</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{listing.title}</h3>
              <p className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {listing.location.locality}, {listing.location.city}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                {listing.bhk ? `${listing.bhk} BHK` : 'Studio'}
              </span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium capitalize">
                {listing.roomType?.replace('-', ' ')}
              </span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium capitalize">
                {listing.furnishingStatus?.replace('-', ' ')}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-gray-50 rounded-xl mt-auto">
              <div>
                <p className="text-xs text-gray-500 font-medium">Interests</p>
                <p className="font-bold text-gray-900">0</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Views</p>
                <p className="font-bold text-gray-900">0</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm flex items-center justify-center gap-1.5">
                <Eye className="w-4 h-4" /> View
              </button>
              <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm flex items-center justify-center gap-1.5">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => deleteListing(listing._id)} className="px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyListings;
