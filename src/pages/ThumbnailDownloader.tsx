import React, { useState } from 'react';
import { Download, Image as ImageIcon, Video, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ThumbnailDownloader() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^?&]+)/);
    return match ? match[1] : null;
  };

  const handleExtract = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(videoUrl);
    setVideoId(id);
  };

  const qualities = [
    { label: 'Max Resolution (1080p)', resolution: '1280x720', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
    { label: 'High Quality (480p)', resolution: '640x480', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
    { label: 'Medium Quality (360p)', resolution: '480x360', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
    { label: 'Standard Quality (180p)', resolution: '320x180', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
    { label: 'Default Quality (120p)', resolution: '120x90', url: `https://img.youtube.com/vi/${videoId}/default.jpg` },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-8">
      {/* Hero Section */}
      <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-500 mb-6 shadow-lg shadow-red-500/10">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>থাম্বনেইল ডাউনলোডার</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            যেকোনো ভিডিওর <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">থাম্বনেইল ডাউনলোড</span>
          </h1>
          <p className="text-sm sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
            শর্টস বা বড় ভিডিওর লিংক দিন এবং ১০৮০পি থেকে ১২০পি পর্যন্ত যেকোনো কোয়ালিটিতে থাম্বনেইল ডাউনলোড করুন।
          </p>

          <form onSubmit={handleExtract} className="w-full max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
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
                disabled={!videoUrl.trim()}
                className="bg-white text-black hover:bg-neutral-200 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                খুঁজুন
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {videoId && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-red-500" />
                    প্রিভিউ (Max Res)
                  </h3>
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video flex items-center justify-center">
                    <img 
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to hqdefault if maxresdefault doesn't exist
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }}
                    />
                  </div>
                </div>

                {/* Download Options */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-500" />
                    ডাউনলোড অপশন
                  </h3>
                  <div className="space-y-3">
                    {qualities.map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                        <div>
                          <div className="font-bold text-white">{q.label}</div>
                          <div className="text-sm text-neutral-400">{q.resolution}</div>
                        </div>
                        <a 
                          href={q.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`thumbnail_${videoId}.jpg`}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg transition-colors border border-red-500/20"
                        >
                          <Download className="w-4 h-4" />
                          ডাউনলোড
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3 text-sm text-yellow-500">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>ডাউনলোড বাটনে ক্লিক করার পর ছবিটি নতুন ট্যাবে ওপেন হলে, ছবির উপর রাইট-ক্লিক করে "Save image as..." সিলেক্ট করুন।</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
