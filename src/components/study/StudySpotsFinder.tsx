import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Navigation, ExternalLink, Sparkles, Coffee, BookOpen, Trees, Building } from 'lucide-react';

export const StudySpotsFinder: React.FC = () => {
  const [query, setQuery] = useState('Quiet study cafes and public libraries with Wi-Fi');
  const [places, setPlaces] = useState<Array<{ title: string; uri: string; snippet?: string }>>([]);
  const [responseNotes, setResponseNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [useGeo, setUseGeo] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const spotPresets = [
    { label: 'Quiet Study Cafes', icon: Coffee, q: 'Quiet aesthetic study cafes with strong Wi-Fi and good seating' },
    { label: 'Public Libraries', icon: BookOpen, q: 'Peaceful public libraries and reading rooms nearby' },
    { label: 'Mindful Parks', icon: Trees, q: 'Serene tranquil parks or botanical gardens for mindful reading' },
    { label: 'Bookstores & Lounges', icon: Building, q: 'Quiet bookshops or study lounges' },
  ];

  const searchPlaces = async (searchQuery: string) => {
    setIsLoading(true);
    setStatusMessage('');
    setQuery(searchQuery);

    try {
      let lat: number | undefined;
      let lng: number | undefined;

      if (useGeo && navigator.geolocation) {
        setStatusMessage('Acquiring location...');
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (geoErr) {
          console.warn('Geolocation unavailable:', geoErr);
        }
      }

      setStatusMessage('Querying Google Maps Grounding with gemini-3.5-flash...');

      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          latitude: lat,
          longitude: lng,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search places.');

      setResponseNotes(data.text || '');
      setPlaces(data.places || []);
      setStatusMessage('');
    } catch (err: any) {
      console.error('Maps error:', err);
      setStatusMessage(`Error: ${err?.message || 'Failed to load places'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="study-spots-finder" className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-rose-100 dark:border-slate-800 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Study Spots & Peaceful Spaces
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Powered by Google Maps Grounding (gemini-3.5-flash)
            </p>
          </div>
        </div>

        <button
          onClick={() => setUseGeo(!useGeo)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
            useGeo
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
          title="Toggle geolocation"
        >
          <Navigation className="w-3 h-3" />
          <span>{useGeo ? 'Near Me' : 'Global'}</span>
        </button>
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {spotPresets.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <button
              key={idx}
              onClick={() => searchPlaces(preset.q)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/70 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-200 border border-rose-100 dark:border-slate-700 whitespace-nowrap transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-500" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="study-spots-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchPlaces(query)}
            placeholder="Search for cozy study corners, libraries, parks..."
            className="w-full bg-slate-50 dark:bg-slate-800/70 pl-9 pr-3 py-2 rounded-2xl text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>
        <button
          id="search-study-spots-btn"
          onClick={() => searchPlaces(query)}
          disabled={isLoading || !query.trim()}
          className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore</span>
        </button>
      </div>

      {/* Loading / Status */}
      {statusMessage && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
          {statusMessage}
        </p>
      )}

      {/* AI Summary Notes */}
      {responseNotes && (
        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {responseNotes}
        </div>
      )}

      {/* Places List */}
      {places.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            Verified Google Maps Locations:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {places.map((place, idx) => (
              <a
                key={idx}
                href={place.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-all flex items-start justify-between group shadow-xs"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {place.title}
                  </div>
                  {place.snippet && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {place.snippet}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                    Open in Google Maps
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
