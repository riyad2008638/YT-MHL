import React, { useState } from 'react';
import { Activity, Sparkles, ArrowRight, TrendingUp, Zap, Target, Globe, BarChart3, CheckCircle2, Play, ExternalLink, Youtube as YoutubeIcon, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { fetchChannelData, fetchTrendingVideos, isLongForm } from '../lib/youtube';
import { analyzeChannelStyle, analyzeViralPulse } from '../lib/gemini';
import { ViralPulseResult, YouTubeVideoData } from '../types';

export default function AIViralPulse() {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'analyzing_channel' | 'detecting_style' | 'fetching_trends' | 'generating_report'>('idle');
  const [result, setResult] = useState<ViralPulseResult | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      setStep('analyzing_channel');
      const { channel, videos } = await fetchChannelData(channelUrl);
      
      // Filter for long-form videos
      const longFormVideos = videos.filter(isLongForm);
      
      if (longFormVideos.length === 0) {
        throw new Error("এই চ্যানেলে কোনো লং-ফর্ম ভিডিও পাওয়া যায়নি। এআই ভাইরাল পালস শুধুমাত্র বড় ভিডিওর জন্য কাজ করে।");
      }

      setStep('detecting_style');
      const { style, searchKeywords } = await analyzeChannelStyle(channel, longFormVideos);
      
      setStep('fetching_trends');
      // Use the first 2 keywords for a more targeted search
      let query = searchKeywords.slice(0, 2).join(' ');
      let trendingVideos = await fetchTrendingVideos(query);
      
      // If no results, try a broader search with just the first keyword
      if (trendingVideos.length === 0 && searchKeywords.length > 0) {
        query = searchKeywords[0];
        trendingVideos = await fetchTrendingVideos(query);
      }
      
      // If still no results, try the channel title as query
      if (trendingVideos.length === 0) {
        query = channel.snippet.title;
        trendingVideos = await fetchTrendingVideos(query);
      }

      if (trendingVideos.length === 0) {
        throw new Error("বর্তমানে আপনার নিশে কোনো ভাইরাল ভিডিও পাওয়া যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
      }

      setStep('generating_report');
      const analysis = await analyzeViralPulse(channel, trendingVideos, style);
      
      if (!analysis.topViralTopics || analysis.topViralTopics.length === 0) {
        throw new Error("আপনার নিশে এই মুহূর্তে কোনো ট্রেন্ডিং ভিডিওর তথ্য পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন।");
      }

      setResult(analysis);
      toast.success("ভাইরাল পালস অ্যানালাইসিস সম্পন্ন হয়েছে!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "অ্যানালাইসিস করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const getStepMessage = () => {
    switch (step) {
      case 'analyzing_channel': return 'চ্যানেল ডেটা সংগ্রহ করা হচ্ছে...';
      case 'detecting_style': return 'আপনার ভিডিওর স্টাইল বিশ্লেষণ করা হচ্ছে...';
      case 'fetching_trends': return 'ইউটিউব থেকে রিয়েল ভাইরাল ভিডিও খোঁজা হচ্ছে...';
      case 'generating_report': return 'আপনার জন্য সেরা ৫টি টপিক বাছাই করা হচ্ছে...';
      default: return 'অপেক্ষা করুন...';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-900/20 to-transparent border-b border-white/5 pt-12 pb-12 mb-12 rounded-3xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-orange-500 mb-6 shadow-lg shadow-orange-500/10">
              <Zap className="w-3.5 h-3.5" />
              <span>AI Viral Pulse (ট্রেন্ড অ্যানালাইজার)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              ভাইরাল হওয়ার <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">স্মার্ট উপায়</span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              আপনার চ্যানেলের নিশ অনুযায়ী গ্লোবাল ট্রেন্ড বিশ্লেষণ করে সেরা ৫টি ভাইরাল টপিক খুঁজে নিন।
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl mb-12"
        >
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-neutral-400 mb-3">আপনার বা যেকোনো চ্যানেলের লিঙ্ক দিন</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="youtube.com/@handle or channel link"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !channelUrl.trim()}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-10 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-orange-600/20"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{getStepMessage()}</span>
                    </>
                  ) : (
                    <>
                      <span>ট্রেন্ড খুঁজুন</span>
                      <TrendingUp className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Results Section */}
        {result && (
          <div className="space-y-12">
            {/* Niche & Style Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="flex flex-wrap justify-center gap-3">
                <div className="px-6 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  নিশ: {result.detectedNiche}
                </div>
                {result.styleAnalysis && (
                  <div className="px-6 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-lg flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    স্টাইল: {result.styleAnalysis}
                  </div>
                )}
              </div>
              <p className="text-neutral-400 italic max-w-xl">{result.nicheDescription}</p>
            </motion.div>

            {/* Viral Spotlight Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <TrendingUp className="text-red-500 w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">ভাইরাল স্পটলাইট (Top 5)</h2>
                </div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Last 7 Days
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {result.topViralTopics.map((topic, index) => {
                  const video = result.referenceVideos?.find(v => v.id === topic.referenceVideoId);
                  if (!video) return null;
                  return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-[#141414] border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all cursor-pointer"
                      onClick={() => setActiveVideo(video.id)}
                    >
                      <div className="relative aspect-video">
                        <img 
                          src={video.snippet.thumbnails.medium?.url} 
                          alt={video.snippet.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={24} fill="currentColor" className="text-white" />
                        </div>
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <div className="w-6 h-6 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                            {index + 1}
                          </div>
                          <div className="px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded uppercase tracking-tighter shadow-lg flex items-center gap-0.5">
                            <TrendingUp size={8} /> Trending
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[8px] font-bold text-white">
                          {formatNumber(video.statistics?.viewCount || 0)} Views
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                          {video.snippet.title}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-1 truncate">
                          {video.snippet.channelTitle}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top 5 Viral Topics */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Sparkles className="text-orange-400 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">টপ ৫ ভাইরাল সাজেশন</h2>
              </div>

              <div className="grid gap-6">
                {result.topViralTopics.map((topic, index) => {
                  const refVideo = result.referenceVideos?.find(v => v.id === topic.referenceVideoId);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 hover:border-orange-500/30 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-8xl font-black text-white">0{index + 1}</span>
                      </div>

                      <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider">Topic 0{index + 1}</span>
                              <div className="flex items-center gap-1 text-red-500">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-bold">{topic.viralPotential}% ভাইরাল সম্ভাবনা</span>
                              </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{topic.title}</h3>
                            <p className="text-neutral-400 mt-3 text-sm sm:text-base leading-relaxed">{topic.reason}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                              <h4 className="text-orange-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> থাম্বনেইল কনসেপ্ট
                              </h4>
                              <p className="text-neutral-300 text-sm leading-relaxed">{topic.thumbnailConcept}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                              <h4 className="text-orange-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                <Zap className="w-3 h-3" /> টাইটেল হুক
                              </h4>
                              <p className="text-neutral-300 text-sm leading-relaxed font-medium italic">"{topic.titleHook}"</p>
                            </div>
                          </div>

                          <div className="bg-orange-500/5 rounded-2xl p-5 border border-orange-500/10">
                            <h4 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-orange-500" /> আপনার জন্য স্ট্র্যাটেজি
                            </h4>
                            <p className="text-neutral-300 text-sm leading-relaxed">{topic.strategy}</p>
                          </div>
                        </div>

                        {refVideo && (
                          <div className="w-full lg:w-80 shrink-0">
                            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 group/video h-full flex flex-col">
                              <div className="relative aspect-video cursor-pointer overflow-hidden" onClick={() => setActiveVideo(refVideo.id)}>
                                <img 
                                  src={refVideo.snippet.thumbnails.high?.url || refVideo.snippet.thumbnails.medium?.url} 
                                  alt={refVideo.snippet.title}
                                  className="w-full h-full object-cover group-hover/video:scale-105 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                                  <Play size={32} fill="currentColor" className="text-white" />
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-[10px] font-bold text-white">
                                  {formatNumber(refVideo.statistics?.viewCount || 0)} Views
                                </div>
                              </div>
                              <div className="p-4 space-y-3 flex-1 flex flex-col">
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">রেফারেন্স ভিডিও</h4>
                                <p className="text-sm font-medium text-white line-clamp-2 flex-1">{refVideo.snippet.title}</p>
                                <div className="flex gap-2 pt-2">
                                  <button 
                                    onClick={() => setActiveVideo(refVideo.id)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1"
                                  >
                                    <Play size={12} /> প্লে করুন
                                  </button>
                                  <a 
                                    href={`https://youtube.com/watch?v=${refVideo.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                                    title="Open on YouTube"
                                  >
                                    <YoutubeIcon size={14} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
              {activeVideo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                  onClick={() => setActiveVideo(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => setActiveVideo(null)}
                      className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <iframe
                      src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Trends & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141414] border border-white/5 rounded-3xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Globe className="text-blue-400 w-6 h-6" />
                  গ্লোবাল ট্রেন্ডস
                </h3>
                <ul className="space-y-4">
                  {result.globalTrends.map((trend, i) => (
                    <li key={i} className="flex items-start gap-3 text-neutral-300 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      {trend}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141414] border border-white/5 rounded-3xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <BarChart3 className="text-green-400 w-6 h-6" />
                  এনগেজমেন্ট ইনসাইটস
                </h3>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <p className="text-neutral-300 text-sm leading-relaxed italic">
                    {result.engagementInsights}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  Data-Driven Analysis
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-neutral-700" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">এখনই শুরু করুন</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              আপনার চ্যানেলের লিঙ্ক দিন এবং দেখুন বর্তমানে আপনার নিশে কোন টপিকগুলো ভাইরাল হচ্ছে।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
