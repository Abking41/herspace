import React, { useState } from 'react';
import { Globe, Search, ExternalLink, Sparkles, BookOpen, GraduationCap, Newspaper, Lightbulb } from 'lucide-react';

export const LiveSearchAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [resultText, setResultText] = useState('');
  const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const presets = [
    'Recent breakthroughs in Artificial Intelligence 2026',
    'Latest research methodology guidelines for college papers',
    'Cognitive neuroscience study retention strategies',
    'How to structure a literature review introduction',
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || isLoading) return;
    setQuery(searchQuery);
    setIsLoading(true);
    setResultText('');
    setSources([]);

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search grounding failed.');

      setResultText(data.text || '');
      setSources(data.sources || []);
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setResultText(`Error retrieving search grounded data: ${err?.message || 'Failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="live-search-grounding-card" className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-rose-100 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-xs">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            Live Research & Google Search Grounding
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Powered by gemini-3.5-flash with Google Search data
          </p>
        </div>
      </div>

      {/* Preset Topics */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSearch(p)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50/70 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-200 border border-blue-100 dark:border-slate-700 whitespace-nowrap transition-colors text-[11px]"
          >
            <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="live-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search academic topics, recent developments, facts..."
            className="w-full bg-slate-50 dark:bg-slate-800/70 pl-9 pr-3 py-2 rounded-2xl text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>
        <button
          id="execute-live-search-btn"
          onClick={() => handleSearch(query)}
          disabled={isLoading || !query.trim()}
          className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin" />
          Querying Google Search Grounding...
        </div>
      )}

      {/* Output Content */}
      {resultText && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
          {resultText}
        </div>
      )}

      {/* Citations / Sources */}
      {sources.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Globe className="w-3 h-3 text-blue-500" />
            Verified Search Sources:
          </h4>
          <div className="flex flex-wrap gap-2">
            {sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 text-xs text-blue-600 dark:text-blue-300 shadow-2xs transition-colors"
              >
                <span className="truncate max-w-[200px]">{src.title}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
