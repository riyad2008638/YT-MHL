import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Lightbulb, TrendingUp, AlertCircle, Sparkles, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function DailyIdeas() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<number[]>([]);

  const generateIdeas = async () => {
    setLoading(true);
    setError(false);
    try {
      const savedChannel = localStorage.getItem('yt_channel_data');
      const savedVideos = localStorage.getItem('yt_videos_data');
      
      if (!savedChannel || !savedVideos) {
        setError(true);
        setLoading(false);
        return;
      }

      const channel = JSON.parse(savedChannel);
      const videos = JSON.parse(savedVideos);
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert YouTube strategist. Based on the following channel and recent videos, generate 5 highly engaging, viral-worthy video ideas.
        
        Channel Title: ${channel.snippet.title}
        Description: ${channel.snippet.description}
        Recent Videos: ${videos.slice(0, 5).map((v: any) => v.snippet.title).join(', ')}

        CRITICAL INSTRUCTION: All text content MUST be in Bengali (বাংলা). Keep JSON keys in English.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Video title idea in Bengali" },
                prediction: { type: Type.STRING, description: "High, Medium, or Low" },
                reason: { type: Type.STRING, description: "Why this idea will work (in Bengali)" },
              }
            }
          }
        }
      });

      if (response.text) {
        setIdeas(JSON.parse(response.text));
        setSavedIdeas([]); // Reset saved ideas on new generation
      }
    } catch (error: any) {
      console.error(error);
      toast.error("আইডিয়া জেনারেট করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateIdeas();
  }, []);

  const toggleSave = (index: number) => {
    if (savedIdeas.includes(index)) {
      setSavedIdeas(savedIdeas.filter(i => i !== index));
      toast('আইডিয়াটি সেভ লিস্ট থেকে সরানো হয়েছে');
    } else {
      setSavedIdeas([...savedIdeas, index]);
      toast.success('আইডিয়াটি সেভ করা হয়েছে!');
    }
  };

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 md:w-24 md:h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800 shadow-2xl"
        >
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-neutral-500" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight"
        >
          কোনো চ্যানেল নির্বাচন করা হয়নি
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-neutral-400 max-w-md mb-8 leading-relaxed"
        >
          দৈনিক আইডিয়া পেতে প্রথমে ড্যাশবোর্ড থেকে একটি চ্যানেল সার্চ করুন। এআই (AI) আপনার চ্যানেলের ডেটা বিশ্লেষণ করে আইডিয়া দেবে।
        </motion.p>
        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => window.location.href = '/'}
          className="bg-white text-black px-6 py-3 md:px-8 md:py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors shadow-xl"
        >
          ড্যাশবোর্ডে যান
        </motion.button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-yellow-900/20 to-transparent border-b border-white/5 pt-12 pb-8 px-4 md:pt-16 md:pb-12 md:px-8 mb-8 md:mb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-medium text-yellow-500 mb-4 md:mb-6 shadow-lg shadow-yellow-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>এআই (AI) জেনারেটেড</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 tracking-tight">
              দৈনিক <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">আইডিয়া</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-400 max-w-xl mx-auto md:mx-0 leading-relaxed">
              আপনার চ্যানেলের জন্য এআই দ্বারা তৈরি সেরা ৫টি ভিডিও আইডিয়া। প্রতিদিন নতুন আইডিয়া পেতে রিফ্রেশ করুন।
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="shrink-0 w-full md:w-auto"
          >
            <button 
              onClick={generateIdeas}
              disabled={loading}
              className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-5 py-3 md:px-6 md:py-3.5 rounded-xl transition-all disabled:opacity-50 font-bold shadow-xl shadow-yellow-500/20 overflow-hidden w-full md:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <RefreshCw className={`w-5 h-5 relative z-10 ${loading ? 'animate-spin' : ''}`} />
              <span className="relative z-10">নতুন আইডিয়া দিন</span>
            </button>
          </motion.div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="grid gap-4 md:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 animate-pulse flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl shrink-0"></div>
                <div className="flex-1 w-full space-y-3 md:space-y-4">
                  <div className="h-5 md:h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 md:h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-3 md:h-4 bg-white/10 rounded w-5/6"></div>
                </div>
                <div className="w-full md:w-32 h-10 md:h-12 bg-white/10 rounded-xl shrink-0"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            <AnimatePresence>
              {ideas.map((idea, idx) => {
                const isHigh = idea.prediction === 'High' || idea.prediction === 'উচ্চ';
                const isSaved = savedIdeas.includes(idx);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
                    key={idx} 
                    className={`group relative bg-gradient-to-br from-neutral-900 to-neutral-950 border rounded-2xl p-5 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center transition-all duration-500 hover:shadow-2xl ${
                      isSaved ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Number Indicator */}
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl font-bold shrink-0 transition-colors duration-300 ${
                      isSaved ? 'bg-yellow-500 text-black' : 'bg-white/5 text-neutral-400 group-hover:bg-white/10 group-hover:text-white'
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 w-full">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 group-hover:text-yellow-400 transition-colors duration-300 leading-tight">
                        {idea.title}
                      </h3>
                      <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        {idea.reason}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-2 md:gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                      <div className={`flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl border w-full sm:w-auto ${
                        isHigh 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                        {isHigh ? <TrendingUp className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        <span className="text-sm font-bold tracking-wide">
                          সম্ভাবনা: {idea.prediction}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => toggleSave(idx)}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border w-full sm:w-auto transition-all duration-300 ${
                          isSaved 
                            ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' 
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-bold">সেভড</span>
                          </>
                        ) : (
                          <>
                            <Lightbulb className="w-4 h-4" />
                            <span className="text-sm font-bold">সেভ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
