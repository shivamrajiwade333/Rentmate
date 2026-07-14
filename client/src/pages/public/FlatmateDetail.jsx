import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { User, MapPin, Loader2, MessageSquare, Heart, CheckCircle, BadgeCheck, Coffee, Sun, Moon, Info, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import ContactFooter from '../../components/layout/ContactFooter';

const FlatmateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    fetchProfile();
    // eslint-disable-next-line
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/tenant-profile/public/${id}`);
      setProfile(res.data.data);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/flatmates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.info('Please log in to save profiles');
      navigate('/login');
      return;
    }
    try {
      await api.post(`/tenant-profile/save/${id}`);
      toast.success('Saved to your favorites!');
    } catch (error) {
      toast.error('Could not save profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!profile) return null;

  // Mock score explanation for demo
  const getMatchScore = () => {
    const hash = profile._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 75 + (hash % 24);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8 flex flex-col">
      <div className="flex-1 w-full">
        {/* Cover Profile Header */}
        <div className="bg-white border-b border-gray-200 pb-12 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-4">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-lg relative shrink-0">
                {profile.tenant?.profileImage ? (
                  <img src={profile.tenant.profileImage} alt={profile.tenant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-16 h-16 text-gray-300" /></div>
                )}
              </div>
              
              <div className="text-center md:text-left flex-1 mt-2">
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    {profile.tenant?.name || 'Anonymous User'}
                    {profile.tenant?.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500 shrink-0" title="Identity Verified" />}
                  </h1>
                  <p className="text-lg text-gray-500 font-medium">
                    {profile.age ? `${profile.age} • ` : ''} <span className="capitalize">{profile.gender}</span>
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-4">
                  <p className="text-xl text-primary-700 font-semibold capitalize">
                    {profile.lifestyle?.occupation?.replace('-', ' ') || 'Student'}
                  </p>
                  <span className="hidden md:inline text-gray-300">•</span>
                  {profile.status === 'have-flat-need-flatmate' ? (
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold border border-emerald-200">
                      Has a Flat (Looking for Flatmate)
                    </span>
                  ) : (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold border border-purple-200">
                      Needs a Room
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>Looking in: <strong className="text-gray-900">{profile.preferredLocations?.join(', ') || 'Anywhere'}</strong></span>
                  </div>
                  <div className="h-1 w-1 bg-gray-300 rounded-full hidden md:block"></div>
                  <div>
                    Budget up to: <strong className="text-gray-900 text-lg">₹{profile.maxBudget}</strong>/mo
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center md:justify-start">
                  <button className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition shadow flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Message Now
                  </button>
                  <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" /> Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Info Column */}
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                  "{profile.bio || 'I am looking for a cool flatmate to share a flat with. Feel free to message me!'}"
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Lifestyle & Habits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Sleep Schedule</h4>
                    <div className="flex items-center gap-2 font-medium text-gray-900 capitalize">
                      {profile.lifestyle?.sleepSchedule === 'early-bird' ? <Sun className="w-5 h-5 text-orange-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                      {profile.lifestyle?.sleepSchedule?.replace('-', ' ') || 'Flexible'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Smoking</h4>
                    <p className="font-medium text-gray-900 capitalize">{profile.lifestyle?.smokingPreference?.replace('-', ' ') || 'Any'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Diet / Food</h4>
                    <p className="font-medium text-gray-900 capitalize">{profile.lifestyle?.foodPreference?.replace('-', ' ') || 'Any'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Cleanliness Level</h4>
                    <p className="font-medium text-gray-900 capitalize">{profile.lifestyle?.cleanlinessLevel?.replace('-', ' ') || 'Moderate'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Pets</h4>
                    <p className="font-medium text-gray-900 capitalize">{profile.lifestyle?.petsPreference?.replace('-', ' ') || 'Any'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Guest Policy</h4>
                    <p className="font-medium text-gray-900 capitalize">{profile.guestPolicy || 'Any'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Interests & Hobbies</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest, idx) => (
                      <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-medium text-sm capitalize">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-medium text-sm">
                      Movies
                    </span>
                  )}
                  {/* Fallbacks if empty for demo */}
                  {(!profile.interests || profile.interests.length === 0) && (
                    <>
                      <span className="bg-green-50 border border-green-100 text-green-700 px-4 py-2 rounded-full font-medium text-sm">Fitness</span>
                      <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-medium text-sm">Travel</span>
                      <span className="bg-purple-50 border border-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium text-sm">Reading</span>
                    </>
                  )}
                </div>
              </div>
              
            </div>

            {/* Sidebar Area */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* AI Compatibility Card */}
              <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CheckCircle className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-wider text-primary-100 mb-2">RentMate AI Match</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black">{getMatchScore()}%</span>
                    <span className="text-xl font-medium text-primary-100 mb-1">Match</span>
                  </div>
                  <p className="text-sm text-primary-50 leading-relaxed border-t border-white/20 pt-4 mt-2">
                    "You both prefer quiet evenings (Night Owls), have similar budgets under ₹{profile.maxBudget}, and maintain a moderate cleanliness level. Excellent compatibility!"
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Requirements</h3>
                <ul className="space-y-4">
                  <li>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Lease Duration</p>
                    <p className="font-medium text-gray-900 capitalize">{profile.leaseDuration || 'Long-Term'}</p>
                  </li>
                  <li>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Room Type Preferred</p>
                    <p className="font-medium text-gray-900 capitalize">{profile.preferredRoomTypes?.join(', ') || 'Private or Shared'}</p>
                  </li>
                  <li>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Furnishing</p>
                    <p className="font-medium text-gray-900 capitalize">{profile.furnishingPreference || 'Any'}</p>
                  </li>
                  <li>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Languages Spoken</p>
                    <p className="font-medium text-gray-900 capitalize">{profile.languages?.join(', ') || 'English, Hindi'}</p>
                  </li>
                </ul>
              </div>

              {/* Safety Verification */}
              <div className="bg-green-50 rounded-xl border border-green-100 p-5 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-800">Trust & Safety</h4>
                  <p className="text-xs text-green-700 mt-1 leading-relaxed">
                    {profile.tenant?.isVerified 
                      ? 'This user has verified their Phone Number, Email Address, and Government ID.'
                      : 'This user has completed basic email verification. Always meet in public first.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Section at the Bottom */}
      <ContactFooter />
    </div>
  );
};

export default FlatmateDetail;
