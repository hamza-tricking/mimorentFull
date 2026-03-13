'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, Building, Mail } from 'lucide-react';

interface Office {
  _id: string;
  name: string;
  address: string;
  phone: string;
  wilayaId: {
    _id: string;
    name: string;
  };
}

interface OfficeContactCardsProps {
  className?: string;
}

export default function OfficeContactCards({ className = '' }: OfficeContactCardsProps) {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await fetch('https://dmtart.pro/mimorent/api/offices');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data.offices)) {
          setOffices(data.data.offices);
        } else {
          setError('Failed to fetch offices - invalid response format');
        }
      } catch (err) {
        setError('Error fetching offices');
        console.error('Fetch error details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
    
    // Trigger visibility animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCallClick = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-20 ${className}`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#24697F] to-[#2a7d94] opacity-20 blur-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <Mail className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (offices.length === 0) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Building className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No offices available</p>
      </div>
    );
  }

  return (
    <section className={`relative py-20 overflow-hidden ${className}`}>
      {/* Background matching website theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#24697F]/5 via-[#2a7d94]/5 to-[#1e5f73]/5"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#24697F]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#2a7d94]/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#24697F] to-[#2a7d94] rounded-2xl mb-6 shadow-xl">
            <Building className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#24697F] via-[#2a7d94] to-[#1e5f73] bg-clip-text text-transparent mb-6">
            Contact Our Offices
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our nearest office for immediate assistance with your rental needs. Our dedicated team is ready to help you find the perfect property.
          </p>
        </div>

        {/* Office Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offices.map((office, index) => (
            <div
              key={office._id}
              className={`group relative transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Card with gradient border */}
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#24697F] via-[#2a7d94] to-[#1e5f73]"></div>
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#24697F]/5 via-[#2a7d94]/5 to-[#1e5f73]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative p-8">
                  {/* Office Name */}
                  <div className="mb-6">
                    <h3 className="text-2xl text-center font-bold text-gray-900 group-hover:text-[#24697F] transition-colors duration-300">
                      {office.name}
                    </h3>
                  </div>

                  {/* Office Details */}
                  <div className="space-y-4 mb-8">
                    {/* Address */}
                    <div className="flex items-start group/item">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mr-3 flex-shrink-0 group-hover/item:bg-[#24697F]/10 transition-colors duration-300">
                        <MapPin className="h-5 w-5 text-gray-500 group-hover/item:text-[#24697F] transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium leading-relaxed">{office.address}</p>
                        <p className="text-gray-500 text-sm mt-1">{office.wilayaId?.name}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center group/item">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mr-3 flex-shrink-0 group-hover/item:bg-[#24697F]/10 transition-colors duration-300">
                        <Phone className="h-5 w-5 text-gray-500 group-hover/item:text-[#24697F] transition-colors duration-300" />
                      </div>
                      <p className="text-gray-700 font-medium">{office.phone}</p>
                    </div>
                  </div>

                  {/* Call Button */}
                  <button
                    onClick={() => handleCallClick(office.phone)}
                    className="w-full bg-gradient-to-r from-[#24697F] via-[#2a7d94] to-[#1e5f73] hover:from-[#1e5f73] hover:via-[#24697F] hover:to-[#2a7d94] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center group/btn"
                  >
                    <Phone className="h-5 w-5 mr-2 group-hover/btn:animate-pulse" />
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
