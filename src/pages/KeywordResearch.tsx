import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Search, Activity, Target, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function KeywordResearch() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert YouTube SEO analyst. Analyze the keyword "${keyword}" for YouTube.
        Provide an estimated search volume score (0-100), competition score (0-100), overall score (0-100), and 5 related keywords.
        
        CRITICAL INSTRUCTION: All text content MUST be in Bengali (বাংলা). Keep JSON keys in English.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER, description: "Overall score out of 100" },
              searchVolume: { type: Type.NUMBER, description: "Search volume score out of 100" },
              competition: { type: Type.NUMBER, description: "Competition score out of 100" },
              verdict: { type: Type.STRING, description: "Short verdict in Bengali" },
              relatedKeywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    score: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });

      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (error: any) {
      console.error(error);
      toast.error("কিওয়ার্ড বিশ্লেষণ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-900/20 to-transparent border-b border-white/5 pt-12 pb-8 px-4 md:pt-16 md:pb-12 md:px-8 mb-8 md:mb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-500 mb-4 md:mb-6 shadow-lg shadow-blue-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>এআই (AI) চালিত রিসার্চ</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 tracking-tight">
              কিওয়ার্ড <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">রিসার্চ</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-400 max-w-xl mx-auto md:mx-0 leading-relaxed">
              আপনার ভিডিওর জন্য সেরা কিওয়ার্ড খুঁজে বের করুন এবং এর সার্চ ভলিউম ও প্রতিযোগিতা জানুন।
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-5xl mx-auto">
        <form onSubmit={handleSearch} className="mb-8 md:mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex flex-col sm:flex-row items-center bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl gap-2 sm:gap-0">
            <div className="hidden sm:block pl-4 pr-2 text-neutral-500">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="কিওয়ার্ড লিখুন (যেমন: YouTube SEO 2024)"
              className="flex-1 w-full bg-transparent border-none text-white text-base sm:text-lg px-4 py-3 sm:px-2 sm:py-4 focus:outline-none focus:ring-0 placeholder-neutral-600 text-center sm:text-left"
            />
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="bg-white text-black hover:bg-neutral-200 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  রিসার্চ করুন
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 md:space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <Activity className="w-8 h-8 md:w-10 md:h-10 text-green-500 mb-3 md:mb-4" />
              <h3 className="text-neutral-400 font-medium mb-1 md:mb-2 uppercase tracking-wider text-xs md:text-sm">ওভারঅল স্কোর</h3>
              <div className={`text-4xl md:text-5xl font-bold mb-2 md:mb-3 ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}<span className="text-xl md:text-2xl text-neutral-600">/100</span>
              </div>
              <p className="text-xs md:text-sm text-neutral-300 font-medium bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg">{result.verdict}</p>
            </div>
            
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <Search className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-3 md:mb-4" />
              <h3 className="text-neutral-400 font-medium mb-1 md:mb-2 uppercase tracking-wider text-xs md:text-sm">সার্চ ভলিউম</h3>
              <div className={`text-4xl md:text-5xl font-bold ${getScoreColor(result.searchVolume)}`}>
                {result.searchVolume}<span className="text-xl md:text-2xl text-neutral-600">/100</span>
              </div>
            </div>
            
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <Target className="w-8 h-8 md:w-10 md:h-10 text-red-500 mb-3 md:mb-4" />
              <h3 className="text-neutral-400 font-medium mb-1 md:mb-2 uppercase tracking-wider text-xs md:text-sm">প্রতিযোগিতা (Competition)</h3>
              <div className={`text-4xl md:text-5xl font-bold ${getScoreColor(100 - result.competition)}`}>
                {result.competition}<span className="text-xl md:text-2xl text-neutral-600">/100</span>
              </div>
              <p className="text-[10px] md:text-xs text-neutral-500 mt-2 md:mt-3">কম স্কোর মানে প্রতিযোগিতা কম</p>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg text-green-500">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              সম্পর্কিত কিওয়ার্ড (Related Keywords)
            </h2>
            <div className="grid gap-2 md:gap-3">
              {result.relatedKeywords.map((rk: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/5">
                  <span className="font-medium text-neutral-200 text-sm md:text-lg">{rk.keyword}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden hidden sm:block relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${rk.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`absolute top-0 left-0 h-full rounded-full ${rk.score >= 70 ? 'bg-green-500' : rk.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      />
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${
                      rk.score >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      rk.score >= 40 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {rk.score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
