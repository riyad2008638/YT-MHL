import React from "react";
import { AnalysisResult, YouTubeChannelData, YouTubeVideoData, VideoAnalysisResult } from "../types";
import { analyzeVideoData } from "../lib/gemini";
import {
  Activity,
  Award,
  BarChart,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Crosshair,
  FileText,
  Film,
  Flame,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  MessageSquare,
  MonitorPlay,
  Palette,
  PenTool,
  PieChart,
  Play,
  Rocket,
  Smartphone,
  Star,
  Tag,
  Target,
  TrendingUp,
  Users,
  Video,
  XCircle,
  DollarSign,
  X,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

interface DashboardProps {
  channel: YouTubeChannelData;
  videos: YouTubeVideoData[];
  analysis: AnalysisResult;
}

const getScoreColor = (score: number) => {
  if (score >= 81) return "text-green-500";
  if (score >= 61) return "text-yellow-500";
  if (score >= 41) return "text-orange-500";
  return "text-red-500";
};

const getScoreBg = (score: number) => {
  if (score >= 81) return "bg-green-500/10 border-green-500/20";
  if (score >= 61) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 41) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
};

const Card = ({ title, icon: Icon, children, className, score }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300",
      className
    )}
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      {score !== undefined && (
        <div className={cn("px-4 py-1.5 rounded-full font-bold border", getScoreBg(score), getScoreColor(score))}>
          {score}/100
        </div>
      )}
    </div>
    {children}
  </motion.div>
);

