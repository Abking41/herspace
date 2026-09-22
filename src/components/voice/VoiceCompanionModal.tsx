import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  Send,
  HelpCircle,
  Brain,
  Coffee,
  HeartHandshake,
} from 'lucide-react';
import { floatTo16BitPCM, arrayBufferToBase64, LiveAudioPlayer } from '../../lib/liveAudio';
import { useApp } from '../../context/AppContext';

interface VoiceCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCompanionModal: React.FC<VoiceCompanionModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useApp();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ sender: 'user' | 'model'; text: string }>>([
    {
      sender: 'model',
      text: `Hi ${settings.userName || 'Sayani'}! I'm your Gemini Live voice companion. How can I help you today?`,
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Connect to Gemini Live WebSocket
  const startSession = async () => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);

      // Initialize audio player (24kHz output)
      if (!playerRef.current) {
        playerRef.current = new LiveAudioPlayer();
      }
      await playerRef.current.resume();

      // Request microphone (16kHz input)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      // 4096 buffer size
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      // Connect WebSocket to /api/live-audio
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-audio`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setErrorMessage(data.error);
            setIsConnected(false);
            return;
          }

          if (data.interrupted) {
            playerRef.current?.stopAll();
            setIsSpeaking(false);
          }

          if (data.audio) {
            setIsSpeaking(true);
            playerRef.current?.playChunk(data.audio);
            // Auto turn off speaking indicator after pause
            setTimeout(() => {
              setIsSpeaking(false);
            }, 1200);
          }
        } catch (err) {
          console.error('Error handling live message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Live error:', err);
        setErrorMessage('Connection error with Gemini Live. Please verify your GEMINI_API_KEY in Settings.');
        setIsConnecting(false);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

      // Stream mic audio to server
      processor.onaudioprocess = (e) => {
        if (!isMuted && ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          // Simple amplitude detection for UI feedback
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += Math.abs(inputData[i]);
          }
          const avg = sum / inputData.length;
          setIsUserTalking(avg > 0.02);

          const pcm16 = floatTo16BitPCM(inputData);
          const base64Audio = arrayBufferToBase64(pcm16);
          ws.send(JSON.stringify({ audio: base64Audio }));
        } else {
          setIsUserTalking(false);
        }
      };
    } catch (err: any) {
      console.error('Mic or Live API initialization error:', err);
      setIsConnecting(false);
      setIsConnected(false);
      setErrorMessage(
        err?.message?.includes('Permission')
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : err?.message || 'Failed to start voice companion.'
      );
    }
  };

  const endSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stopAll();
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsUserTalking(false);
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      endSession();
    }
    return () => {
      endSession();
    };
  }, [isOpen]);

  const sendTextMessage = (text: string) => {
    if (!text.trim()) return;
    setTranscriptHistory((prev) => [...prev, { sender: 'user', text: text.trim() }]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: text.trim() }));
    }
    setTextInput('');
  };

  const quickPrompts = [
    { label: 'Quiz me on Biology', icon: Brain },
    { label: '1-Minute Breathing Break', icon: Coffee },
    { label: 'Daily Study Motivation', icon: HeartHandshake },
    { label: 'Summarize today’s tasks', icon: Sparkles },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="voice-companion-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      >
        <motion.div
          id="voice-companion-card"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-50 dark:border-slate-800 bg-rose-50/40 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-sm">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-tight">
                  Gemini Live Voice
                </h3>
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                  gemini-3.8-live • Real-time conversation
                </p>
              </div>
            </div>

            <button
              id="close-voice-companion-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-between gap-6 text-center">
            {/* Connection status banner */}
            <div className="w-full">
              {errorMessage ? (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-600 dark:text-red-300">
                  {errorMessage}
                  <div className="mt-2">
                    <button
                      onClick={startSession}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-xs"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              ) : isConnecting ? (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Connecting to Gemini Live API...
                </div>
              ) : isConnected ? (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Channel Active • Kore voice
                </div>
              ) : (
                <div className="text-xs text-slate-400">Disconnected</div>
              )}
            </div>

            {/* Visualizer Pulsing Orb */}
            <div className="relative my-2 flex items-center justify-center">
              {/* Outer wave ripples */}
              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.4, 1.1] : isUserTalking ? [1, 1.25, 1.05] : [1, 1.05, 1],
                  opacity: isSpeaking ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2],
                }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                className="absolute w-44 h-44 rounded-full bg-gradient-to-r from-rose-300/30 to-pink-300/30 dark:from-rose-500/20 dark:to-pink-500/20 blur-xl"
              />

              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.18, 1] : isUserTalking ? [1, 1.12, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl border-4 transition-colors ${
                  isSpeaking
                    ? 'bg-gradient-to-tr from-rose-400 to-pink-500 border-rose-200 text-white shadow-rose-300/50'
                    : isUserTalking
                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 border-purple-200 text-white shadow-purple-300/50'
                    : isConnected
                    ? 'bg-gradient-to-tr from-rose-100 to-pink-100 dark:from-slate-800 dark:to-slate-700 border-rose-200 dark:border-slate-600 text-rose-500 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Volume2 className="w-10 h-10 animate-bounce" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase mt-1">Speaking</span>
                  </>
                ) : isUserTalking ? (
                  <>
                    <Mic className="w-10 h-10 animate-pulse" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase mt-1">Listening</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-9 h-9" />
                    <span className="text-[11px] font-medium tracking-wide mt-1">Ready</span>
                  </>
                )}
              </motion.div>
            </div>

            {/* Conversation Status Text */}
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {isSpeaking
                  ? 'HerSpace is speaking to you...'
                  : isUserTalking
                  ? 'Sayani is speaking...'
                  : isConnected
                  ? 'Go ahead, Sayani! Speak freely or tap a topic below'
                  : 'Starting Live Voice session...'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Low-latency spoken voice using Gemini Live. Natural turn-taking with audio interruption.
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2">
              {quickPrompts.map((q, idx) => {
                const Icon = q.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => sendTextMessage(q.label)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-rose-100 dark:border-slate-700 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-rose-500" />
                    {q.label}
                  </button>
                );
              })}
            </div>

            {/* Text message fallback input */}
            <div className="w-full flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <input
                id="voice-companion-text-input"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendTextMessage(textInput)}
                placeholder="Or type a quick question for Live voice..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
              />
              <button
                id="voice-companion-send-text-btn"
                onClick={() => sendTextMessage(textInput)}
                disabled={!textInput.trim()}
                className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-rose-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                id="voice-mute-toggle-btn"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-medium transition-colors ${
                  isMuted
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-500" />}
                {isMuted ? 'Muted' : 'Mic Active'}
              </button>
            </div>

            <button
              id="voice-hangup-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-md shadow-rose-300/30 transition-colors flex items-center gap-2"
            >
              Done Conversation
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
