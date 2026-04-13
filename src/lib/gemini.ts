import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { YouTubeChannelData, YouTubeVideoData, AnalysisResult, VideoAnalysisResult, BattleAnalysisResult, ViralPulseResult } from "../types";

export const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error. Text length:", text.length, "Error:", e);
    // Try to fix common truncation issues (very basic)
    if (text.trim().endsWith('"') || text.trim().endsWith('}') || text.trim().endsWith(']')) {
      // It might be just missing a closing brace if it's an object
      try {
        if (text.trim().startsWith('{') && !text.trim().endsWith('}')) {
          return JSON.parse(text.trim() + '}');
        }
      } catch (inner) {}
    }
    throw e;
  }
};

export async function analyzeChannelData(
  channel: YouTubeChannelData,
  videos: YouTubeVideoData[]
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Limit to 15 most recent videos to avoid massive context and response
  const limitedVideos = videos.slice(0, 15);

  // Prepare a concise version of the data to avoid token limits
  const conciseData = {
    channel: {
      title: channel.snippet.title,
      description: channel.snippet.description?.substring(0, 500),
      publishedAt: channel.snippet.publishedAt,
      stats: channel.statistics,
    },
    videos: limitedVideos.map((v) => ({
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      tags: v.snippet.tags?.slice(0, 5), // Further limit tags
      duration: v.contentDetails.duration,
      stats: v.statistics,
    })),
  };

  const prompt = `
You are an expert YouTube growth consultant and SEO specialist. Analyze the following YouTube channel data and provide detailed, actionable insights.

Channel Data:
${JSON.stringify(conciseData, null, 2)}

Please analyze and respond in the exact JSON format specified by the schema.
Be specific, data-driven, and actionable. Use the actual video data to make personalized recommendations. Don't be generic.

CRITICAL INSTRUCTION: All text content within the JSON response (such as observations, recommendations, tips, reasons, explanations, titles, etc.) MUST be written in the Bengali (বাংলা) language. Keep the JSON keys in English as defined in the schema, but the values must be in Bengali.
`;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          thumbnailAnalysis: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              observations: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          seoAnalysis: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              titleObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
              descriptionObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          nicheClarity: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              detectedNiche: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              topicBreakdown: { type: Type.OBJECT },
              observations: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          growthTips: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                priority: { type: Type.STRING },
                tip: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
            },
          },
          uploadSchedule: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              currentPattern: { type: Type.STRING },
              suggestedDays: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedTime: { type: Type.STRING },
              frequency: { type: Type.STRING },
              observations: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          viralAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                viralScore: { type: Type.NUMBER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
          tagAnalysis: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              currentTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              trendingKeywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    volume: { type: Type.STRING },
                  },
                },
              },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          sentimentAnalysis: {
            type: Type.OBJECT,
            properties: {
              positive: { type: Type.NUMBER },
              neutral: { type: Type.NUMBER },
              negative: { type: Type.NUMBER },
              topRequests: { type: Type.ARRAY, items: { type: Type.STRING } },
              topComplaints: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          contentFormatAnalysis: {
            type: Type.OBJECT,
            properties: {
              shortsPerformance: {
                type: Type.OBJECT,
                properties: { avgViews: { type: Type.NUMBER }, avgEngagement: { type: Type.NUMBER } },
              },
              longFormPerformance: {
                type: Type.OBJECT,
                properties: { avgViews: { type: Type.NUMBER }, avgEngagement: { type: Type.NUMBER } },
              },
              suggestedRatio: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          brandingAudit: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              checklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    status: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                  },
                },
              },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          contentCalendar: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.NUMBER },
                day: { type: Type.STRING },
                type: { type: Type.STRING },
                suggestedTitle: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                predictedViews: { type: Type.STRING },
              },
            },
          },
          playlistStrategy: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              currentPlaylists: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    videoCount: { type: Type.NUMBER },
                    rating: { type: Type.STRING },
                  },
                },
              },
              orphanVideos: { type: Type.NUMBER },
              suggestedPlaylists: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                },
              },
              endScreenUsage: { type: Type.NUMBER },
              cardUsage: { type: Type.NUMBER },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          hookAnalysis: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              commonPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
              problems: { type: Type.ARRAY, items: { type: Type.STRING } },
              hookTemplates: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          monetization: {
            type: Type.OBJECT,
            properties: {
              subscriberProgress: {
                type: Type.OBJECT,
                properties: {
                  current: { type: Type.NUMBER },
                  target: { type: Type.NUMBER },
                  percentage: { type: Type.NUMBER },
                },
              },
              estimatedWatchHours: { type: Type.NUMBER },
              estimatedDaysToMonetization: { type: Type.NUMBER },
              estimatedMonthlyRevenue: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                },
              },
              diversificationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          crossPlatform: {
            type: Type.OBJECT,
            properties: {
              repurposingPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    platform: { type: Type.STRING },
                    contentType: { type: Type.STRING },
                    tip: { type: Type.STRING },
                  },
                },
              },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          contentIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                viralPotential: { type: Type.NUMBER },
                difficulty: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
            },
          },
          titleOptimization: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                improved: { type: Type.ARRAY, items: { type: Type.STRING } },
                explanation: { type: Type.STRING },
              },
            },
          },
          descriptionTemplate: { type: Type.STRING },
          engagementAnalysis: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              avgLikeRatio: { type: Type.NUMBER },
              avgCommentRatio: { type: Type.NUMBER },
              trend: { type: Type.STRING },
              topPerforming: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } },
                },
              },
              lowPerforming: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } },
                },
              },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          videoLengthOptimization: {
            type: Type.OBJECT,
            properties: {
              avgLength: { type: Type.STRING },
              optimalLength: { type: Type.STRING },
              sweetSpot: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      },
    },
  }));

  if (!response.text) {
    throw new Error("Failed to generate analysis from AI.");
  }

  try {
    const result = safeJsonParse(response.text);
    return {
      overallScore: result?.overallScore || 0,
      grade: result?.grade || "N/A",
      thumbnailAnalysis: {
        score: result?.thumbnailAnalysis?.score || 0,
        observations: result?.thumbnailAnalysis?.observations || [],
        recommendations: result?.thumbnailAnalysis?.recommendations || [],
      },
      seoAnalysis: {
        score: result?.seoAnalysis?.score || 0,
        titleObservations: result?.seoAnalysis?.titleObservations || [],
        descriptionObservations: result?.seoAnalysis?.descriptionObservations || [],
        recommendations: result?.seoAnalysis?.recommendations || [],
      },
      nicheClarity: {
        score: result?.nicheClarity?.score || 0,
        detectedNiche: result?.nicheClarity?.detectedNiche || "Unknown",
        confidence: result?.nicheClarity?.confidence || 0,
        topicBreakdown: result?.nicheClarity?.topicBreakdown || {},
        observations: result?.nicheClarity?.observations || [],
        recommendations: result?.nicheClarity?.recommendations || [],
      },
      growthTips: result?.growthTips || [],
      uploadSchedule: {
        score: result?.uploadSchedule?.score || 0,
        currentPattern: result?.uploadSchedule?.currentPattern || "Unknown",
        suggestedDays: result?.uploadSchedule?.suggestedDays || [],
        suggestedTime: result?.uploadSchedule?.suggestedTime || "Unknown",
        frequency: result?.uploadSchedule?.frequency || "Unknown",
        observations: result?.uploadSchedule?.observations || [],
        recommendations: result?.uploadSchedule?.recommendations || [],
      },
      viralAnalysis: result?.viralAnalysis || [],
      tagAnalysis: {
        score: result?.tagAnalysis?.score || 0,
        currentTags: result?.tagAnalysis?.currentTags || [],
        missingTags: result?.tagAnalysis?.missingTags || [],
        trendingKeywords: result?.tagAnalysis?.trendingKeywords || [],
        recommendations: result?.tagAnalysis?.recommendations || [],
      },
      sentimentAnalysis: {
        positive: result?.sentimentAnalysis?.positive || 0,
        neutral: result?.sentimentAnalysis?.neutral || 0,
        negative: result?.sentimentAnalysis?.negative || 0,
        topRequests: result?.sentimentAnalysis?.topRequests || [],
        topComplaints: result?.sentimentAnalysis?.topComplaints || [],
        recommendations: result?.sentimentAnalysis?.recommendations || [],
      },
      contentFormatAnalysis: {
        shortsPerformance: {
          avgViews: result?.contentFormatAnalysis?.shortsPerformance?.avgViews || 0,
          avgEngagement: result?.contentFormatAnalysis?.shortsPerformance?.avgEngagement || 0,
        },
        longFormPerformance: {
          avgViews: result?.contentFormatAnalysis?.longFormPerformance?.avgViews || 0,
          avgEngagement: result?.contentFormatAnalysis?.longFormPerformance?.avgEngagement || 0,
        },
        suggestedRatio: result?.contentFormatAnalysis?.suggestedRatio || "Unknown",
        recommendations: result?.contentFormatAnalysis?.recommendations || [],
      },
      brandingAudit: {
        score: result?.brandingAudit?.score || 0,
        checklist: result?.brandingAudit?.checklist || [],
        recommendations: result?.brandingAudit?.recommendations || [],
      },
      contentCalendar: result?.contentCalendar || [],
      playlistStrategy: {
        score: result?.playlistStrategy?.score || 0,
        currentPlaylists: result?.playlistStrategy?.currentPlaylists || [],
        orphanVideos: result?.playlistStrategy?.orphanVideos || 0,
        suggestedPlaylists: result?.playlistStrategy?.suggestedPlaylists || [],
        endScreenUsage: result?.playlistStrategy?.endScreenUsage || 0,
        cardUsage: result?.playlistStrategy?.cardUsage || 0,
        recommendations: result?.playlistStrategy?.recommendations || [],
      },
      hookAnalysis: {
        score: result?.hookAnalysis?.score || 0,
        commonPatterns: result?.hookAnalysis?.commonPatterns || [],
        problems: result?.hookAnalysis?.problems || [],
        hookTemplates: result?.hookAnalysis?.hookTemplates || [],
        recommendations: result?.hookAnalysis?.recommendations || [],
      },
      monetization: {
        subscriberProgress: {
          current: result?.monetization?.subscriberProgress?.current || 0,
          target: result?.monetization?.subscriberProgress?.target || 1000,
          percentage: result?.monetization?.subscriberProgress?.percentage || 0,
        },
        estimatedWatchHours: result?.monetization?.estimatedWatchHours || 0,
        estimatedDaysToMonetization: result?.monetization?.estimatedDaysToMonetization || 0,
        estimatedMonthlyRevenue: {
          min: result?.monetization?.estimatedMonthlyRevenue?.min || 0,
          max: result?.monetization?.estimatedMonthlyRevenue?.max || 0,
          currency: result?.monetization?.estimatedMonthlyRevenue?.currency || "USD",
        },
        diversificationTips: result?.monetization?.diversificationTips || [],
      },
      crossPlatform: {
        repurposingPlan: result?.crossPlatform?.repurposingPlan || [],
        recommendations: result?.crossPlatform?.recommendations || [],
      },
      contentIdeas: result?.contentIdeas || [],
      titleOptimization: result?.titleOptimization || [],
      descriptionTemplate: result?.descriptionTemplate || "",
      engagementAnalysis: {
        score: result?.engagementAnalysis?.score || 0,
        avgLikeRatio: result?.engagementAnalysis?.avgLikeRatio || 0,
        avgCommentRatio: result?.engagementAnalysis?.avgCommentRatio || 0,
        trend: result?.engagementAnalysis?.trend || "stable",
        topPerforming: result?.engagementAnalysis?.topPerforming || [],
        lowPerforming: result?.engagementAnalysis?.lowPerforming || [],
        recommendations: result?.engagementAnalysis?.recommendations || [],
      },
      videoLengthOptimization: {
        avgLength: result?.videoLengthOptimization?.avgLength || "0:00",
        optimalLength: result?.videoLengthOptimization?.optimalLength || "0:00",
        sweetSpot: result?.videoLengthOptimization?.sweetSpot || "0:00",
        recommendations: result?.videoLengthOptimization?.recommendations || [],
      },
    };
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("AI রেসপন্স প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
}

export async function analyzeVideoData(video: YouTubeVideoData): Promise<VideoAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this YouTube video for SEO and quality:
    Title: ${video.snippet.title}
    Description: ${video.snippet.description}
    Tags: ${video.snippet.tags?.join(", ") || "None"}
    Stats: ${JSON.stringify(video.statistics)}

    Provide scores (0-100) for thumbnail (based on title/context), title, and SEO.
    Identify specific problems and provide solutions.
    Provide actionable guidelines.

    CRITICAL: Response MUST be in Bengali (বাংলা) for all text values. JSON keys must be English.
  `;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thumbnailScore: { type: Type.NUMBER },
          titleScore: { type: Type.NUMBER },
          seoScore: { type: Type.NUMBER },
          overallScore: { type: Type.NUMBER },
          problems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING },
                solution: { type: Type.STRING }
              }
            }
          },
          guidelines: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }));

  const result = safeJsonParse(response.text);
  return {
    thumbnailScore: result?.thumbnailScore || 0,
    titleScore: result?.titleScore || 0,
    seoScore: result?.seoScore || 0,
    overallScore: result?.overallScore || 0,
    problems: result?.problems || [],
    guidelines: result?.guidelines || []
  };
}

export async function compareChannels(
  channel1: YouTubeChannelData,
  videos1: YouTubeVideoData[],
  channel2: YouTubeChannelData,
  videos2: YouTubeVideoData[]
): Promise<BattleAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const data = {
    myChannel: {
      title: channel1.snippet.title,
      stats: channel1.statistics,
      recentVideos: videos1.slice(0, 5).map(v => v.snippet.title)
    },
    competitor: {
      title: channel2.snippet.title,
      stats: channel2.statistics,
      recentVideos: videos2.slice(0, 5).map(v => v.snippet.title)
    }
  };

  const prompt = `
    Compare these two YouTube channels (Battle Mode). 
    Channel 1 is the user's channel. Channel 2 is the competitor.
    
    Data: ${JSON.stringify(data)}

    Determine the winner, compare metrics (subscribers, views, engagement, etc.), 
    provide a detailed AI report in Bengali explaining why one is ahead, 
    and a roadmap for the user's channel to overtake the competitor.

    CRITICAL: Response MUST be in Bengali (বাংলা) for all text values. JSON keys must be English.
  `;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winner: { type: Type.STRING, enum: ["channel1", "channel2", "draw"] },
          comparison: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                metric: { type: Type.STRING },
                channel1Value: { type: Type.STRING },
                channel2Value: { type: Type.STRING },
                advantage: { type: Type.STRING, enum: ["channel1", "channel2", "none"] }
              }
            }
          },
          aiReport: { type: Type.STRING },
          roadmap: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }));

  const result = safeJsonParse(response.text);
  return {
    winner: result?.winner || "draw",
    comparison: result?.comparison || [],
    aiReport: result?.aiReport || "",
    roadmap: result?.roadmap || []
  };
}

export async function analyzeChannelStyle(
  channel: YouTubeChannelData,
  recentVideos: YouTubeVideoData[]
): Promise<{ style: string; searchKeywords: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the following YouTube channel and its recent long-form videos to determine its specific content style, sub-niche, and core topics.
    
    Channel: ${channel.snippet.title}
    Description: ${channel.snippet.description}
    
    Recent Long-form Videos:
    ${recentVideos.slice(0, 5).map(v => `- ${v.snippet.title}`).join('\n')}
    
    Tasks:
    1. Describe the channel's specific style (e.g., "Anime news and updates", "Tech reviews for beginners", "Cooking traditional Bengali food").
    2. Provide 3-5 highly specific search keywords that can be used to find similar viral trending videos on YouTube.
    
    Return the result in JSON format with keys "style" (string, in Bengali) and "searchKeywords" (array of strings, in English).
  `;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          style: { type: Type.STRING },
          searchKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }));

  const result = safeJsonParse(response.text);
  return {
    style: result?.style || "Unknown Style",
    searchKeywords: result?.searchKeywords || []
  };
}

