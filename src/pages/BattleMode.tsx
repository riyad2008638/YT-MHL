import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Swords, 
  Search, 
  TrendingUp, 
  Users, 
  Play, 
  Target, 
  Rocket, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Trophy,
  Zap
} from "lucide-react";
import { fetchChannelData } from "../lib/youtube";
import { compareChannels } from "../lib/gemini";
import { YouTubeChannelData, YouTubeVideoData, BattleAnalysisResult } from "../types";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export default function BattleMode() {
  const [url1, setUrl1] = React.useState("");
  const [url2, setUrl2] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<BattleAnalysisResult | null>(null);
  const [channel1, setChannel1] = React.useState<{ channel: YouTubeChannelData; videos: YouTubeVideoData[] } | null>(null);
  const [channel2, setChannel2] = React.useState<{ channel: YouTubeChannelData; videos: YouTubeVideoData[] } | null>(null);

  const handleBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url1 || !url2) {
      toast.error("দয়া করে দুটি চ্যানেলের লিংকই দিন।");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data1 = await fetchChannelData(url1);
      const data2 = await fetchChannelData(url2);
      
      setChannel1(data1);
      setChannel2(data2);

      const analysis = await compareChannels(
        data1.channel,
        data1.videos,
        data2.channel,
        data2.videos
      );
      setResult(analysis);
      toast.success("ব্যাটল অ্যানালাইসিস সম্পন্ন হয়েছে!");
    } catch (error: any) {
      toast.error(error.message || "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === "string" ? parseInt(num) : num;
    if (isNaN(n)) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex p-4 bg-red-500/10 rounded-3xl text-red-500 mb-6"
        >
          <Swords size={48} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
        >
          ব্যাটল <span className="text-red-500">মুড</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          আপনার চ্যানেলের সাথে অন্য যেকোনো চ্যানেলের তুলনা করুন এবং দেখুন কে এগিয়ে আছে। 
          এআই আপনাকে দিবে জেতার গাইডলাইন।
        </motion.p>
      </div>

      {/* Input Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleBattle}
        className="max-w-4xl mx-auto mb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-400 ml-2">আপনার চ্যানেল লিংক</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-neutral-500 group-focus-within:text-red-500 transition-colors">
                <Users size={20} />
              </div>
              <input
                type="text"
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                placeholder="আপনার চ্যানেল ইউআরএল..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-400 ml-2">প্রতিপক্ষ চ্যানেল লিংক</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-neutral-500 group-focus-within:text-red-500 transition-colors">
                <Target size={20} />
              </div>
              <input
                type="text"
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                placeholder="প্রতিপক্ষ চ্যানেল ইউআরএল..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-red-500/20"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ব্যাটল শুরু হচ্ছে...
            </>
          ) : (
            <>
              ব্যাটল শুরু করুন <Zap size={24} />
            </>
          )}
        </button>
      </motion.form>

      {/* Results Section */}
      <AnimatePresence>
        {result && channel1 && channel2 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Versus Header */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src={channel1.channel.snippet.thumbnails.high.url}
                    alt={channel1.channel.snippet.title}
                    className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-2xl mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  {result.winner === "channel1" && (
                    <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-2 rounded-full shadow-lg">
                      <Trophy size={24} />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{channel1.channel.snippet.title}</h3>
                <p className="text-blue-500 font-bold uppercase text-xs mt-1">আপনার চ্যানেল</p>
              </div>

              <div className="text-5xl font-black text-neutral-700 italic">VS</div>

              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src={channel2.channel.snippet.thumbnails.high.url}
                    alt={channel2.channel.snippet.title}
                    className="w-32 h-32 rounded-full border-4 border-red-500 shadow-2xl mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  {result.winner === "channel2" && (
                    <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-2 rounded-full shadow-lg">
                      <Trophy size={24} />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{channel2.channel.snippet.title}</h3>
                <p className="text-red-500 font-bold uppercase text-xs mt-1">প্রতিপক্ষ</p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-red-500" />
                  পরিসংখ্যান তুলনা
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-neutral-500 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="px-8 py-4 font-bold">মেট্রিক</th>
                      <th className="px-8 py-4 font-bold text-blue-500">আপনার চ্যানেল</th>
                      <th className="px-8 py-4 font-bold text-red-500">প্রতিপক্ষ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.comparison.map((item, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 text-neutral-300 font-medium">{item.metric}</td>
                        <td className={cn(
                          "px-8 py-6 font-bold text-lg",
                          item.advantage === "channel1" ? "text-green-400" : "text-white"
                        )}>
                          {item.channel1Value}
                          {item.advantage === "channel1" && <CheckCircle size={14} className="inline ml-2" />}
                        </td>
                        <td className={cn(
                          "px-8 py-6 font-bold text-lg",
                          item.advantage === "channel2" ? "text-green-400" : "text-white"
                        )}>
                          {item.channel2Value}
                          {item.advantage === "channel2" && <CheckCircle size={14} className="inline ml-2" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Rocket size={28} className="text-blue-500" />
                  এআই রিপোর্ট (AI Report)
                </h3>
                <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed">
                  {result.aiReport}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Target size={28} className="text-red-500" />
                  রোডম্যাপ (Roadmap to Win)
                </h3>
                <div className="space-y-4">
                  {result.roadmap.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-neutral-200">{step}</p>
                    </div>
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
