import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Crosshair,
  ExternalLink,
  Loader2,
  Check,
  Compass,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SchoolMapPickerProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  onChange: (coords: { latitude: number; longitude: number; zoom?: number }) => void;
}

// Custom modern SVG marker for school
const createSchoolPinIcon = () => {
  return L.divIcon({
    className: 'school-map-pin',
    html: `
      <div style="position: relative; width: 40px; height: 40px; transform: translate(-50%, -100%);">
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0B2545 0%, #134074 100%);
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 8px 16px rgba(11,37,69,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
        ">
          <div style="transform: rotate(45deg); color: #F5A623; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
              <path d="M6 6h10"></path>
              <path d="M6 10h10"></path>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export const SchoolMapPicker: React.FC<SchoolMapPickerProps> = ({
  latitude = 36.8065,
  longitude = 10.1815,
  zoom = 15,
  onChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [quickLink, setQuickLink] = useState('');
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  // Keep a stable ref for onChange to avoid recreation
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Update marker position
  const setPosition = useCallback(
    (lat: number, lng: number, newZoom?: number) => {
      const validLat = Number(lat.toFixed(6));
      const validLng = Number(lng.toFixed(6));

      if (markerRef.current) {
        markerRef.current.setLatLng([validLat, validLng]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([validLat, validLng], newZoom ?? mapInstanceRef.current.getZoom());
      }
      onChangeRef.current({
        latitude: validLat,
        longitude: validLng,
        zoom: newZoom ?? (mapInstanceRef.current?.getZoom() || zoom),
      });
    },
    [zoom]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = isNaN(latitude) || latitude === 0 ? 36.8065 : latitude;
    const initialLng = isNaN(longitude) || longitude === 0 ? 10.1815 : longitude;
    const initialZoom = zoom || 15;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributeurs',
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: createSchoolPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.bindPopup('<b>FLS School</b><br>Emplacement sélectionné');

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChangeRef.current({
        latitude: Number(pos.lat.toFixed(6)),
        longitude: Number(pos.lng.toFixed(6)),
        zoom: map.getZoom(),
      });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChangeRef.current({
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6)),
        zoom: map.getZoom(),
      });
    });

    map.on('zoomend', () => {
      const pos = marker.getLatLng();
      onChangeRef.current({
        latitude: Number(pos.lat.toFixed(6)),
        longitude: Number(pos.lng.toFixed(6)),
        zoom: map.getZoom(),
      });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync external coordinates changes to marker
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (isNaN(latitude) || isNaN(longitude) || latitude === 0) return;

    const currentPos = markerRef.current.getLatLng();
    const diffLat = Math.abs(currentPos.lat - latitude);
    const diffLng = Math.abs(currentPos.lng - longitude);

    if (diffLat > 0.0001 || diffLng > 0.0001) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Search location using OpenStreetMap Nominatim API
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`,
        {
          headers: {
            'Accept-Language': 'fr,ar,en',
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const found = data[0];
        const newLat = parseFloat(found.lat);
        const newLng = parseFloat(found.lon);
        setPosition(newLat, newLng, 16);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsSearching(false);
    }
  };

  // Geolocate with browser GPS
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos.coords.latitude, pos.coords.longitude, 16);
        setIsGeolocating(false);
      },
      () => {
        setIsGeolocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Parse pasted Google Maps link or coordinates
  const handlePasteLink = (val: string) => {
    setQuickLink(val);
    setParseStatus(null);
    if (!val.trim()) return;

    const trimmed = val.trim();

    // 1. Direct coordinates pattern: "36.8065, 10.1815" or "36.8065 10.1815"
    const coordMatch = trimmed.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setPosition(lat, lng, 16);
        setParseStatus('Coordonnées appliquées avec succès !');
        return;
      }
    }

    // 2. Google Maps URL patterns: @36.8065,10.1815 or q=36.8065,10.1815 or ll=36.8065,10.1815
    const urlCoordMatch = trimmed.match(/(?:@|q=|ll=)(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlCoordMatch) {
      const lat = parseFloat(urlCoordMatch[1]);
      const lng = parseFloat(urlCoordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setPosition(lat, lng, 16);
        setParseStatus('Emplacement extrait du lien Google Maps !');
        return;
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une ville, quartier ou avenue (ex: Tunis, Ariana, La Marsa...)"
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
            className="h-9 px-3 text-xs rounded-xl bg-slate-800 hover:bg-slate-900 text-white shrink-0 font-medium"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Rechercher'}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          onClick={handleCurrentLocation}
          disabled={isGeolocating}
          className="h-9 px-3 text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 font-medium flex items-center gap-1.5"
          title="Centrer sur ma position GPS actuelle"
        >
          {isGeolocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-brand-600" />
          )}
          <span>Ma position</span>
        </Button>
      </div>

      {/* Map View */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <div
          ref={mapContainerRef}
          style={{ height: '340px', width: '100%', zIndex: 1 }}
          className="cursor-crosshair"
        />

        {/* Floating Instruction Badge */}
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-brand-600" />
          <span>Cliquez sur la carte ou glissez le repère pour positionner l'école</span>
        </div>
      </div>

      {/* Coordinates readout & Google Maps paste helper */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
        {/* Latitude & Longitude displays */}
        <div className="sm:col-span-5 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Latitude</span>
            <Input
              type="number"
              step="0.000001"
              value={latitude || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setPosition(val, longitude);
              }}
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Longitude</span>
            <Input
              type="number"
              step="0.000001"
              value={longitude || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setPosition(latitude, val);
              }}
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>
        </div>

        {/* Quick Paste Box */}
        <div className="sm:col-span-7 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">
              Ou collez un lien / coordonnées Google Maps :
            </span>
            {latitude && longitude && (
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Vérifier sur Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <Input
            value={quickLink}
            onChange={(e) => handlePasteLink(e.target.value)}
            placeholder="Ex: 36.8065, 10.1815 ou https://www.google.com/maps?q=..."
            className="h-8 text-xs rounded-lg"
          />
          {parseStatus && (
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-0.5">
              <Check className="w-3 h-3" />
              {parseStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolMapPicker;