export async function analyzeViralPulse(
  channel: YouTubeChannelData,
  trendingVideos: any[],
  styleAnalysis: string
): Promise<ViralPulseResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an AI Viral Pulse Trend Analyzer. 
    Analyze the user's channel style and the REAL trending videos found on YouTube to provide the best viral recommendations.
    
    Channel Style Analysis: ${styleAnalysis}

    User Channel:
    Title: ${channel.snippet.title}
    Description: ${channel.snippet.description}

    REAL Trending Videos Found (Last 7 Days):
    ${JSON.stringify(trendingVideos.map(v => ({
      id: v.id,
      title: v.snippet.title,
      description: v.snippet.description?.substring(0, 200), // Limit description
      stats: v.statistics,
      publishedAt: v.snippet.publishedAt
    })))}

    Tasks:
    1. Confirm the detected niche based on the style analysis.
    2. From the provided REAL trending videos, select the top 5 that best match the creator's style and have high viral potential.
    3. For each of these 5 videos, provide:
       - referenceVideoId: The ID of the REAL trending video you selected from the list above.
       - A catchy title (inspired by the viral video but unique)
       - Why it's trending (reason)
       - Viral potential score (0-100)
       - A thumbnail concept
       - A title hook
       - A specific strategy for the creator to make a similar high-quality long-form video.
    4. List general global trends in this niche.
    5. Provide engagement insights.

    CRITICAL: 
    - All text values MUST be in Bengali (বাংলা). JSON keys must be English.
    - Do NOT invent topics. Use the provided trending videos as the basis.
    - Focus ONLY on long-form video strategies.
  `;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedNiche: { type: Type.STRING },
          nicheDescription: { type: Type.STRING },
          topViralTopics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                referenceVideoId: { type: Type.STRING },
                title: { type: Type.STRING },
                reason: { type: Type.STRING },
                viralPotential: { type: Type.NUMBER },
                thumbnailConcept: { type: Type.STRING },
                titleHook: { type: Type.STRING },
                strategy: { type: Type.STRING }
              }
            }
          },
          globalTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
          engagementInsights: { type: Type.STRING }
        }
      }
    }
  }));

  const result = safeJsonParse(response.text);
  return {
    detectedNiche: result?.detectedNiche || "Unknown Niche",
    nicheDescription: result?.nicheDescription || "",
    topViralTopics: result?.topViralTopics || [],
    globalTrends: result?.globalTrends || [],
    engagementInsights: result?.engagementInsights || "",
    styleAnalysis,
    referenceVideos: trendingVideos
  };
}

export async function detectNiche(channel: YouTubeChannelData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Based on the following YouTube channel data, detect the channel's niche (e.g., Tech, Gaming, Cooking, Vlogging, Education, etc.). 
    Provide only the niche name in English.

    Channel Title: ${channel.snippet.title}
    Channel Description: ${channel.snippet.description}
  `;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  }));

  return response.text.trim();
}

