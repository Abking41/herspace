import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  Heart,
  PenTool,
  Zap,
  Globe,
  MapPin,
  Mic,
  RotateCcw,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  sources?: Array<{ title: string; url: string }>;
  places?: Array<{ title: string; uri: string; snippet?: string }>;
}

interface GeminiChatViewProps {
  onOpenVoiceModal?: () => void;
}

export const GeminiChatView: React.FC<GeminiChatViewProps> = ({ onOpenVoiceModal }) => {
  const { settings } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${settings.userName || 'Sayani'}! 🌸 I am your Gemini AI Companion. I can help you understand tough concepts, draft study schedules, find peaceful cafes or libraries, or do real-time research with Google Search. What would you like to explore together?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Persona Roles
  const [selectedRole, setSelectedRole] = useState<'study_mentor' | 'wellness_companion' | 'writing_coach' | 'exam_prep'>('study_mentor');

  // Speed & Complexity Model Tier
  const [speedMode, setSpeedMode] = useState<'general' | 'fast' | 'complex'>('general');

  // Grounding modes
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        text: `Fresh chat started for you, ${settings.userName || 'Sayani'}! What are we working on now? ✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const newMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: newMsgId,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      if (useMapsGrounding) {
        // Maps Grounding with gemini-3.5-flash (with googleMaps tool)
        let lat: number | undefined;
        let lng: number | undefined;

        if (navigator.geolocation) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch {
            // Proceed without exact coordinates if denied
          }
        }

        const res = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userText,
            latitude: lat,
            longitude: lng,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Maps grounding error');

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.text || 'Here are the recommended locations:',
            places: data.places || [],
            modelUsed: 'gemini-3.5-flash (Google Maps)',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (useSearchGrounding) {
        // Search Grounding with gemini-3.5-flash (with googleSearch tool)
        const res = await fetch('/api/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userText }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search grounding error');

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.text || 'Here is the verified information from Google Search:',
            sources: data.sources || [],
            modelUsed: 'gemini-3.5-flash (Google Search)',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Multi-turn Chat with role system instruction and model tier selection
        const formattedHistory = updatedHistory
          .filter((m) => m.id !== 'welcome' && m.id !== 'reset')
          .map((m) => ({
            role: m.role,
            text: m.text,
          }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: formattedHistory,
            role: selectedRole,
            speedMode,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Chat response error');

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.text || 'Here is my response.',
            modelUsed: data.modelUsed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `I ran into an issue: ${err?.message || 'Network error'}. Please check your connection or GEMINI_API_KEY in Settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'study_mentor', label: 'Study Mentor', icon: GraduationCap, desc: 'Concept clarity & academic structure' },
    { id: 'wellness_companion', label: 'Mindful Friend', icon: Heart, desc: 'Calming reassurance & affirmations' },
    { id: 'writing_coach', label: 'Writing Coach', icon: PenTool, desc: 'Thesis outlines & phrasing improvements' },
    { id: 'exam_prep', label: 'Quizzer', icon: Zap, desc: 'Rapid active recall & memory hooks' },
  ] as const;

  return (
    <div id="gemini-chat-container" className="flex flex-col h-[calc(100vh-135px)] max-w-4xl mx-auto px-3 sm:px-4 py-2">
      {/* Top Controls & Persona Selector */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-rose-100 dark:border-slate-800 shadow-sm mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Sayani’s Gemini Companion
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-turn conversation • Search & Maps Grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenVoiceModal && (
              <button
                id="launch-live-voice-btn"
                onClick={onOpenVoiceModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-medium shadow-sm transition-all"
                title="Start real-time voice conversation using gemini-3.8-live"
              >
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Voice</span>
              </button>
            )}

            <button
              id="clear-chat-history-btn"
              onClick={handleClearHistory}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear conversation history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200 dark:shadow-none'
                    : 'bg-rose-50/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-rose-100/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Model Tier & Grounding Toggles */}
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Model selection */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Model:</span>
            <button
              onClick={() => setSpeedMode('general')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                speedMode === 'general'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              General (3.5-flash)
            </button>
            <button
              onClick={() => setSpeedMode('fast')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                speedMode === 'fast'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Fast (3.1-flash-lite)
            </button>
            <button
              onClick={() => setSpeedMode('complex')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                speedMode === 'complex'
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Deep (3.1-pro)
            </button>
          </div>

          {/* Grounding Tool Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setUseSearchGrounding(!useSearchGrounding);
                if (!useSearchGrounding) setUseMapsGrounding(false);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                useSearchGrounding
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Google Search Grounding with gemini-3.5-flash"
            >
              <Globe className="w-3 h-3" />
              <span>Search Grounding</span>
            </button>

            <button
              onClick={() => {
                setUseMapsGrounding(!useMapsGrounding);
                if (!useMapsGrounding) setUseSearchGrounding(false);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                useMapsGrounding
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Google Maps Grounding with gemini-3.5-flash"
            >
              <MapPin className="w-3 h-3" />
              <span>Maps Grounding</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Thread (Scrollable) */}
      <div
        id="chat-messages-thread"
        className="flex-1 overflow-y-auto px-2 space-y-3.5 pr-1"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                  isUser
                    ? 'bg-rose-400'
                    : 'bg-gradient-to-tr from-pink-500 to-rose-500'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[84%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-rose-500 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-rose-100/80 dark:border-slate-700 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Google Maps Grounding Results */}
                {msg.places && msg.places.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Google Maps Locations:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.places.map((place, pIdx) => (
                        <a
                          key={pIdx}
                          href={place.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-600 transition-colors group"
                        >
                          <div>
                            <div className="font-medium text-xs text-slate-800 dark:text-slate-100 group-hover:text-emerald-600">
                              {place.title}
                            </div>
                            {place.snippet && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {place.snippet}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Search Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                    <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Google Search Sources:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[10px] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                        >
                          <span className="truncate max-w-[150px]">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bubble Footer info */}
                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-rose-100' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {msg.modelUsed && <span>{msg.modelUsed}</span>}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 border border-rose-100 dark:border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-1">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 bg-white dark:bg-slate-900 rounded-2xl p-2 border border-rose-100 dark:border-slate-800 shadow-sm flex items-center gap-2"
      >
        <input
          id="gemini-chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            useMapsGrounding
              ? 'Ask for quiet study cafes, libraries, or serene spots...'
              : useSearchGrounding
              ? 'Ask for up-to-date research or facts with Google Search...'
              : `Ask your ${selectedRole.replace('_', ' ')} anything, Sayani...`
          }
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />

        <button
          id="send-gemini-chat-btn"
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-medium shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
