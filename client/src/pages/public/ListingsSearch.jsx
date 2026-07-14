import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Home, Filter, Loader2 } from 'lucide-react';
import api from '../../services/api';

const ListingsSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    locality: searchParams.get('locality') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    roomType: searchParams.get('roomType') || '',
  });

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries([...searchParams]);
      const res = await api.get('/listings', { params });
      // Depending on backend structure, res.data.results is array of { listing: {...} } or res.data.data
      const results = res.data.results ? res.data.results.map(r => r.listing) : res.data.data;
      setListings(results || []);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    setSearchParams(activeFilters);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Next Home</h1>
          <p className="text-gray-600 mt-2">Discover properties and compatible flatmates matching your vibe.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              
              <form onSubmit={applyFilters} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="e.g. Pune" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                  <input type="text" name="locality" value={filters.locality} onChange={handleFilterChange} placeholder="e.g. Koregaon Park" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Rent</label>
                    <input type="number" name="minRent" value={filters.minRent} onChange={handleFilterChange} placeholder="₹0" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Rent</label>
                    <input type="number" name="maxRent" value={filters.maxRent} onChange={handleFilterChange} placeholder="₹50000" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select name="roomType" value={filters.roomType} onChange={handleFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">Any</option>
                    <option value="private">Private Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="full">Entire Property</option>
                  </select>
                </div>
                
                <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition mt-4 flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters to see more results.</p>
                <button onClick={() => { setFilters({city:'', locality:'', minRent:'', maxRent:'', roomType:''}); setSearchParams({}); }} className="text-primary-600 font-medium hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
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
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ListingsSearch;
