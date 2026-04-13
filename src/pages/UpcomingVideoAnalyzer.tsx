import React, { useState, useRef } from 'react';
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
  Zap,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare,
  Type as TypeIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface AnalysisResult {
  evaluation: {
    title: { status: string; score: number; feedback: string };
    script: { status: string; score: number; feedback: string };
    thumbnail: { status: string; score: number; feedback: string };
  };
  problems: string[];
  solutions: string[];
  suggestedTitles: string[];
}

export default function UpcomingVideoAnalyzer() {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent, isRefresh = false) => {
    if (e) e.preventDefault();
    if (!title.trim() || !script.trim()) {
      toast.error("দয়া করে টাইটেল এবং স্ক্রিপ্ট প্রদান করুন।");
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key missing");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are a world-class YouTube growth strategist and psychologist. 
        Analyze the following upcoming video information and provide a deep psychological analysis and powerful title suggestions.
        
        Proposed Title: ${title}
        Video Script: ${script}
        Thumbnail Provided: ${thumbnail ? 'Yes (Image attached contextually)' : 'No'}
        
        Tasks:
        1. Evaluate if the current title, script, and thumbnail (if provided) are perfect for a viral video.
        2. Assign a score (0-100) and provide feedback for each.
        3. Identify specific problems and provide actionable solutions.
        4. Generate TWO (2) extremely powerful, high-CTR, and psychologically triggering titles that make people "forced" to click. Use curiosity, fear of missing out (FOMO), or extreme benefit.
        
        CRITICAL INSTRUCTION: All generated content MUST be in Bengali (বাংলা). Keep JSON keys in English.
      `;

      const parts: any[] = [{ text: prompt }];
      if (thumbnail) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: thumbnail.split(',')[1]
          }
        });
      }

      const model = "gemini-3-flash-preview";

      const response = await callWithRetry(() => ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              evaluation: {
                type: Type.OBJECT,
                properties: {
                  title: { 
                    type: Type.OBJECT, 
                    properties: { 
                      status: { type: Type.STRING }, 
                      score: { type: Type.NUMBER }, 
                      feedback: { type: Type.STRING } 
                    } 
                  },
                  script: { 
                    type: Type.OBJECT, 
                    properties: { 
                      status: { type: Type.STRING }, 
                      score: { type: Type.NUMBER }, 
                      feedback: { type: Type.STRING } 
                    } 
                  },
                  thumbnail: { 
                    type: Type.OBJECT, 
                    properties: { 
                      status: { type: Type.STRING }, 
                      score: { type: Type.NUMBER }, 
                      feedback: { type: Type.STRING } 
                    } 
                  }
                }
              },
              problems: { type: Type.ARRAY, items: { type: Type.STRING } },
              solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedTitles: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 2, maxItems: 2 }
            },
            required: ["evaluation", "problems", "solutions", "suggestedTitles"]
          }
        }
      }));

      if (response.text) {
        const data = JSON.parse(response.text);
        if (isRefresh && result) {
          setResult({ ...result, suggestedTitles: data.suggestedTitles });
        } else {
          setResult(data);
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error("বিশ্লেষণ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("টাইটেল কপি করা হয়েছে!");
    setTimeout(() => setCopiedIndex(null), 2000);
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
            <Zap className="w-3.5 h-3.5" />
            <span>আপকামিং ভিডিও এনালাইজার</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            ভিডিও আপলোডের <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">আগে বিশ্লেষণ করুন</span>
          </h1>
          <p className="text-sm sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
            আপনার ভিডিওর টাইটেল, স্ক্রিপ্ট এবং থাম্বনেইল দিন। এআই (AI) বলবে আপনার ভিডিওটি ভাইরাল হওয়ার জন্য কতটা প্রস্তুত।
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-5">
          <form onSubmit={(e) => handleAnalyze(e)} className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 sticky top-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              ভিডিও ইনফরমেশন
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                  <TypeIcon size={14} /> ভিডিও টাইটেল
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="আপনার ভিডিওর টাইটেল লিখুন"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                  <MessageSquare size={14} /> ভিডিও স্ক্রিপ্ট
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="ভিডিওর স্ক্রিপ্ট বা মূল বিষয়বস্তু এখানে দিন..."
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                  <ImageIcon size={14} /> ভিডিও থাম্বনেইল (ঐচ্ছিক)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden group"
                >
                  {thumbnail ? (
                    <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-neutral-600 mb-2 group-hover:text-blue-500 transition-colors" />
                      <span className="text-xs text-neutral-500">থাম্বনেইল আপলোড করুন</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleThumbnailChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <button
                type="submit"
                disabled={loading || !title.trim() || !script.trim()}
                className="w-full bg-white text-black hover:bg-neutral-200 font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    বিশ্লেষণ শুরু করুন
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Scores Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'টাইটেল স্কোর', data: result.evaluation.title, icon: TypeIcon, color: 'text-blue-500' },
                    { label: 'স্ক্রিপ্ট স্কোর', data: result.evaluation.script, icon: MessageSquare, color: 'text-purple-500' },
                    { label: 'থাম্বনেইল স্কোর', data: result.evaluation.thumbnail, icon: ImageIcon, color: 'text-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-5 text-center">
                      <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 ${item.color}`}>
                        <item.icon size={20} />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{item.data.score}%</div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider">{item.label}</div>
                      <div className="mt-2 text-[10px] text-neutral-400 leading-tight">{item.data.status}</div>
                    </div>
                  ))}
                </div>

                {/* Problems & Solutions */}
                <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    সমস্যা ও সমাধান
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">চিহ্নিত সমস্যা:</h4>
                      <div className="space-y-2">
                        {result.problems.map((p, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">প্রস্তাবিত সমাধান:</h4>
                      <div className="space-y-2">
                        {result.solutions.map((s, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggested Titles */}
                <div className="bg-gradient-to-br from-blue-900/20 to-[#141414] border border-blue-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                      পাওয়ারফুল টাইটেল সাজেশন
                    </h3>
                    <button 
                      onClick={() => handleAnalyze(undefined, true)}
                      disabled={refreshing}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-blue-400 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      রিফ্রেশ
                    </button>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {result.suggestedTitles.map((title, i) => (
                      <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-lg font-medium text-white leading-snug">{title}</p>
                          <button 
                            onClick={() => copyToClipboard(title, i)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-all shrink-0"
                          >
                            {copiedIndex === i ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="mt-6 text-xs text-neutral-500 text-center italic">
                    * এই টাইটেলগুলো সাইকোলজিক্যাল ট্রিগার ব্যবহার করে তৈরি করা হয়েছে যা ক্লিক রেট (CTR) বাড়াতে সাহায্য করবে।
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-white/10 rounded-3xl bg-white/5 min-h-[500px]">
                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                  <Video className="w-10 h-10 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">বিশ্লেষণ ফলাফল এখানে দেখা যাবে</h3>
                <p className="text-neutral-500 max-w-sm leading-relaxed">
                  বামের ফর্মে আপনার ভিডিওর টাইটেল, স্ক্রিপ্ট এবং থাম্বনেইল দিয়ে বিশ্লেষণ শুরু করুন।
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
