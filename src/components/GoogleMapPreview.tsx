'use client';

import { useState, useEffect } from 'react';
import { MapPin, Eye, EyeOff, ExternalLink, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with webpack
let L: any = null;

interface GoogleMapPreviewProps {
  mapUrl: string;
  className?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

// Event handler component using useMapEvents
const MapEvents: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-leaflet').then((reactLeaflet) => {
        const { useMapEvents } = reactLeaflet;
        
        const EventsComponent = () => {
          useMapEvents({
            click: (e: any) => {
              // Prevent default map behaviors that might cause zoom
              if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
              }
              
              const { lat, lng } = e.latlng;
              onLocationSelect(lat, lng);
            },
          });
          return null;
        };
        
        setComponent(() => EventsComponent);
      });
    }
  }, [onLocationSelect]);

  return Component ? <Component /> : null;
};

const GoogleMapPreview: React.FC<GoogleMapPreviewProps> = ({ 
  mapUrl, 
  className = '',
  onLocationSelect
}) => {
  const [showPreview, setShowPreview] = useState(true); // Show by default
  const [position, setPosition] = useState<[number, number]>([36.7538, 3.0588]); // Default: Algiers
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Import Leaflet only on client side
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        L = leaflet.default;
        
        // Fix default icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, []);

  // Extract coordinates from Google Maps URL
  const extractCoordinates = (url: string): [number, number] | null => {
    if (!url || !url.includes('google.com/maps')) return null;
    
    // Extract coordinates from @lat,lng format
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      return [lat, lng];
    }
    
    return null;
  };

  useEffect(() => {
    const coords = extractCoordinates(mapUrl);
    if (coords) {
      setPosition(coords);
    }
  }, [mapUrl]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  if (!mapUrl) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center ${className}`}>
        <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">لا يوجد رابط خرائط جوجل</p>
        <p className="text-gray-400 text-xs mt-1">أضف رابط خرائط جوجل لعرض المعاينة</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <MapPin className="w-4 h-4 text-[#24697f]" />
          <span className="text-sm font-medium text-gray-700">معاينة وتحديد الموقع</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPreview(!showPreview);
            }}
            className="flex items-center space-x-1 space-x-reverse text-xs text-[#24697f] hover:text-[#1a5366] transition-colors"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3 h-3" />
                <span>إخفاء</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span>عرض</span>
              </>
            )}
          </button>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(mapUrl, '_blank', 'noopener,noreferrer');
            }}
            className="flex items-center space-x-1 space-x-reverse text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>فتح في جوجل</span>
          </a>
        </div>
      </div>

      {showPreview && isClient && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
              <span className="text-xs font-medium text-gray-700">
                انقر على الخريطة لتحديد موقع جديد
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              className="rounded-2xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  <div className="text-center">
                    <p className="font-medium text-sm">موقع العقار</p>
                    <p className="text-xs text-gray-600">
                      {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <MapEvents onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapPreview;
