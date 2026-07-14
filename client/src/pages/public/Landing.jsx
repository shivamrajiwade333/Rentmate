import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, MessageCircle, ShieldCheck, Mail, MapPin, Phone, Apple, Play } from 'lucide-react';

const Counter = ({ end, duration = 2500, suffix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic for a smoother, slower end
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCount(easeProgress * end);
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [end, duration, hasAnimated]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">Find your perfect</span>{' '}
                <span className="block text-primary-600 xl:inline">room & flatmate.</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                RentMate uses advanced AI compatibility matching to connect you with the ideal living space and verified flatmates based on your budget, lifestyle, and preferences.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                <Link to="/register?role=tenant" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-primary-600 hover:bg-primary-700 transition transform hover:-translate-y-1">
                  Find a Flatmate
                </Link>
                <Link to="/register?role=owner" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition transform hover:-translate-y-1">
                  List a Property
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 sm:justify-center lg:justify-start">
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary-500"/> AI Matching</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary-500"/> Verified Profiles</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary-500"/> Secure Chat</div>
              </div>
            </div>
            
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden">
                <img
                  className="w-full h-auto object-cover"
                  src="/hero.png"
                  alt="Happy flatmates in a beautiful living room"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent mix-blend-multiply"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-100 opacity-50 blur-3xl z-0"></div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-700 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl mb-4">
              We connect you directly to verified owners, no middlemen, no hidden fees.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-primary-600">
            <div className="py-4 md:py-0">
              <p className="text-4xl font-extrabold text-white mb-2">
                <Counter end={1200} suffix="+" duration={3000} />
              </p>
              <p className="text-primary-100 font-medium">Happy Tenants</p>
            </div>
            <div className="py-4 md:py-0">
              <p className="text-4xl font-extrabold text-white mb-2">
                <Counter end={480} suffix="+" duration={3000} />
              </p>
              <p className="text-primary-100 font-medium">Happy Owners</p>
            </div>
            <div className="py-4 md:py-0">
              <p className="text-4xl font-extrabold text-white mb-2">
                <Counter end={25} suffix="k+" duration={3000} />
              </p>
              <p className="text-primary-100 font-medium">Brokerage Saved ($)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A Better Way to Rent
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Everything you need to find a harmonious living situation without the usual stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-lg transition">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-6">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Compatibility</h3>
              <p className="text-gray-500">
                Our advanced engine analyzes your lifestyle preferences, budget, and habits to calculate a highly accurate match score for every room.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-lg transition">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-6">
                <MessageCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Real-time Chat</h3>
              <p className="text-gray-500">
                Connect instantly with property owners and potential flatmates through our built-in, secure Socket.IO messaging platform.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-lg transition">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-6">
                <ShieldCheck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Interests</h3>
              <p className="text-gray-500">
                Say goodbye to spam. Tenants must actively express interest, and communication only opens once the owner reviews and accepts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-1 bg-gray-200 -z-10"></div>
            
            <div className="flex flex-col items-center bg-white p-4 relative z-10 w-full md:w-1/4">
              <div className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6 ring-4 ring-white">1</div>
              <h3 className="text-xl font-bold mb-2">Create Profile</h3>
              <p className="text-gray-500 text-center">Tell us about your budget, lifestyle, and what you're looking for.</p>
            </div>
            
            <div className="flex flex-col items-center bg-white p-4 relative z-10 w-full md:w-1/4">
              <div className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6 ring-4 ring-white">2</div>
              <h3 className="text-xl font-bold mb-2">Get AI Matches</h3>
              <p className="text-gray-500 text-center">Browse listings ranked by an AI compatibility score specifically tailored to you.</p>
            </div>
            
            <div className="flex flex-col items-center bg-white p-4 relative z-10 w-full md:w-1/4">
              <div className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6 ring-4 ring-white">3</div>
              <h3 className="text-xl font-bold mb-2">Express Interest</h3>
              <p className="text-gray-500 text-center">Send an interest request to property owners with your verified tenant profile.</p>
            </div>

            <div className="flex flex-col items-center bg-white p-4 relative z-10 w-full md:w-1/4">
              <div className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6 ring-4 ring-white">4</div>
              <h3 className="text-xl font-bold mb-2">Connect & Move In</h3>
              <p className="text-gray-500 text-center">Once accepted, chat securely in-app and finalize your new home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer id="contact" className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white p-1 rounded-md inline-block">
                <img src="/logo.png" alt="RentMate Logo" className="h-8 w-auto object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight">RentMate</span>
            </div>
            <p className="text-gray-400 max-w-sm mb-6">
              The smartest way to find a flatmate. Built for modern renters and proactive owners.
            </p>
            
            {/* App Store Buttons */}
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg transition opacity-80 cursor-not-allowed group relative">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] leading-tight text-gray-400">Download on the</div>
                  <div className="text-sm font-semibold leading-tight">App Store</div>
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold">Coming Soon</span>
                </div>
              </button>
              
              <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg transition opacity-80 cursor-not-allowed group relative">
                <Play className="w-5 h-5 ml-1" />
                <div className="text-left pl-1">
                  <div className="text-[10px] leading-tight text-gray-400">GET IT ON</div>
                  <div className="text-sm font-semibold leading-tight">Google Play</div>
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold">Coming Soon</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="md:col-span-1 md:ml-auto">
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/listings" className="hover:text-white transition">Browse Listings</Link></li>
              <li><Link to="/register?role=tenant" className="hover:text-white transition">Sign Up as Tenant</Link></li>
              <li><Link to="/register?role=owner" className="hover:text-white transition">Sign Up as Owner</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2 md:ml-auto">
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500" /> support@rentmate.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500" /> +91 85309 10486
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-500" /> Pune, Maharashtra
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RentMate Platform. All rights reserved. Built for Unthinkable Company.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