const ListSection = ({ title, items, icon: Icon, type = "bullet" }: any) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        {Icon && <Icon size={16} />} {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-neutral-200">
            {type === "check" ? (
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
            ) : type === "cross" ? (
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
            )}
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function Dashboard({ channel, videos, analysis }: DashboardProps) {
  const [selectedVideo, setSelectedVideo] = React.useState<YouTubeVideoData | null>(null);
  const [videoAnalysis, setVideoAnalysis] = React.useState<VideoAnalysisResult | null>(null);
  const [analyzingVideo, setAnalyzingVideo] = React.useState(false);

  const handleVideoClick = async (video: YouTubeVideoData) => {
    setSelectedVideo(video);
    setAnalyzingVideo(true);
    setVideoAnalysis(null);
    try {
      const result = await analyzeVideoData(video);
      setVideoAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzingVideo(false);
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
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
      {/* Channel Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl overflow-hidden relative"
      >
        {channel.brandingSettings?.image?.bannerExternalUrl && (
          <div
            className="h-32 md:h-48 w-full bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${channel.brandingSettings.image.bannerExternalUrl})` }}
          />
        )}
        <div className="p-4 md:p-8 relative z-10 -mt-12 md:-mt-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
            <img
              src={channel.snippet.thumbnails.high.url}
              alt="Channel Logo"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-neutral-900 shadow-2xl"
            />
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">{channel.snippet.title}</h1>
              <p className="text-sm md:text-base text-neutral-400 mb-3 md:mb-4">{channel.snippet.customUrl}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 text-sm md:text-base">
                  <Users size={16} className="text-red-500 md:w-[18px] md:h-[18px]" />
                  <span className="font-semibold text-white">{formatNumber(channel.statistics.subscriberCount)}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 text-sm md:text-base">
                  <Play size={16} className="text-red-500 md:w-[18px] md:h-[18px]" />
                  <span className="font-semibold text-white">{formatNumber(channel.statistics.viewCount)}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 text-sm md:text-base">
                  <Video size={16} className="text-red-500 md:w-[18px] md:h-[18px]" />
                  <span className="font-semibold text-white">{formatNumber(channel.statistics.videoCount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overall Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card title="সার্বিক হেলথ স্কোর" icon={Activity} className="lg:col-span-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <motion.circle
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${(analysis.overallScore / 100) * 251} 251` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="50" cy="50" r="40" fill="transparent"
                stroke={analysis.overallScore >= 80 ? "#22c55e" : analysis.overallScore >= 60 ? "#eab308" : "#ef4444"}
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-white">{analysis.overallScore}</span>
              <span className={cn("text-2xl font-bold mt-1", getScoreColor(analysis.overallScore))}>
                গ্রেড {analysis.grade}
              </span>
            </div>
          </div>
        </Card>

        <Card title="ক্যাটাগরি ভিত্তিক স্কোর" icon={BarChart} className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { label: "থাম্বনেইল", score: analysis.thumbnailAnalysis.score },
              { label: "এসইও (SEO)", score: analysis.seoAnalysis.score },
              { label: "নিশ স্পষ্টতা", score: analysis.nicheClarity.score },
              { label: "আপলোড শিডিউল", score: analysis.uploadSchedule.score },
              { label: "ট্যাগ ও কিওয়ার্ড", score: analysis.tagAnalysis.score },
              { label: "এনগেজমেন্ট", score: analysis.engagementAnalysis.score },
            ].map((cat, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4">
                <div className="w-24 md:w-32 text-xs md:text-sm font-medium text-neutral-300">{cat.label}</div>
                <div className="flex-1 h-2 md:h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={cn("h-full rounded-full", cat.score >= 80 ? "bg-green-500" : cat.score >= 60 ? "bg-yellow-500" : "bg-red-500")}
                  />
                </div>
                <div className="w-12 text-right text-sm font-bold text-white">{cat.score}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Grid for all other cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Thumbnails */}
        <Card title="থাম্বনেইল ধারাবাহিকতা" icon={ImageIcon} score={analysis.thumbnailAnalysis.score}>
          <ListSection title="পর্যবেক্ষণ" items={analysis.thumbnailAnalysis.observations} />
          <ListSection title="সুপারিশ" items={analysis.thumbnailAnalysis.recommendations} type="check" />
        </Card>

        {/* SEO */}
        <Card title="টাইটেল ও ডেসক্রিপশন এসইও" icon={FileText} score={analysis.seoAnalysis.score}>
          <ListSection title="টাইটেল পর্যবেক্ষণ" items={analysis.seoAnalysis.titleObservations} />
          <ListSection title="ডেসক্রিপশন পর্যবেক্ষণ" items={analysis.seoAnalysis.descriptionObservations} />
          <ListSection title="সুপারিশ" items={analysis.seoAnalysis.recommendations} type="check" />
        </Card>

        {/* Niche Clarity */}
        <Card title="নিশ (Niche) স্পষ্টতা" icon={Target} score={analysis.nicheClarity.score}>
          <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-sm text-neutral-400">শনাক্তকৃত নিশ</div>
            <div className="text-xl font-bold text-white mt-1">{analysis.nicheClarity.detectedNiche}</div>
            <div className="text-sm text-green-400 mt-1">{analysis.nicheClarity.confidence}% নিশ্চয়তা</div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(analysis.nicheClarity.topicBreakdown).map(([topic, pct], i) => (
              <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-neutral-200">
                {topic}: {pct}%
              </span>
            ))}
          </div>
          <ListSection title="পর্যবেক্ষণ" items={analysis.nicheClarity.observations} />
          <ListSection title="সুপারিশ" items={analysis.nicheClarity.recommendations} type="check" />
        </Card>

        {/* Growth Tips */}
        <Card title="ব্যক্তিগতকৃত গ্রোথ টিপস" icon={Rocket}>
          <div className="space-y-4">
            {analysis.growthTips.map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="shrink-0 mt-1">
                  {tip.priority === 'high' ? <Flame className="text-red-500" size={20} /> :
                   tip.priority === 'medium' ? <Star className="text-yellow-500" size={20} /> :
                   <CheckCircle className="text-green-500" size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-white">{tip.tip}</h4>
                  <p className="text-sm text-neutral-400 mt-1">{tip.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upload Schedule */}
        <Card title="আপলোড শিডিউল অপ্টিমাইজার" icon={Calendar} score={analysis.uploadSchedule.score}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-neutral-400">সেরা দিন</div>
              <div className="font-bold text-white mt-1">{analysis.uploadSchedule.suggestedDays.join(", ")}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-neutral-400">সেরা সময়</div>
              <div className="font-bold text-white mt-1">{analysis.uploadSchedule.suggestedTime}</div>
            </div>
          </div>
          <ListSection title="পর্যবেক্ষণ" items={analysis.uploadSchedule.observations} />
          <ListSection title="সুপারিশ" items={analysis.uploadSchedule.recommendations} type="check" />
        </Card>

        {/* Viral Predictor */}
        <Card title="ভাইরাল হওয়ার সম্ভাবনা" icon={Flame}>
          <div className="space-y-4">
            {analysis.viralAnalysis.map((v, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-sm line-clamp-2 pr-4">{v.title}</h4>
                  <span className={cn("font-bold shrink-0", getScoreColor(v.viralScore))}>{v.viralScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div className={cn("h-full", getScoreColor(v.viralScore).replace('text', 'bg'))} style={{ width: `${v.viralScore}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-green-400 font-semibold">শক্তিশালী দিক:</span>
                    <ul className="mt-1 space-y-1 text-neutral-400">
                      {v.strengths.slice(0, 2).map((s, j) => <li key={j}>• {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="text-red-400 font-semibold">দুর্বল দিক:</span>
                    <ul className="mt-1 space-y-1 text-neutral-400">
                      {v.weaknesses.slice(0, 2).map((w, j) => <li key={j}>• {w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tags & Keywords */}
        <Card title="ট্যাগ ও কিওয়ার্ড বিশ্লেষণ" icon={Tag} score={analysis.tagAnalysis.score}>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-neutral-400 mb-2">ট্রেন্ডিং কিওয়ার্ড</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.tagAnalysis.trendingKeywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-1">
                  {kw.volume === 'high' ? '🔥' : kw.volume === 'rising' ? '📈' : '📊'} {kw.keyword}
                </span>
              ))}
            </div>
          </div>
          <ListSection title="অনুপস্থিত ট্যাগ" items={analysis.tagAnalysis.missingTags} type="cross" />
          <ListSection title="সুপারিশ" items={analysis.tagAnalysis.recommendations} type="check" />
        </Card>

        {/* Sentiment Analysis */}
        <Card title="দর্শকের মনোভাব (Sentiment)" icon={MessageSquare}>
          <div className="flex h-4 rounded-full overflow-hidden mb-6">
            <div className="bg-green-500" style={{ width: `${analysis.sentimentAnalysis.positive}%` }} />
            <div className="bg-yellow-500" style={{ width: `${analysis.sentimentAnalysis.neutral}%` }} />
            <div className="bg-red-500" style={{ width: `${analysis.sentimentAnalysis.negative}%` }} />
          </div>
          <div className="flex justify-between text-sm font-bold mb-6">
            <span className="text-green-500">😊 {analysis.sentimentAnalysis.positive}%</span>
            <span className="text-yellow-500">😐 {analysis.sentimentAnalysis.neutral}%</span>
            <span className="text-red-500">😡 {analysis.sentimentAnalysis.negative}%</span>
          </div>
          <ListSection title="শীর্ষ অনুরোধ" items={analysis.sentimentAnalysis.topRequests} />
          <ListSection title="শীর্ষ অভিযোগ" items={analysis.sentimentAnalysis.topComplaints} type="cross" />
          <ListSection title="সুপারিশ" items={analysis.sentimentAnalysis.recommendations} type="check" />
        </Card>

        {/* Content Format */}
        <Card title="শর্টস বনাম লং-ফর্ম" icon={Film}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <div className="text-sm text-neutral-400 mb-1">শর্টস গড় ভিউ</div>
              <div className="text-2xl font-bold text-white">{formatNumber(analysis.contentFormatAnalysis.shortsPerformance.avgViews)}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <div className="text-sm text-neutral-400 mb-1">লং-ফর্ম গড় ভিউ</div>
              <div className="text-2xl font-bold text-white">{formatNumber(analysis.contentFormatAnalysis.longFormPerformance.avgViews)}</div>
            </div>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-center">
            <div className="text-sm text-red-400 font-semibold mb-1">প্রস্তাবিত অনুপাত</div>
            <div className="text-lg font-bold text-white">{analysis.contentFormatAnalysis.suggestedRatio}</div>
          </div>
          <ListSection title="সুপারিশ" items={analysis.contentFormatAnalysis.recommendations} type="check" />
        </Card>

        {/* Branding Audit */}
        <Card title="চ্যানেল ব্র্যান্ডিং অডিট" icon={Palette} score={analysis.brandingAudit.score}>
          <div className="space-y-3 mb-6">
            {analysis.brandingAudit.checklist.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-neutral-200">{item.item}</span>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-bold uppercase",
                  item.status === 'good' ? "bg-green-500/20 text-green-400" :
                  item.status === 'weak' ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                )}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <ListSection title="সুপারিশ" items={analysis.brandingAudit.recommendations} type="check" />
        </Card>

        {/* Content Calendar */}
        <Card title="এআই কনটেন্ট ক্যালেন্ডার" icon={Calendar} className="md:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 text-sm">
                  <th className="pb-3 font-medium">সপ্তাহ/দিন</th>
                  <th className="pb-3 font-medium">ধরন</th>
                  <th className="pb-3 font-medium">প্রস্তাবিত টাইটেল</th>
                  <th className="pb-3 font-medium">সম্ভাব্য ভিউ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {analysis.contentCalendar.map((item, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-neutral-300 whitespace-nowrap">সপ্তাহ {item.week} - {item.day}</td>
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold uppercase",
                        item.type === 'long' ? "bg-blue-500/20 text-blue-400" :
                        item.type === 'short' ? "bg-purple-500/20 text-purple-400" :
                        "bg-orange-500/20 text-orange-400"
                      )}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 text-white font-medium">{item.suggestedTitle}</td>
                    <td className="py-4 text-green-400 font-semibold">{item.predictedViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Playlist Strategy */}
        <Card title="প্লেলিস্ট স্ট্র্যাটেজি" icon={List} score={analysis.playlistStrategy.score}>
          <div className="mb-4">
            <span className="text-red-400 font-bold">{analysis.playlistStrategy.orphanVideos}টি ভিডিও</span> কোনো প্লেলিস্টে নেই!
          </div>
          <ListSection title="প্রস্তাবিত প্লেলিস্ট" items={analysis.playlistStrategy.suggestedPlaylists.map(p => `${p.name}: ${p.reason}`)} />
          <ListSection title="সুপারিশ" items={analysis.playlistStrategy.recommendations} type="check" />
        </Card>

        {/* Hook Analysis */}
        <Card title="হুক ও রিটেনশন" icon={Crosshair} score={analysis.hookAnalysis.score}>
          <ListSection title="শনাক্তকৃত সমস্যা" items={analysis.hookAnalysis.problems} type="cross" />
          <ListSection title="চেষ্টা করার মতো হুক টেমপ্লেট" items={analysis.hookAnalysis.hookTemplates} />
          <ListSection title="সুপারিশ" items={analysis.hookAnalysis.recommendations} type="check" />
        </Card>

        {/* Monetization */}
        <Card title="মনিটাইজেশন প্রস্তুতি" icon={DollarSign}>
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">সাবস্ক্রাইবার</span>
                <span className="text-white font-bold">{formatNumber(analysis.monetization.subscriberProgress.current)} / 1K</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${Math.min(100, analysis.monetization.subscriberProgress.percentage)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">ওয়াচ আওয়ার (আনুমানিক)</span>
                <span className="text-white font-bold">{formatNumber(analysis.monetization.estimatedWatchHours)} / 4K</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (analysis.monetization.estimatedWatchHours / 4000) * 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-4 text-center">
            <div className="text-sm text-green-400 font-semibold mb-1">আনুমানিক মাসিক আয়</div>
            <div className="text-xl font-bold text-white">
              {analysis.monetization.estimatedMonthlyRevenue.currency} {analysis.monetization.estimatedMonthlyRevenue.min} - {analysis.monetization.estimatedMonthlyRevenue.max}
            </div>
          </div>
          <ListSection title="আয় বৈচিত্র্যময় করার টিপস" items={analysis.monetization.diversificationTips} />
        </Card>

        {/* Cross Platform */}
        <Card title="ক্রস-প্ল্যাটফর্ম স্ট্র্যাটেজি" icon={Smartphone}>
          <div className="space-y-3 mb-6">
            {analysis.crossPlatform.repurposingPlan.map((plan, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="font-bold text-white text-sm mb-1">{plan.platform} ({plan.contentType})</div>
                <div className="text-sm text-neutral-400">{plan.tip}</div>
              </div>
            ))}
          </div>
          <ListSection title="সুপারিশ" items={analysis.crossPlatform.recommendations} type="check" />
        </Card>

        {/* AI Ideas */}
        <Card title="এআই কনটেন্ট জেনারেটর" icon={PenTool} className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">পরবর্তী ভিডিওর আইডিয়া</h4>
              <div className="space-y-4">
                {analysis.contentIdeas.map((idea, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h5 className="font-bold text-white mb-2">{idea.title}</h5>
                    <div className="flex gap-3 text-xs mb-2">
                      <span className="text-red-400 font-semibold">ভাইরাল সম্ভাবনা: {idea.viralPotential}%</span>
                      <span className="text-yellow-400 font-semibold capitalize">কঠিনতা: {idea.difficulty}</span>
                    </div>
                    <p className="text-sm text-neutral-400">{idea.reason}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">টাইটেল অপ্টিমাইজেশন</h4>
              <div className="space-y-4">
                {analysis.titleOptimization.slice(0, 3).map((opt, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-neutral-500 mb-1 line-through">{opt.original}</div>
                    <div className="font-bold text-green-400 mb-2">{opt.improved[0]}</div>
                    <p className="text-xs text-neutral-400">{opt.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Engagement */}
        <Card title="এনগেজমেন্ট বিশ্লেষণ" icon={Heart} score={analysis.engagementAnalysis.score}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <div className="text-sm text-neutral-400 mb-1">লাইক অনুপাত</div>
              <div className="text-xl font-bold text-white">{(analysis.engagementAnalysis.avgLikeRatio * 100).toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <div className="text-sm text-neutral-400 mb-1">কমেন্ট অনুপাত</div>
              <div className="text-xl font-bold text-white">{(analysis.engagementAnalysis.avgCommentRatio * 100).toFixed(2)}%</div>
            </div>
          </div>
          <ListSection title="সুপারিশ" items={analysis.engagementAnalysis.recommendations} type="check" />
        </Card>

        {/* Length Optimization */}
        <Card title="ভিডিওর দৈর্ঘ্য অপ্টিমাইজেশন" icon={Clock}>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6 text-center">
            <div className="text-sm text-neutral-400 mb-1">আদর্শ দৈর্ঘ্য (Sweet Spot)</div>
            <div className="text-xl font-bold text-green-400">{analysis.videoLengthOptimization.sweetSpot}</div>
          </div>
          <ListSection title="সুপারিশ" items={analysis.videoLengthOptimization.recommendations} type="check" />
        </Card>

      </div>

      {/* All Videos Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
              <Video size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">চ্যানেলের ভিডিওসমূহ</h2>
          </div>
          <p className="text-neutral-400 text-sm">{videos.length} টি ভিডিও পাওয়া গেছে</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleVideoClick(video)}
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="relative aspect-video">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded">
                  {video.contentDetails.duration.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", "")}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                    <Sparkles size={14} />
                    বিশ্লেষণ দেখুন
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
                  {video.snippet.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Play size={10} />
                    {formatNumber(video.statistics.viewCount)} ভিউ
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(video.snippet.publishedAt).toLocaleDateString("bn-BD")}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Analysis Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#141414] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">ভিডিও বিশ্লেষণ (AI Analysis)</h2>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8">
                  <div className="w-full md:w-1/3 shrink-0">
                    <img
                      src={selectedVideo.snippet.thumbnails.high.url}
                      alt={selectedVideo.snippet.title}
                      className="w-full rounded-2xl shadow-xl border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{selectedVideo.snippet.title}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                        <div className="text-[10px] text-neutral-500 uppercase mb-1">ভিউ</div>
                        <div className="text-sm font-bold text-white">{formatNumber(selectedVideo.statistics.viewCount)}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                        <div className="text-[10px] text-neutral-500 uppercase mb-1">লাইক</div>
                        <div className="text-sm font-bold text-white">{formatNumber(selectedVideo.statistics.likeCount)}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                        <div className="text-[10px] text-neutral-500 uppercase mb-1">কমেন্ট</div>
                        <div className="text-sm font-bold text-white">{formatNumber(selectedVideo.statistics.commentCount)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {analyzingVideo ? (
                  <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                    <div className="relative w-12 h-12 mb-4">
                      <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white font-medium">এআই বিশ্লেষণ করছে...</p>
                  </div>
                ) : videoAnalysis ? (
                  <div className="space-y-8">
                    {/* Scores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "থাম্বনেইল স্কোর", score: videoAnalysis.thumbnailScore, icon: ImageIcon },
                        { label: "টাইটেল স্কোর", score: videoAnalysis.titleScore, icon: FileText },
                        { label: "এসইও স্কোর", score: videoAnalysis.seoScore, icon: Search },
                        { label: "ওভারঅল স্কোর", score: videoAnalysis.overallScore, icon: Activity },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg", getScoreBg(item.score).split(' ')[0], getScoreColor(item.score))}>
                            <item.icon size={20} />
                          </div>
                          <div>
                            <div className="text-[10px] text-neutral-500 uppercase">{item.label}</div>
                            <div className={cn("text-xl font-bold", getScoreColor(item.score))}>{item.score}%</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Problems & Solutions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                        <h4 className="text-red-500 font-bold flex items-center gap-2 mb-4">
                          <AlertTriangle size={18} />
                          সমস্যাসমূহ (Problems)
                        </h4>
                        <ul className="space-y-4">
                          {videoAnalysis.problems.map((p, i) => (
                            <li key={i} className="space-y-1">
                              <div className="text-white font-semibold text-sm">• {p.problem}</div>
                              <div className="text-neutral-400 text-xs pl-3">সমাধান: {p.solution}</div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6">
                        <h4 className="text-green-500 font-bold flex items-center gap-2 mb-4">
                          <Lightbulb size={18} />
                          গাইডলাইন (Guidelines)
                        </h4>
                        <ul className="space-y-3">
                          {videoAnalysis.guidelines.map((g, i) => (
                            <li key={i} className="flex items-start gap-2 text-neutral-300 text-sm">
                              <CheckCircle size={14} className="text-green-500 mt-1 shrink-0" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t border-white/5 bg-white/5 flex justify-end">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-6 py-2.5 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating AI Coach Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Link
          to="/ai-coach"
          className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-red-500/40 font-bold transition-all hover:scale-110 active:scale-95 group"
        >
          <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
          <span>AI Coach (AI Mode)</span>
        </Link>
      </motion.div>
    </div>
  );
}
