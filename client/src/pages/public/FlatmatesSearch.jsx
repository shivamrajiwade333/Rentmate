import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { Search, MapPin, Filter, Loader2, User, Heart, MessageSquare, BadgeCheck, Map, Home } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import ContactFooter from '../../components/layout/ContactFooter';

const FlatmatesSearch = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'rooms' ? 'rooms' : 'flatmates';
  
  const [activeTab, setActiveTab] = useState(initialTab); // 'flatmates' or 'rooms'
  
  const [profiles, setProfiles] = useState([]);
  const [sharedListings, setSharedListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  // Flatmate Filter state
  const [flatmateFilters, setFlatmateFilters] = useState({
    city: '', minBudget: '', maxBudget: '', gender: 'any',
    occupation: 'any', smokingPreference: 'any', petsPreference: 'any', roomType: 'any'
  });

  // Room Filter state
  const [roomFilters, setRoomFilters] = useState({
    city: '', locality: '', minRent: '', maxRent: '', roomType: ''
  });

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
    if (activeTab === 'flatmates') {
      fetchProfiles();
    } else {
      fetchListings();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(flatmateFilters).filter(([_, v]) => v !== '' && v !== 'any')
      );
      
      const [profilesRes, sharedRes] = await Promise.all([
        api.get('/tenant-profile/public', { params: activeFilters }),
        api.get('/listings', { params: { roomType: 'shared', city: flatmateFilters.city } })
      ]);
      
      setProfiles(profilesRes.data.data || []);
      const sharedResults = sharedRes.data.results ? sharedRes.data.results.map(r => r.listing) : sharedRes.data.data;
      setSharedListings(sharedResults || []);
    } catch (error) {
      toast.error('Failed to load flatmates data');
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(roomFilters).filter(([_, v]) => v !== '')
      );
      // Default to non-shared rooms if roomType isn't explicitly requested
      if (!activeFilters.roomType) {
        activeFilters.roomType = 'private,entire-place,pg';
      }
      
      const res = await api.get('/listings', { params: activeFilters });
      const results = res.data.results ? res.data.results.map(r => r.listing) : res.data.data;
      setListings(results || []);
    } catch (error) {
      toast.error('Failed to load room listings');
    } finally {
      setLoading(false);
    }
  };

  const handleFlatmateFilterChange = (e) => setFlatmateFilters({ ...flatmateFilters, [e.target.name]: e.target.value });
  const handleRoomFilterChange = (e) => setRoomFilters({ ...roomFilters, [e.target.name]: e.target.value });

  const applyFlatmateFilters = (e) => { e.preventDefault(); fetchProfiles(); };
  const applyRoomFilters = (e) => { e.preventDefault(); fetchListings(); };

  const handleSaveProfile = async (id) => {
    if (!user) return toast.info('Please log in to save profiles');
    try {
      await api.post(`/tenant-profile/save/${id}`);
      toast.success('Saved to your favorites!');
    } catch (error) {
      toast.error('Could not save profile');
    }
  };

  const getMatchScore = (id) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 75 + (hash % 24);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Match</h1>
            <p className="text-gray-600 mt-2">Discover compatible flatmates or search for available rooms.</p>
          </div>
          
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button 
              onClick={() => { setActiveTab('flatmates'); setSearchParams({ tab: 'flatmates' }); }}
              className={`px-6 py-2 rounded-md font-bold text-sm transition flex items-center gap-2 ${activeTab === 'flatmates' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" /> Need Flatmates
            </button>
            <button 
              onClick={() => { setActiveTab('rooms'); setSearchParams({ tab: 'rooms' }); }}
              className={`px-6 py-2 rounded-md font-bold text-sm transition flex items-center gap-2 ${activeTab === 'rooms' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Home className="w-4 h-4" /> Rooms
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              
              {activeTab === 'flatmates' ? (
                <form onSubmit={applyFlatmateFilters} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (City/Area)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="city" 
                        value={flatmateFilters.city} 
                        onChange={handleFlatmateFilterChange} 
                        placeholder="Where do you want to live?" 
                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 bg-gray-50 focus:bg-white transition" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
                      <input type="number" name="minBudget" value={flatmateFilters.minBudget} onChange={handleFlatmateFilterChange} placeholder="₹0" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
                      <input type="number" name="maxBudget" value={flatmateFilters.maxBudget} onChange={handleFlatmateFilterChange} placeholder="₹50000" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
                    <select name="gender" value={flatmateFilters.gender} onChange={handleFlatmateFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option value="any">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <select name="occupation" value={flatmateFilters.occupation} onChange={handleFlatmateFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option value="any">Any</option>
                      <option value="student">Student</option>
                      <option value="working-professional">Working Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Smoking</label>
                    <select name="smokingPreference" value={flatmateFilters.smokingPreference} onChange={handleFlatmateFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option value="any">Any</option>
                      <option value="non-smoking">Non-Smoker</option>
                      <option value="smoking">Smoker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pets</label>
                    <select name="petsPreference" value={flatmateFilters.petsPreference} onChange={handleFlatmateFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option value="any">Any</option>
                      <option value="no-pets">No Pets</option>
                      <option value="pets-allowed">Pet Lover</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition mt-4 flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> Search Flatmates
                  </button>
                </form>
              ) : (
                <form onSubmit={applyRoomFilters} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="city" 
                        value={roomFilters.city} 
                        onChange={handleRoomFilterChange} 
                        placeholder="e.g. Pune" 
                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 bg-gray-50 focus:bg-white transition" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="locality" 
                        value={roomFilters.locality} 
                        onChange={handleRoomFilterChange} 
                        placeholder="e.g. Koregaon Park" 
                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2.5 bg-gray-50 focus:bg-white transition" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Rent</label>
                      <input type="number" name="minRent" value={roomFilters.minRent} onChange={handleRoomFilterChange} placeholder="₹0" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Rent</label>
                      <input type="number" name="maxRent" value={roomFilters.maxRent} onChange={handleRoomFilterChange} placeholder="₹50000" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <select name="roomType" value={roomFilters.roomType} onChange={handleRoomFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option value="">Any</option>
                      <option value="private">Private Room</option>
                      <option value="shared">Shared Room</option>
                      <option value="full">Entire Property</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition mt-4 flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> Search Rooms
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              </div>
            ) : activeTab === 'flatmates' ? (
              // FLATMATE LIST
              <div className="space-y-8">
                {sharedListings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Properties Needing Flatmates</h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                      {sharedListings.map(listing => (
                        <Link to={`/listings/${listing._id}`} key={listing._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition group flex flex-col">
                          <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                            {listing.photos && listing.photos.length > 0 ? (
                              <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400"><Home className="w-10 h-10" /></div>
                            )}
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                              {listing.roomType}
                            </div>
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition">{listing.title}</h3>
                              <p className="text-lg font-black text-primary-700 shrink-0">₹{listing.rent}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <p className="line-clamp-1">{listing.location?.locality}, {listing.location?.city}</p>
                            </div>
                            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                              <div className="flex gap-3 text-sm text-gray-600">
                                <span className="bg-gray-100 px-2 py-1 rounded">{listing.bhk} BHK</span>
                                <span className="bg-gray-100 px-2 py-1 rounded capitalize">{listing.furnishingStatus}</span>
                              </div>
                              {listing.owner?.profileImage && (
                                <img src={listing.owner.profileImage} alt="Owner" className="w-8 h-8 rounded-full object-cover border border-gray-200" title={listing.owner.name} />
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {profiles.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">People Looking for Rooms</h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                      {profiles.map(profile => (
                    <div key={profile._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col">
                      <div className="p-5 flex gap-4">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-primary-100 relative">
                            {profile.tenant?.profileImage ? (
                              <img src={profile.tenant.profileImage} alt={profile.tenant.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-gray-400" /></div>
                            )}
                          </div>
                          <div className="bg-green-100 text-green-700 text-xs font-black px-2 py-1 rounded-md border border-green-200 shadow-sm">
                            {getMatchScore(profile._id)}% Match
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900 truncate flex items-center gap-1">
                              {profile.tenant?.name || 'Anonymous'}
                              {profile.tenant?.isVerified && (
                                <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" title="Verified Identity" />
                              )}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-600 mb-2 font-medium">
                            {profile.age ? `${profile.age} yrs • ` : ''} 
                            <span className="capitalize">{profile.gender || 'Any'}</span>
                            {profile.lifestyle?.occupation && ` • ${profile.lifestyle.occupation.replace('-', ' ')}`}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 italic mb-3">
                            "{profile.bio || 'Looking for a great place to stay!'}"
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                             {profile.status === 'have-flat-need-flatmate' ? (
                               <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold border border-emerald-200">Has a Flat</span>
                             ) : (
                               <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold border border-purple-200">Needs a Room</span>
                             )}
                             {profile.lifestyle?.smokingPreference === 'non-smoking' && (
                               <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Non-Smoker</span>
                             )}
                             {profile.lifestyle?.petsPreference === 'pets-allowed' && (
                               <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded">Pet Lover</span>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500 text-xs block mb-0.5">Budget</span>
                          <span className="font-bold text-gray-900">₹{profile.maxBudget || 0}/mo</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500 text-xs block mb-0.5 flex items-center justify-end gap-1"><MapPin className="w-3 h-3"/> Preferred</span>
                          <span className="font-semibold text-gray-800 truncate max-w-[120px] block">
                            {profile.preferredLocations?.join(', ') || 'Anywhere'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 border-t border-gray-100 flex gap-2">
                        <Link 
                          to={`/flatmates/${profile._id}`}
                          className="flex-1 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition text-center text-sm"
                        >
                          View Profile
                        </Link>
                        <button className="flex-1 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-1 text-sm">
                          <MessageSquare className="w-4 h-4" /> Message
                        </button>
                        <button onClick={() => handleSaveProfile(profile._id)} className="w-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition border border-rose-100">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>
                )}
                {sharedListings.length === 0 && profiles.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your filters to find more potential matches.</p>
                  </div>
                )}
              </div>
            ) : (
              // ROOMS LIST
              listings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                  {listings.map(listing => (
                    <Link to={`/listings/${listing._id}`} key={listing._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition group flex flex-col">
                      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                        {listing.photos && listing.photos.length > 0 ? (
                          <img src={listing.photos[0].url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><Home className="w-10 h-10" /></div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                          {listing.roomType}
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition">{listing.title}</h3>
                          <p className="text-lg font-black text-primary-700 shrink-0">₹{listing.rent}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <p className="line-clamp-1">{listing.location?.locality}, {listing.location?.city}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                          <div className="flex gap-3 text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded">{listing.bhk} BHK</span>
                            <span className="bg-gray-100 px-2 py-1 rounded capitalize">{listing.furnishingStatus}</span>
                          </div>
                          {listing.owner?.profileImage && (
                            <img src={listing.owner.profileImage} alt="Owner" className="w-8 h-8 rounded-full object-cover border border-gray-200" title={listing.owner.name} />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>

        </div>
      </div>
      
      {/* Contact Section at the Bottom */}
      <ContactFooter />
    </div>
  );
};

export default FlatmatesSearch;
