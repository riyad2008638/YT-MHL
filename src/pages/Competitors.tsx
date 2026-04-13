import React, { useState } from 'react';
import { fetchChannelData } from '../lib/youtube';
import { Users, Search, ArrowRight, Sparkles, Youtube, TrendingUp, Video, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function Competitors() {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [competitorData, setCompetitorData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorUrl.trim()) return;

    setLoading(true);
    try {
      const res = await fetchChannelData(competitorUrl);
      setCompetitorData(res.channel);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "প্রতিযোগীর তথ্য আনতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-900/20 to-transparent border-b border-white/5 pt-12 pb-8 px-4 sm:pt-16 sm:pb-12 sm:px-8 mb-8 sm:mb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] sm:text-xs font-medium text-orange-500 mb-4 sm:mb-6 shadow-lg shadow-orange-500/10">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>চ্যানেল ট্র্যাকিং</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              প্রতিযোগী <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">বিশ্লেষণ</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-xl leading-relaxed mx-auto md:mx-0">
              আপনার প্রতিযোগীদের চ্যানেলের পারফরম্যান্স ট্র্যাক করুন এবং তুলনা করুন। তাদের চ্যানেল লিংক দিয়ে বিশ্লেষণ শুরু করুন।
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-8 max-w-5xl mx-auto">
        <form onSubmit={handleSearch} className="mb-8 sm:mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex flex-col sm:flex-row items-center bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl gap-2 sm:gap-0">
            <div className="hidden sm:flex pl-4 pr-2 text-neutral-500">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex sm:hidden w-full items-center px-4 pt-2 pb-1 text-neutral-500">
              <Users className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">প্রতিযোগী খুঁজুন</span>
            </div>
            <input
              type="text"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              placeholder="চ্যানেল ইউআরএল বা @handle"
              className="w-full sm:flex-1 bg-white/5 sm:bg-transparent border border-white/10 sm:border-none rounded-xl sm:rounded-none text-white text-sm sm:text-lg px-4 sm:px-2 py-3 sm:py-4 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:focus:ring-0 placeholder-neutral-600"
            />
            <button
              type="submit"
              disabled={loading || !competitorUrl.trim()}
              className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-sm sm:text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  বিশ্লেষণ করুন
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {competitorData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-orange-500/10 to-transparent"></div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
              <div className="relative">
                <img src={competitorData.snippet.thumbnails.high.url} alt="Profile" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#141414] shadow-2xl z-10 relative" />
                <div className="absolute inset-0 rounded-full border border-white/10 scale-110"></div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{competitorData.snippet.title}</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4">
                  <span className="text-neutral-400 bg-white/5 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-white/5">
                    {competitorData.snippet.customUrl}
                  </span>
                  <a 
                    href={`https://youtube.com/${competitorData.snippet.customUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400 text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <Youtube className="w-3 h-3 sm:w-4 sm:h-4" />
                    চ্যানেলে যান
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 relative z-10">
              <div className="bg-white/5 border border-white/5 hover:border-white/10 transition-colors rounded-xl sm:rounded-2xl p-5 sm:p-6 flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-red-500 shrink-0">
                  <Youtube className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-neutral-400 text-xs sm:text-sm font-medium mb-1">সাবস্ক্রাইবার</h3>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {parseInt(competitorData.statistics.subscriberCount).toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/5 hover:border-white/10 transition-colors rounded-xl sm:rounded-2xl p-5 sm:p-6 flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-neutral-400 text-xs sm:text-sm font-medium mb-1">মোট ভিউ</h3>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {parseInt(competitorData.statistics.viewCount).toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/5 hover:border-white/10 transition-colors rounded-xl sm:rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:col-span-2 md:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-green-500 shrink-0">
                  <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-neutral-400 text-xs sm:text-sm font-medium mb-1">মোট ভিডিও</h3>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {parseInt(competitorData.statistics.videoCount).toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
