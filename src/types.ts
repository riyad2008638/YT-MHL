export interface YouTubeChannelData {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string;
    };
  };
  brandingSettings?: {
    image?: {
      bannerExternalUrl?: string;
    };
  };
}

export interface YouTubeVideoData {
  id: string;
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    thumbnails: any;
    channelTitle: string;
    tags?: string[];
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export interface AnalysisResult {
  overallScore: number;
  grade: string;
  thumbnailAnalysis: {
    score: number;
    observations: string[];
    recommendations: string[];
  };
  seoAnalysis: {
    score: number;
    titleObservations: string[];
    descriptionObservations: string[];
    recommendations: string[];
  };
  nicheClarity: {
    score: number;
    detectedNiche: string;
    confidence: number;
    topicBreakdown: Record<string, number>;
    observations: string[];
    recommendations: string[];
  };
  growthTips: {
    priority: "high" | "medium" | "low";
    tip: string;
    explanation: string;
  }[];
  uploadSchedule: {
    score: number;
    currentPattern: string;
    suggestedDays: string[];
    suggestedTime: string;
    frequency: string;
    observations: string[];
    recommendations: string[];
  };
  viralAnalysis: {
    title: string;
    viralScore: number;
    strengths: string[];
    weaknesses: string[];
  }[];
  tagAnalysis: {
    score: number;
    currentTags: string[];
    missingTags: string[];
    trendingKeywords: { keyword: string; volume: "high" | "medium" | "rising" }[];
    recommendations: string[];
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    topRequests: string[];
    topComplaints: string[];
    recommendations: string[];
  };
  contentFormatAnalysis: {
    shortsPerformance: { avgViews: number; avgEngagement: number };
    longFormPerformance: { avgViews: number; avgEngagement: number };
    suggestedRatio: string;
    recommendations: string[];
  };
  brandingAudit: {
    score: number;
    checklist: { item: string; status: "good" | "weak" | "missing"; rating: number }[];
    recommendations: string[];
  };
  contentCalendar: {
    week: number;
    day: string;
    type: "long" | "short" | "community";
    suggestedTitle: string;
    tags: string[];
    predictedViews: string;
  }[];
  playlistStrategy: {
    score: number;
    currentPlaylists: { name: string; videoCount: number; rating: string }[];
    orphanVideos: number;
    suggestedPlaylists: { name: string; reason: string }[];
    endScreenUsage: number;
    cardUsage: number;
    recommendations: string[];
  };
  hookAnalysis: {
    score: number;
    commonPatterns: string[];
    problems: string[];
    hookTemplates: string[];
    recommendations: string[];
  };
  monetization: {
    subscriberProgress: { current: number; target: number; percentage: number };
    estimatedWatchHours: number;
    estimatedDaysToMonetization: number;
    estimatedMonthlyRevenue: { min: number; max: number; currency: string };
    diversificationTips: string[];
  };
  crossPlatform: {
    repurposingPlan: { platform: string; contentType: string; tip: string }[];
    recommendations: string[];
  };
  contentIdeas: {
    title: string;
    viralPotential: number;
    difficulty: "easy" | "medium" | "hard";
    reason: string;
  }[];
  titleOptimization: {
    original: string;
    improved: string[];
    explanation: string;
  }[];
  descriptionTemplate: string;
  engagementAnalysis: {
    score: number;
    avgLikeRatio: number;
    avgCommentRatio: number;
    trend: "improving" | "stable" | "declining";
    topPerforming: { title: string; reason: string }[];
    lowPerforming: { title: string; reason: string }[];
    recommendations: string[];
  };
  videoLengthOptimization: {
    avgLength: string;
    optimalLength: string;
    sweetSpot: string;
    recommendations: string[];
  };
}

export interface VideoAnalysisResult {
  thumbnailScore: number;
  titleScore: number;
  seoScore: number;
  overallScore: number;
  problems: { problem: string; solution: string }[];
  guidelines: string[];
}

export interface BattleAnalysisResult {
  winner: "channel1" | "channel2" | "draw";
  comparison: {
    metric: string;
    channel1Value: string | number;
    channel2Value: string | number;
    advantage: "channel1" | "channel2" | "none";
  }[];
  aiReport: string;
  roadmap: string[];
}

export interface ViralPulseResult {
  detectedNiche: string;
  nicheDescription: string;
  topViralTopics: {
    title: string;
    reason: string;
    viralPotential: number;
    thumbnailConcept: string;
    titleHook: string;
    strategy: string;
    referenceVideoId?: string;
  }[];
  globalTrends: string[];
  engagementInsights: string;
  referenceVideos?: YouTubeVideoData[];
  styleAnalysis?: string;
}
