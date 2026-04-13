import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Youtube, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAI } from '../lib/gemini';
import { YouTubeChannelData, YouTubeVideoData } from '../types';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<YouTubeChannelData | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedChannel = localStorage.getItem('yt_channel_data');
    const savedVideos = localStorage.getItem('yt_videos_data');
    const savedMessages = localStorage.getItem('ai_coach_messages');

    if (savedChannel) setChannel(JSON.parse(savedChannel));
    if (savedVideos) setVideos(JSON.parse(savedVideos));
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
      // Initial greeting
      const greeting: Message = {
        role: 'model',
        text: "হ্যালো! আমি আপনার এআই গ্রোথ কোচ। আমি আপনাকে ইউটিউব চ্যানেল গ্রো করতে, এসইও উন্নত করতে এবং ভাইরাল আইডিয়া জেনারেট করতে সাহায্য করব। আপনি আপনার চ্যানেলের যেকোনো বিষয়ে আমাকে প্রশ্ন করতে পারেন!",
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0) {
      localStorage.setItem('ai_coach_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithAI(input, history, { channel: channel || undefined, videos: videos.length > 0 ? videos : undefined });
      
      const aiMessage: Message = {
        role: 'model',
        text: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error(error);
      toast.error("দুঃখিত, এআই রেসপন্স দিতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const greeting: Message = {
      role: 'model',
      text: "চ্যাট ক্লিয়ার করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
      timestamp: new Date()
    };
    setMessages([greeting]);
    localStorage.removeItem('ai_coach_messages');
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400">
            <ArrowLeft size={20} />
          </Link>
          <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Growth Coach</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-neutral-400 font-medium">অনলাইন</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {channel && (
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Youtube size={16} className="text-red-500" />
              <span className="text-xs font-medium text-neutral-300 truncate max-w-[150px]">
                {channel.snippet.title}
              </span>
            </div>
          )}
          <button 
            onClick={clearChat}
            className="p-2.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  m.role === 'user' ? 'bg-red-500 text-white' : 'bg-white/10 text-red-500 border border-white/10'
                }`}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-red-500/10 border border-red-500/20 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-neutral-200 rounded-tl-none'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{m.text}</Markdown>
                  </div>
                  <div className={`text-[10px] mt-2 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 text-red-500 border border-white/10 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="আপনার প্রশ্ন এখানে লিখুন..."
            className="flex-1 bg-transparent border-none text-white text-base px-4 py-3 focus:outline-none placeholder-neutral-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      
      {/* Quick Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          "কিভাবে ভিউ বাড়াবো?",
          "সেরা ৫টি ভিডিও আইডিয়া দিন",
          "আমার এসইও কেমন?",
          "ভাইরাল হওয়ার টিপস",
          "থাম্বনেইল আইডিয়া"
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => setInput(s)}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
