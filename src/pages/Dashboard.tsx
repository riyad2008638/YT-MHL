import React, { useState, useEffect } from 'react';
import { fetchChannelData } from '../lib/youtube';
import { analyzeChannelData } from '../lib/gemini';
import DashboardComponent from '../components/Dashboard';
import { YouTubeChannelData, YouTubeVideoData, AnalysisResult } from '../types';
import { toast } from 'sonner';
import { Search, Youtube, ArrowRight, Sparkles, Swords, Zap, Video, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [channelUrl, setChannelUrl] = useState('');
  const [channel, setChannel] = useState<YouTubeChannelData | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoData[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const savedChannel = localStorage.getItem('yt_channel_data');
    const savedVideos = localStorage.getItem('yt_videos_data');
    const savedAnalysis = localStorage.getItem('yt_analysis_data');
    
    if (savedChannel && savedVideos && savedAnalysis) {
      try {
        setChannel(JSON.parse(savedChannel));
        setVideos(JSON.parse(savedVideos));
        setAnalysis(JSON.parse(savedAnalysis));
      } catch (e) {
        console.error("Failed to parse saved data:", e);
        localStorage.removeItem('yt_channel_data');
        localStorage.removeItem('yt_videos_data');
        localStorage.removeItem('yt_analysis_data');
      }
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl.trim()) return;

    setLoading(true);
    setChannel(null);
    setAnalysis(null);
    
    try {
      const data = await fetchChannelData(channelUrl);
      setChannel(data.channel);
      setVideos(data.videos);

      localStorage.setItem('yt_channel_data', JSON.stringify(data.channel));
      localStorage.setItem('yt_videos_data', JSON.stringify(data.videos));

      setAnalyzing(true);
      const result = await analyzeChannelData(data.channel, data.videos);
      setAnalysis(result);
      localStorage.setItem('yt_analysis_data', JSON.stringify(result));
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'চ্যানেলের তথ্য আনতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!channel && !loading && !analyzing ? (
          <motion.div 
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 py-12 md:px-8 md:py-20 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-neutral-300 mb-6 md:mb-8">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>এআই (AI) চালিত ইউটিউব অ্যানালাইজার</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
              আপনার ইউটিউব চ্যানেল <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                বিশ্লেষণ করুন
              </span>
            </h1>
            
            <p className="text-base md:text-xl text-neutral-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              যেকোনো ইউটিউব চ্যানেলের লিংক দিয়ে তার বিস্তারিত এসইও (SEO) রিপোর্ট, এআই (AI) ইনসাইট এবং গ্রোথ স্ট্র্যাটেজি দেখুন সম্পূর্ণ ফ্রিতে।
            </p>

            <div className="w-full max-w-2xl space-y-6">
              <form onSubmit={handleSearch} className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex flex-col sm:flex-row items-center bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl gap-2 sm:gap-0">
                  <div className="hidden sm:block pl-4 pr-2 text-neutral-500">
                    <Youtube className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="চ্যানেলের লিংক বা @handle দিন"
                    className="flex-1 w-full bg-transparent border-none text-white text-base sm:text-lg px-4 py-3 sm:px-2 sm:py-4 focus:outline-none focus:ring-0 placeholder-neutral-600 text-center sm:text-left"
                  />
                  <button
                    type="submit"
                    disabled={!channelUrl.trim()}
                    className="bg-white text-black hover:bg-neutral-200 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    বিশ্লেষণ
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link 
                  to="/ai-coach"
                  className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20"
                >
                  AI Coach (AI Mode)
                  <Sparkles className="w-5 h-5 text-white group-hover:animate-pulse" />
                </Link>

                <Link 
                  to="/ai-viral-pulse"
                  className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  AI Viral Pulse
                  <TrendingUp className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                </Link>

                <Link 
                  to="/video-optimizer"
                  className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  ভিডিও অপ্টিমাইজার
                  <Zap className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                </Link>

                <Link 
                  to="/upcoming-analyzer"
                  className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  আপকামিং এনালাইজার
                  <Video className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </Link>

                <Link 
                  to="/battle-mode"
                  className="group relative flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] sm:col-span-2"
                >
                  ব্যাটল মুড
                  <Swords className="w-5 h-5 text-red-500 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            {/* Top Search Bar (Compact) */}
            <div className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white hidden md:block">ড্যাশবোর্ড</h2>
              <form onSubmit={handleSearch} className="w-full md:w-auto md:min-w-[300px] lg:min-w-[400px]">
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-red-500/50 transition-colors">
                  <div className="pl-3 text-neutral-500 hidden sm:block">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="অন্য চ্যানেল সার্চ করুন..."
                    className="flex-1 bg-transparent border-none text-white text-sm px-3 py-2.5 focus:outline-none placeholder-neutral-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !channelUrl.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    সার্চ
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {loading && (
                <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-lg font-medium text-white">চ্যানেলের তথ্য আনা হচ্ছে...</p>
                  <p className="text-sm mt-2">ইউটিউব এপিআই (API) থেকে ডেটা সংগ্রহ করা হচ্ছে</p>
                </div>
              )}

              {analyzing && channel && (
                <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse" />
                  </div>
                  <p className="text-lg font-medium text-white">এআই (AI) বিশ্লেষণ করছে...</p>
                  <p className="text-sm mt-2"><b>{channel.snippet.title}</b> চ্যানেলের ডেটা প্রসেস করা হচ্ছে</p>
                </div>
              )}

              {!loading && !analyzing && analysis && channel && (
                <DashboardComponent channel={channel} videos={videos} analysis={analysis} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
