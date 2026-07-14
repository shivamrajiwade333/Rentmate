import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactFooter = () => {
  return (
    <div className="bg-gray-900 text-white py-12 mt-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4">RentMate</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Your trusted platform to find the perfect rooms and the most compatible flatmates. Making renting simple, social, and safe.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-primary-500" /> support@rentmate.com
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-primary-500" /> +91 98765 43210
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-primary-500" /> Tech Park, Pune, India
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-primary-500 transition">About Us</a></li>
              <li><a href="#" className="hover:text-primary-500 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-500 transition">Help Center</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RentMate. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ContactFooter;
