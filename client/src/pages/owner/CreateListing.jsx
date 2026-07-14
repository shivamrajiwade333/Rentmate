import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle, MapPin, Building, ShieldCheck, Zap, Mail, Phone, ArrowRight, ArrowLeft, MessageSquare, Send, Navigation, UploadCloud, Image as ImageIcon, Video, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CreateListing = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState([{role: 'model', text: 'Hi! I am the RentMate Support AI. How can I help you list your property today?'}]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  const amenitiesCategories = [
    { title: 'Essentials', items: ['WiFi', 'AC', 'Power Backup', 'Water Purifier', 'Washing Machine', 'Geyser'] },
    { title: 'Community', items: ['Gym', 'Swimming Pool', 'Lift', 'Security Guard', 'CCTV', 'Club House', 'Park'] },
    { title: 'Rules & Vibe', items: ['Pet Friendly', 'Couple Friendly', 'Bachelors Allowed', 'Smoking Allowed'] }
  ];
  
  const { register, handleSubmit, formState: { errors }, watch, trigger, getValues, setValue } = useForm({
    defaultValues: {
      roomType: 'shared',
      title: '',
      description: '',
      address: '',
      adminAddress: '', // Flat/building/street - admin only
      city: 'Pune',
      state: 'Maharashtra',
      bhk: 1,
      bathrooms: 1,
      balconies: 0,
      areaSqft: '',
      floorNumber: '',
      totalFloors: '',
      propertyAge: 'New',
      waterSupply: '24/7 Corporation',
      parking: 'None',
      nonVegAllowed: 'true',
      rentAmount: '',
      securityDeposit: '',
      maintenance: 0,
      furnishingStatus: 'furnished',
      amenities: [],
      images: ''
    }
  });

  const amenitiesList = [
    'WiFi', 'AC', 'Power Backup', 'Gym', 'Swimming Pool', 
    'Parking', 'Security Guard', 'Lift', 'Club House'
  ];

  const handleNext = async () => {
    if (step === 3) {
      setStep(4);
      return;
    }

    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ['roomType', 'title', 'address', 'adminAddress', 'city', 'description'];
    if (step === 2) fieldsToValidate = ['bhk', 'bathrooms', 'rentAmount', 'securityDeposit', 'areaSqft', 'floorNumber', 'totalFloors'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await api.post('/support/chat', { 
        message: userMsg.text, 
        history: chatHistory 
      });
      setChatHistory(prev => [...prev, { role: 'model', text: res.data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting to the server. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation(`${latitude},${longitude}`);
        
        try {
          // Free Reverse Geocoding via Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const { road, suburb, neighbourhood, city, town, village } = data.address;
              
              // Build a sensible Exact Address string
              const exactAddrParts = [neighbourhood, suburb, road].filter(Boolean);
              if (exactAddrParts.length > 0) {
                setValue('address', exactAddrParts.join(', '), { shouldValidate: true });
              } else if (data.display_name) {
                // Fallback to the short display name if specific parts are missing
                setValue('address', data.display_name.split(',').slice(0, 2).join(', '), { shouldValidate: true });
              }
              
              // Fill City
              const resolvedCity = city || town || village;
              if (resolvedCity) {
                setValue('city', resolvedCity, { shouldValidate: true });
              }
            }
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          // We don't toast an error here because the GPS map pin still worked!
        }

        setIsLocating(false);
        toast.success('Location pinned & address auto-filled!');
      },
      (error) => {
        setIsLocating(false);
        toast.error('Unable to retrieve your location. Please check browser permissions.');
      }
    );
  };

  // Clear GPS lock if user starts typing a manual address
  const currentAddress = watch('address');
  useEffect(() => {
    if (gpsLocation) setGpsLocation(null);
  }, [currentAddress]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) {
      toast.error('You can only upload up to 10 photos');
      return;
    }
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (videos.length + files.length > 2) {
      toast.error('You can only upload up to 2 videos');
      return;
    }
    const newVideos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file) // Video preview URL
    }));
    setVideos(prev => [...prev, ...newVideos]);
  };

  const removeVideo = (idx) => {
    setVideos(prev => prev.filter((_, i) => i !== idx));
  };


  const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      // Format data for backend
      const localityStr = data.address.split(',')[0] || data.city;
      
      const payload = {
        title: data.title,
        description: data.description,
        location: {
          locality: localityStr,
          address: data.address,
          city: data.city,
          state: data.state
        },
        rent: Number(data.rentAmount),
        deposit: Number(data.securityDeposit),
        maintenance: Number(data.maintenance || 0),
        availableFrom: new Date(),
        roomType: data.roomType,
        furnishingStatus: data.furnishingStatus,
        bhk: Number(data.bhk),
        bathrooms: Number(data.bathrooms),
        balconies: Number(data.balconies || 0),
        areaSqft: Number(data.areaSqft),
        floorNumber: Number(data.floorNumber),
        totalFloors: Number(data.totalFloors),
        propertyAge: data.propertyAge,
        waterSupply: data.waterSupply,
        parking: data.parking,
        nonVegAllowed: data.nonVegAllowed === 'true',
        amenities: data.amenities,
        photos: photos.length > 0 
          ? await Promise.all(photos.map(p => getBase64(p.file)))
          : [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60', publicId: 'demo_photo' }],
        videos: videos.length > 0 
          ? await Promise.all(videos.map(v => getBase64(v.file)))
          : []
      };

      await api.post('/listings', payload);
      toast.success('Listing created successfully!');
      navigate('/owner');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-2">Create a comprehensive listing to attract the best tenants.</p>
      </div>

      <div className="flex flex-col gap-12">
        
        {/* Main Form */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-8 py-4 flex justify-between items-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= i ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i}
                  </div>
                  {i < 4 && (
                    <div className={`h-1 w-12 sm:w-20 mx-2 rounded ${
                      step > i ? 'bg-primary-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                
                {/* STEP 1: Property Details */}
                <div className={`space-y-6 animate-fadeIn ${step === 1 ? 'block' : 'hidden'}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary-600" /> Property Details
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                      <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" value="shared" {...register('roomType')} className="peer sr-only" />
                          <div className="p-3 text-center border border-gray-300 rounded-xl peer-checked:bg-primary-50 peer-checked:border-primary-600 peer-checked:text-primary-700 hover:bg-gray-50 transition font-medium">Need Flatmate (Shared Room)</div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input type="radio" value="private" {...register('roomType')} className="peer sr-only" />
                          <div className="p-3 text-center border border-gray-300 rounded-xl peer-checked:bg-primary-50 peer-checked:border-primary-600 peer-checked:text-primary-700 hover:bg-gray-50 transition font-medium">Rent Room (Private Room)</div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-1">Listing Title <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        {...register('title', { required: 'Title is required' })} 
                        className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" 
                        placeholder="e.g. Spacious 2BHK Flat near MIT ADT Main Gate" 
                      />
                      <p className="text-[13px] text-gray-500 mt-1.5">A descriptive title helps tenants find your property faster</p>
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Exact Address <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          {...register('address', { required: 'Address is required' })} 
                          className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" 
                          placeholder="e.g. 45 Koregaon Park Road" 
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">City</label>
                        <input 
                          type="text" 
                          {...register('city')} 
                          className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" 
                        />
                      </div>
                    </div>

                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100/50">
                      <label className="block text-[15px] font-semibold text-gray-900 flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-orange-600" /> Flat / Building / Street
                      </label>
                      <p className="text-[13px] text-orange-700 mb-3">Admin only; never shown public.</p>
                      <input 
                        type="text" 
                        {...register('adminAddress', { required: 'This internal field is required' })} 
                        className="mt-1 block w-full rounded-xl border border-orange-200 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 hover:border-orange-300 transition-all duration-200 p-3.5 text-gray-800 placeholder-gray-400 bg-white focus:outline-none" 
                        placeholder="e.g. Flat 402, Sunshine Towers" 
                      />
                      {errors.adminAddress && <p className="text-red-500 text-xs mt-1">{errors.adminAddress.message}</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[15px] font-semibold text-gray-800">Property Location on Map</label>
                        <button 
                          type="button" 
                          onClick={handleGetLocation}
                          disabled={isLocating}
                          className="text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                          {isLocating ? 'Locating...' : 'Use my current location'}
                        </button>
                      </div>
                      <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden border border-gray-300 shadow-sm mt-1">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          scrolling="no" 
                          marginHeight="0" 
                          marginWidth="0" 
                          src={`https://maps.google.com/maps?q=${gpsLocation || watch('address') || watch('city') || 'Pune, Maharashtra'}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          title="Property Location"
                        ></iframe>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-1">Description <span className="text-red-500">*</span></label>
                      <div className="relative mt-1">
                        <textarea 
                          {...register('description', { required: 'Description is required' })} 
                          rows="5" 
                          className="block w-full rounded-xl border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-gray-400 transition-all duration-200 p-4 text-gray-800 leading-relaxed resize-none bg-gray-50/50 focus:bg-white placeholder-gray-400" 
                          placeholder="Describe the property, neighborhood, and your ideal tenant... (e.g. Spacious naturally lit apartment in a quiet gated community.)"
                        ></textarea>
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium bg-white/80 px-2 py-1 rounded backdrop-blur-sm shadow-sm border border-gray-100">
                          {watch('description')?.length || 0} characters
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500 mt-1.5">Highlight unique features, nearby landmarks, or specific tenant preferences.</p>
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>
                  </div>

                {/* STEP 2: Configuration */}
                <div className={`space-y-8 animate-fadeIn ${step === 2 ? 'block' : 'hidden'}`}>
                  <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Configuration & Details</h2>
                      <p className="text-sm text-gray-500">Provide specific details to help our AI match you with the right tenants.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">BHK <span className="text-red-500">*</span></label>
                        <select {...register('bhk')} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none cursor-pointer">
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Bathrooms <span className="text-red-500">*</span></label>
                        <select {...register('bathrooms')} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none cursor-pointer">
                          {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Balconies</label>
                        <select {...register('balconies')} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none cursor-pointer">
                          {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Area (sq.ft) <span className="text-red-500">*</span></label>
                        <input type="number" {...register('areaSqft', { required: 'Required' })} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" placeholder="e.g. 1200" />
                        {errors.areaSqft && <p className="text-red-500 text-xs mt-1">{errors.areaSqft.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Floor Number <span className="text-red-500">*</span></label>
                        <input type="number" {...register('floorNumber', { required: 'Required' })} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" placeholder="e.g. 4" />
                        {errors.floorNumber && <p className="text-red-500 text-xs mt-1">{errors.floorNumber.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Total Floors <span className="text-red-500">*</span></label>
                        <input type="number" {...register('totalFloors', { required: 'Required' })} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" placeholder="e.g. 10" />
                        {errors.totalFloors && <p className="text-red-500 text-xs mt-1">{errors.totalFloors.message}</p>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Water Supply</label>
                        <select {...register('waterSupply')} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none cursor-pointer">
                          {['24/7 Corporation', 'Borewell', 'Corporation & Borewell', 'Specific Timings'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-1">Parking</label>
                        <select {...register('parking')} className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none cursor-pointer">
                          {['None', 'Two-wheeler', 'Four-wheeler', 'Both'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2">Furnishing Status <span className="text-red-500">*</span></label>
                      <div className="flex gap-4">
                        {['furnished', 'semi-furnished', 'unfurnished'].map(status => (
                          <label key={status} className="flex-1 cursor-pointer">
                            <input type="radio" value={status} {...register('furnishingStatus')} className="peer sr-only" />
                            <div className="p-3 text-center border border-gray-300 rounded-xl peer-checked:bg-primary-50 peer-checked:border-primary-600 peer-checked:text-primary-700 hover:bg-gray-50 transition capitalize font-medium">
                              {status.replace('-', ' ')}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-2">Property Age</label>
                        <div className="flex gap-3">
                          {['New', '1-5 Years', '5-10 Years', '10+ Years'].map(age => (
                            <label key={age} className="flex-1 cursor-pointer">
                              <input type="radio" value={age} {...register('propertyAge')} className="peer sr-only" />
                              <div className="p-2.5 text-center text-sm border border-gray-300 rounded-lg peer-checked:bg-primary-50 peer-checked:border-primary-600 peer-checked:text-primary-700 hover:bg-gray-50 transition font-medium">
                                {age}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[15px] font-semibold text-gray-800 mb-2">Non-Veg Allowed?</label>
                        <div className="flex gap-4">
                          <label className="flex-1 cursor-pointer">
                            <input type="radio" value="true" {...register('nonVegAllowed')} className="peer sr-only" />
                            <div className="p-2.5 text-center text-sm border border-gray-300 rounded-lg peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 hover:bg-gray-50 transition font-medium">Yes</div>
                          </label>
                          <label className="flex-1 cursor-pointer">
                            <input type="radio" value="false" {...register('nonVegAllowed')} className="peer sr-only" />
                            <div className="p-2.5 text-center text-sm border border-gray-300 rounded-lg peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 hover:bg-gray-50 transition font-medium">No</div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200 my-6" />

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Pricing</h2>
                      <p className="text-sm text-gray-500 mb-6">Set your expected rent and deposit amounts.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[15px] font-semibold text-gray-800 mb-1">Monthly Rent (₹) <span className="text-red-500">*</span></label>
                          <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">₹</span>
                            <input type="number" {...register('rentAmount', { required: 'Required' })} className="block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 pl-8 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" placeholder="e.g. 25000" />
                          </div>
                          {errors.rentAmount && <p className="text-red-500 text-xs mt-1">{errors.rentAmount.message}</p>}
                        </div>
                        <div>
                          <label className="block text-[15px] font-semibold text-gray-800 mb-1">Security Deposit (₹) <span className="text-red-500">*</span></label>
                          <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">₹</span>
                            <input type="number" {...register('securityDeposit', { required: 'Required' })} className="block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 pl-8 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" placeholder="e.g. 75000" />
                          </div>
                          {errors.securityDeposit && <p className="text-red-500 text-xs mt-1">{errors.securityDeposit.message}</p>}
                        </div>
                        <div>
                          <label className="block text-[15px] font-semibold text-gray-800 mb-1">Maintenance (₹) <span className="text-gray-400 font-normal ml-1">/mo</span></label>
                          <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">₹</span>
                            <input type="number" {...register('maintenance')} className="block w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 transition-all duration-200 p-3.5 pl-8 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none" placeholder="e.g. 2000" />
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
                {/* STEP 3: Photos & Amenities */}
                <div className={`space-y-8 animate-fadeIn ${step === 3 ? 'block' : 'hidden'}`}>
                  <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Media & Amenities</h2>
                      <p className="text-sm text-gray-500">Upload high-quality photos and videos, and select all available amenities.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[15px] font-semibold text-gray-800">Property Photos <span className="text-red-500">*</span></label>
                        <span className="text-xs text-gray-500 font-medium">{photos.length} / 10 uploaded</span>
                      </div>
                      
                      <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-primary-400 transition-colors cursor-pointer relative group">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <UploadCloud className="w-10 h-10 text-primary-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-gray-700">Drag & drop photos here, or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG (Max 10 files)</p>
                      </div>

                      {photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                          {photos.map((photo, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                              <img src={photo.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => removePhoto(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[15px] font-semibold text-gray-800">Property Videos (Optional)</label>
                        <span className="text-xs text-gray-500 font-medium">{videos.length} / 2 uploaded</span>
                      </div>
                      
                      <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-primary-400 transition-colors cursor-pointer relative group">
                        <input 
                          type="file" 
                          multiple 
                          accept="video/*" 
                          onChange={handleVideoUpload} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Video className="w-10 h-10 text-primary-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-gray-700">Drag & drop videos here, or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">Supports MP4, WebM (Max 2 files)</p>
                      </div>

                      {videos.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {videos.map((video, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-black aspect-video flex items-center justify-center">
                              <video src={video.preview} className="w-full h-full object-contain" controls />
                              <button 
                                type="button" 
                                onClick={() => removeVideo(idx)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-gray-200 my-8" />

                    <div>
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Amenities & Features</h3>
                        <p className="text-sm text-gray-500">Select all that apply. Properties with more amenities rank higher in tenant searches.</p>
                      </div>
                      
                      <div className="space-y-6">
                        {amenitiesCategories.map(category => (
                          <div key={category.title}>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">{category.title}</h4>
                            <div className="flex flex-wrap gap-3">
                              {category.items.map(amenity => (
                                <label key={amenity} className="relative cursor-pointer">
                                  <input type="checkbox" value={amenity} {...register('amenities')} className="peer sr-only" />
                                  <div className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full peer-checked:bg-primary-50 peer-checked:text-primary-700 peer-checked:border-primary-500 hover:bg-gray-50 transition-all select-none shadow-sm">
                                    {amenity}
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                {/* STEP 4: Review */}
                <div className={`space-y-6 animate-fadeIn ${step === 4 ? 'block' : 'hidden'}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Review your Listing</h2>
                    
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                      <div>
                        <h3 className="text-sm text-gray-500 font-medium">Property Title</h3>
                        <p className="font-bold text-gray-900 text-lg">{watch('title')}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-gray-100">
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Rent</h3>
                          <p className="font-bold text-primary-700">₹{watch('rentAmount')} <span className="text-xs font-normal text-gray-500">/mo</span></p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Deposit</h3>
                          <p className="font-semibold">₹{watch('securityDeposit')}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Maintenance</h3>
                          <p className="font-semibold">₹{watch('maintenance') || 0}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Area</h3>
                          <p className="font-semibold">{watch('areaSqft')} sqft</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Configuration</h3>
                          <p className="font-semibold">{watch('bhk')} BHK • {watch('bathrooms')} Baths</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Furnishing</h3>
                          <p className="font-semibold capitalize">{watch('furnishingStatus')?.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Floor</h3>
                          <p className="font-semibold">{watch('floorNumber')} of {watch('totalFloors')}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-gray-500 font-medium">Parking</h3>
                          <p className="font-semibold">{watch('parking')}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-500 font-medium">Public Address</h3>
                        <p className="font-semibold">{watch('address')}, {watch('city')}</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-primary-800">
                        Once submitted, your listing will instantly be analyzed by our AI Compatibility Engine to start matching you with verified tenants!
                      </p>
                    </div>
                  </div>

                {/* Navigation Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                  {step > 1 ? (
                    <button type="button" onClick={handlePrev} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <div></div> // Empty div to push next button to right
                  )}
                  
                  {step < 4 ? (
                    <button type="button" onClick={handleNext} className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition shadow-sm flex items-center gap-2">
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition shadow-sm flex items-center gap-2 disabled:opacity-70">
                      {isSubmitting ? 'Publishing...' : 'Publish Listing'} <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* Bottom Informative Panels */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          
          {/* Why list on RentMate Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Why list on RentMate?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">AI-Powered Matching</p>
                  <p className="text-xs text-gray-500 mt-1">We analyze tenant lifestyles to ensure perfect harmony in your property.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Zero Brokerage Fees</p>
                  <p className="text-xs text-gray-500 mt-1">Connect directly with tenants without paying massive middleman commissions.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Verified Tenant Profiles</p>
                  <p className="text-xs text-gray-500 mt-1">Say goodbye to spam. Tenants are verified and filtered for high compatibility.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Secure In-App Chat</p>
                  <p className="text-xs text-gray-500 mt-1">Communicate instantly without revealing your personal contact number initially.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* AI Support Chat Panel */}
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 flex flex-col overflow-hidden h-[400px]">
            <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-500" /> RentMate AI Assistant
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/50">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-400 rounded-2xl rounded-bl-none px-4 py-2 text-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0">
              <form onSubmit={handleSendChat} className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about RentMate..." 
                  className="w-full bg-gray-800 border border-gray-700 rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-gray-500"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isChatLoading}
                  className="absolute right-1.5 top-1.5 p-1.5 bg-primary-600 rounded-full text-white hover:bg-primary-500 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateListing;
