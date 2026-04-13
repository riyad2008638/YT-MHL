import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { callWithRetry } from '../lib/gemini';
import { Activity, CheckCircle, AlertTriangle, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function SEOAnalyzer() {
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !title.trim()) return;

    setLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert YouTube SEO analyst. Analyze the following video metadata against the target keyword.
        Target Keyword: ${keyword}
        Title: ${title}
        Description: ${description}
        Tags: ${tags}
        
        Provide an SEO score (0-100), a list of strengths, a list of weaknesses, and actionable recommendations to improve the SEO.
        
        CRITICAL INSTRUCTION: All text content MUST be in Bengali (বাংলা). Keep JSON keys in English.
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
              seoScore: { type: Type.NUMBER, description: "SEO score out of 100" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["seoScore", "strengths", "weaknesses", "recommendations"]
          }
        }
      }));

      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (error: any) {
      console.error(error);
      toast.error("এসইও বিশ্লেষণ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-transparent border-b border-white/5 pt-12 pb-8 px-4 sm:pt-16 sm:pb-12 sm:px-8 mb-8 sm:mb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] sm:text-xs font-medium text-purple-500 mb-4 sm:mb-6 shadow-lg shadow-purple-500/10">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>এআই এসইও অ্যানালাইজার</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              এসইও <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">অ্যানালাইজার</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-xl leading-relaxed mx-auto md:mx-0">
              আপনার ভিডিওর টাইটেল, ডেসক্রিপশন এবং ট্যাগ বিশ্লেষণ করে এসইও স্কোর জানুন এবং র‍্যাঙ্কিং উন্নত করার পরামর্শ পান।
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-5">
            <form onSubmit={handleAnalyze} className="bg-[#141414] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 sticky top-4 sm:top-8 shadow-2xl">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                মেটাডেটা ইনপুট
              </h2>
              
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 mb-1.5 sm:mb-2">টার্গেট কিওয়ার্ড <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="মূল কিওয়ার্ড লিখুন"
                    className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 mb-1.5 sm:mb-2">ভিডিও টাইটেল <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ভিডিওর টাইটেল লিখুন"
                  className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 mb-1.5 sm:mb-2">ডেসক্রিপশন</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ভিডিওর ডেসক্রিপশন লিখুন"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 mb-1.5 sm:mb-2">ট্যাগস</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="ট্যাগ১, ট্যাগ২, ট্যাগ৩ (কমা দিয়ে আলাদা করুন)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !keyword.trim() || !title.trim()}
                className="w-full bg-white text-black hover:bg-neutral-200 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 sm:mt-4"
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
        </div>

        <div className="lg:col-span-7">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="bg-[#141414] border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[200px]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
                <h3 className="text-neutral-400 font-medium mb-3 sm:mb-4 relative z-10 uppercase tracking-wider text-xs sm:text-sm">এসইও স্কোর</h3>
                <div className="relative z-10 flex items-baseline gap-1 sm:gap-2">
                  <span className={`text-5xl sm:text-7xl font-bold tracking-tighter ${result.seoScore >= 80 ? 'text-green-500' : result.seoScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {result.seoScore}
                  </span>
                  <span className="text-lg sm:text-2xl text-neutral-500 font-medium">/100</span>
                </div>
                
                <div className="w-full max-w-md bg-white/5 h-1.5 sm:h-2 rounded-full mt-6 sm:mt-8 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.seoScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${result.seoScore >= 80 ? 'bg-green-500' : result.seoScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-[#141414] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-white/10 transition-colors">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="text-green-500 w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    ভালো দিকসমূহ
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {result.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-neutral-300 text-xs sm:text-sm flex items-start gap-2 sm:gap-3">
                        <span className="text-green-500 mt-0.5 shrink-0">•</span> 
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#141414] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-white/10 transition-colors">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="text-red-500 w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    দুর্বল দিকসমূহ
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {result.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-neutral-300 text-xs sm:text-sm flex items-start gap-2 sm:gap-3">
                        <span className="text-red-500 mt-0.5 shrink-0">•</span> 
                        <span className="leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-[#141414] border border-purple-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Lightbulb className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  পরামর্শ (Recommendations)
                </h3>
                <ul className="space-y-3 sm:space-y-4 relative z-10">
                  {result.recommendations.map((r: string, i: number) => (
                    <li key={i} className="text-neutral-200 text-xs sm:text-sm flex items-start gap-2 sm:gap-3 bg-white/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/5">
                      <span className="text-purple-400 mt-0.5 shrink-0">→</span> 
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-white/10 rounded-2xl sm:rounded-3xl bg-white/5 min-h-[300px] sm:min-h-[400px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-white mb-2">ফলাফল এখানে প্রদর্শিত হবে</h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-sm">
                বামের ফর্মে আপনার ভিডিওর মেটাডেটা ইনপুট দিন এবং "বিশ্লেষণ করুন" বাটনে ক্লিক করুন।
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