export async function chatWithAI(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  context: { channel?: YouTubeChannelData; videos?: YouTubeVideoData[] }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const channelContext = context.channel ? `
    Current Channel Context:
    Title: ${context.channel.snippet.title}
    Description: ${context.channel.snippet.description}
    Stats: ${JSON.stringify(context.channel.statistics)}
  ` : "No channel context provided yet.";

  const videoContext = context.videos ? `
    Recent Videos:
    ${context.videos.slice(0, 5).map(v => `- ${v.snippet.title} (${v.statistics.viewCount} views)`).join('\n')}
  ` : "";

  const systemInstruction = `
    You are an expert YouTube Growth Coach and AI Assistant, similar to the AI in the vidIQ app. 
    Your goal is to help creators grow their channels, improve SEO, generate viral ideas, and understand their audience.
    
    ${channelContext}
    ${videoContext}
    
    Guidelines:
    1. Be encouraging, data-driven, and actionable.
    2. Provide specific advice based on the provided channel context if available.
    3. If no channel is connected, help the user with general YouTube growth strategies.
    4. Respond in the language the user uses (primarily Bengali/English).
    5. Keep responses concise but highly valuable.
    6. Use formatting (bullet points, bold text) to make advice readable.
  `;

  const chat = ai.chats.create({
    model: "gemini-3.1-flash-lite-preview",
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    },
    history: history
  });

  const response = await callWithRetry(() => chat.sendMessage({ message }));
  return response.text;
}
