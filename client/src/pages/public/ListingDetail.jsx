import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { MapPin, User, CheckCircle, IndianRupee, Loader2, Heart, ArrowLeft, Calendar, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import ContactFooter from '../../components/layout/ContactFooter';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data.data);
    } catch (error) {
      toast.error('Failed to load listing details');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please login to express interest');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'tenant') {
      toast.error('Only tenants can express interest in listings');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/interests', {
        listingId: id,
        message
      });
      toast.success('Interest request sent successfully!');
      setShowModal(false);
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header Image Gallery */}
      <div className="bg-gray-900 h-[40vh] md:h-[60vh] relative flex">
        {listing.photos && listing.photos.length > 0 ? (
          <div className="w-full flex h-full gap-1 overflow-x-auto snap-x">
            {listing.photos.map((photo, i) => (
              <img key={i} src={photo.url} alt={`Listing ${i}`} className="h-full w-full object-cover shrink-0 snap-center md:w-auto md:max-w-[80vw]" />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-200">
            No images available
          </div>
        )}
        
        <button 
          onClick={() => navigate('/listings')}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-gray-800 hover:bg-white transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-primary-200">
                  {listing.roomType}
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-gray-200">
                  {listing.bhk} BHK
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-6 gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <p>{listing.location?.locality}, {listing.location?.city}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Rent</p>
                  <p className="text-xl font-bold text-gray-900 flex items-center"><IndianRupee className="w-5 h-5"/> {listing.rent}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Deposit</p>
                  <p className="text-xl font-bold text-gray-900 flex items-center"><IndianRupee className="w-5 h-5"/> {listing.deposit}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Furnishing</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{listing.furnishingStatus}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Available From</p>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    {new Date(listing.availableFrom).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{listing.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Amenities & Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">{listing.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">{listing.balconies} Balconies</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">{listing.areaSqft} sq.ft.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700 capitalize">{listing.waterSupply} Water</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700 capitalize">{listing.parking} Parking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">{listing.nonVegAllowed ? 'Non-Veg Allowed' : 'Veg Only'}</span>
                </div>
                {listing.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-700 capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Owner / Action */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Owner Details</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
                  {listing.owner?.profileImage ? (
                    <img src={listing.owner.profileImage} alt={listing.owner.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{listing.owner?.name}</p>
                  <p className="text-sm text-gray-500">Property Owner</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 mb-6">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  RentMate AI calculates your compatibility with the owner/flatmates based on your lifestyle preferences when you express interest.
                </p>
              </div>

              {!user || user.role === 'tenant' ? (
                <button 
                  onClick={() => setShowModal(true)}
                  className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-lg hover:bg-primary-700 transition shadow-md flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" /> Express Interest
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-lg text-center border border-gray-200">
                  Only tenants can apply
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Express Interest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Express Interest</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
            
            <form onSubmit={handleExpressInterest} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Let the owner know you're interested! Adding a quick message introduces you and increases your chances.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea 
                  rows="4" 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Hi! I really like this property and my profile matches your requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition flex justify-center items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Contact Section */}
      <ContactFooter />
    </div>
  );
};

export default ListingDetail;
