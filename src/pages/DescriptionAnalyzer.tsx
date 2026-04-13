import React, { useState } from 'react';
import { fetchVideoData } from '../lib/youtube';
import { 
  Video, 
  FileText, 
  Copy, 
  CheckCircle, 
  Type, 
  Hash, 
  Tag,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { YouTubeVideoData } from '../types';

export default function DescriptionAnalyzer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<YouTubeVideoData | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const extractHashtags = (text: string) => {
    // Regex to match hashtags including Bengali characters
    const regex = /#[\w\u0980-\u09FF]+/g;
    const matches = text.match(regex);
    // Return unique hashtags
    return matches ? Array.from(new Set(matches)) : [];
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setLoading(true);
    setVideoData(null);
    setHashtags([]);

    try {
      const data = await fetchVideoData(videoUrl);
      setVideoData(data);
      setHashtags(extractHashtags(data.snippet.description || ''));
      toast.success("ভিডিও ডেটা সফলভাবে সংগ্রহ করা হয়েছে!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "ভিডিওর তথ্য আনতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) {
      toast.error("কপি করার মতো কোনো টেক্সট নেই!");
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("কপি করা হয়েছে!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-8">
      {/* Hero Section */}
      <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-500 mb-6 shadow-lg shadow-blue-500/10">
            <FileText className="w-3.5 h-3.5" />
            <span>ডিসক্রিপশন এনালাইজার</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            ভিডিওর <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">এ টু জেড ডেটা</span>
          </h1>
          <p className="text-sm sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
            যেকোনো ভিডিওর লিংক দিন এবং তার আসল টাইটেল, ডেসক্রিপশন, ট্যাগ এবং হ্যাশট্যাগগুলো হুবহু বের করে কপি করুন।
          </p>

          <form onSubmit={handleAnalyze} className="w-full max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative flex flex-col sm:flex-row items-center bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl gap-2 sm:gap-0">
              <div className="hidden sm:block pl-4 pr-2 text-neutral-500">
                <Video className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="ভিডিওর লিংক দিন (যেমন: https://youtu.be/...)"
                className="flex-1 w-full bg-transparent border-none text-white text-base sm:text-lg px-4 py-3 sm:px-2 sm:py-4 focus:outline-none focus:ring-0 placeholder-neutral-600 text-center sm:text-left"
              />
              <button
                type="submit"
                disabled={loading || !videoUrl.trim()}
                className="bg-white text-black hover:bg-neutral-200 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    বিশ্লেষণ করুন
                    <Zap className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {videoData && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Thumbnail & Basic Info */}
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 shrink-0">
                <img 
                  src={videoData.snippet.thumbnails.high?.url || videoData.snippet.thumbnails.medium?.url} 
                  alt="Thumbnail"
                  className="w-full aspect-video object-cover rounded-xl shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <h2 className="text-2xl font-bold text-white">{videoData.snippet.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                  <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    চ্যানেল: <span className="text-white font-semibold">{videoData.snippet.channelTitle}</span>
                  </div>
                  <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    পাবলিশ: <span className="text-white font-semibold">{new Date(videoData.snippet.publishedAt).toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title Section */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Type className="w-6 h-6 text-blue-500" />
                    ভিডিও টাইটেল
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(videoData.snippet.title, 'title')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"
                    title="টাইটেল কপি করুন"
                  >
                    {copiedField === 'title' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-lg font-medium text-white leading-snug flex-1">
                  {videoData.snippet.title}
                </div>
              </div>

              {/* Tags Section */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Tag className="w-6 h-6 text-orange-500" />
                    ভিডিও ট্যাগস (Keywords)
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(videoData.snippet.tags?.join(', ') || '', 'tags')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"
                    title="সব ট্যাগ কপি করুন"
                  >
                    {copiedField === 'tags' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex-1">
                  {videoData.snippet.tags && videoData.snippet.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {videoData.snippet.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-400 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 italic">এই ভিডিওতে কোনো ট্যাগ ব্যবহার করা হয়নি।</p>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-500" />
                    সম্পূর্ণ ডেসক্রিপশন
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(videoData.snippet.description, 'desc')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"
                    title="ডেসক্রিপশন কপি করুন"
                  >
                    {copiedField === 'desc' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                  {videoData.snippet.description || <span className="text-neutral-500 italic">কোনো ডেসক্রিপশন দেওয়া নেই।</span>}
                </div>
              </div>

              {/* Extracted Hashtags Section */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Hash className="w-6 h-6 text-purple-500" />
                    ব্যবহৃত হ্যাশট্যাগসমূহ
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(hashtags.join(' '), 'hashtags')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"
                    title="সব হ্যাশট্যাগ কপি করুন"
                  >
                    {copiedField === 'hashtags' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  {hashtags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-400 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 italic">ডেসক্রিপশনে কোনো হ্যাশট্যাগ পাওয়া যায়নি।</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
