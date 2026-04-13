import React, { useState } from 'react';
import { fetchVideoData } from '../lib/youtube';
import { GoogleGenAI, Type } from '@google/genai';
import { callWithRetry } from '../lib/gemini';
import { 
  Video, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Hash, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { YouTubeVideoData } from '../types';

interface OptimizationResult {
  analysis: {
    status: string;
    problems: string[];
  };
  optimized: {
    title: string;
    description: string;
    hashtags: string[];
  };
}

export default function VideoOptimizer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<YouTubeVideoData | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setLoading(true);
    setResult(null);
    setVideoData(null);

    try {
      // 1. Fetch Video Data
      const data = await fetchVideoData(videoUrl);
      setVideoData(data);

      // 2. Analyze and Optimize with Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are a world-class YouTube growth expert and psychologist. 
        Analyze the following YouTube video metadata and provide a powerful, high-CTR optimization.
        
        Original Title: ${data.snippet.title}
        Original Description: ${data.snippet.description}
        Tags: ${data.snippet.tags?.join(', ') || 'None'}
        
        Tasks:
        1. Analyze the current title and description. State if it's correct or what's wrong.
        2. Generate a "Powerful" and "Attractive" title using psychological triggers (curiosity, urgency, benefit).
        3. Generate a "Powerful" and "SEO-optimized" description that includes a hook, summary, and keywords.
        4. Generate 10-15 powerful and trending hashtags.
        
        CRITICAL INSTRUCTION: All generated content (analysis, title, description) MUST be in Bengali (বাংলা). Keep JSON keys in English.
      `;

      const model = "gemini-3-flash-preview";

      const response = await callWithRetry(() => ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, description: "Overall status in Bengali" },
                  problems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of problems in Bengali" }
                },
                required: ["status", "problems"]
              },
              optimized: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Optimized powerful title in Bengali" },
                  description: { type: Type.STRING, description: "Optimized psychological description in Bengali" },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of powerful hashtags" }
                },
                required: ["title", "description", "hashtags"]
              }
            },
            required: ["analysis", "optimized"]
          }
        }
      }));

      if (response.text) {
        const parsed = JSON.parse(response.text);
        setResult({
          analysis: {
            status: parsed?.analysis?.status || "বিশ্লেষণ পাওয়া যায়নি।",
            problems: parsed?.analysis?.problems || []
          },
          optimized: {
            title: parsed?.optimized?.title || "টাইটেল জেনারেট করা সম্ভব হয়নি।",
            description: parsed?.optimized?.description || "ডেসক্রিপশন জেনারেট করা সম্ভব হয়নি।",
            hashtags: parsed?.optimized?.hashtags || []
          }
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "ভিডিও অপ্টিমাইজ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("কপি করা হয়েছে!");
    setTimeout(() => setCopiedField(null), 2000);
  };

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
            <Zap className="w-3.5 h-3.5" />
            <span>ভিডিও এসইও ও গাইডলাইন</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            ভিডিও <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">অপ্টিমাইজ করুন</span>
          </h1>
          <p className="text-sm sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
            আপনার ভিডিওর লিংক দিন এবং এআই (AI) এর মাধ্যমে পাওয়ারফুল টাইটেল, ডেসক্রিপশন এবং হ্যাশট্যাগ জেনারেট করুন।
          </p>

          <form onSubmit={handleOptimize} className="w-full max-w-2xl mx-auto relative group">
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
                disabled={loading || !videoUrl.trim()}
                className="bg-white text-black hover:bg-neutral-200 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    অপ্টিমাইজ
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {result && videoData && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12"
          >
            {/* Left Column: Analysis */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <img 
                  src={videoData.snippet.thumbnails.high?.url || videoData.snippet.thumbnails.default?.url} 
                  alt="Thumbnail"
                  className="w-full aspect-video object-cover rounded-xl mb-6 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  বর্তমান অবস্থা বিশ্লেষণ
                </h3>
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {result.analysis.status}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">চিহ্নিত সমস্যাসমূহ:</h4>
                  {result.analysis.problems.map((prob, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-neutral-400">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{prob}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Optimized Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Optimized Title */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                    পাওয়ারফুল টাইটেল
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(result.optimized.title, 'title')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"
                  >
                    {copiedField === 'title' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-lg sm:text-xl font-medium text-white leading-snug">
                  {result.optimized.title}
                </div>
              </div>

              {/* Optimized Description */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    সাইকোলজিক্যাল ডেসক্রিপশন
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(result.optimized.description, 'desc')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"
                  >
                    {copiedField === 'desc' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                  {result.optimized.description}
                </div>
              </div>

              {/* Optimized Hashtags */}
              <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Hash className="w-6 h-6 text-red-500" />
                    পাওয়ারফুল হ্যাশট্যাগ
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(result.optimized.hashtags.join(' '), 'tags')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all"
                  >
                    {copiedField === 'tags' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.optimized.hashtags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 font-medium">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
