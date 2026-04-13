import { YouTubeChannelData, YouTubeVideoData } from "../types";

export async function fetchChannelData(channelUrl: string) {
  const YOUTUBE_API_KEY = localStorage.getItem('YOUTUBE_API_KEY') || "AIzaSyC7rKfXXaTSNRv_zyAZTbEBSErPfgUTpNg";

  let channelId = "";
  let handle = "";
  let forUsername = "";

  const url = channelUrl.trim();

  // Extract ID or Handle from URL
  if (url.includes("youtube.com/channel/")) {
    channelId = url.split("youtube.com/channel/")[1].split("/")[0].split("?")[0];
  } else if (url.includes("youtube.com/@")) {
    handle = url.split("youtube.com/@")[1].split("/")[0].split("?")[0];
  } else if (url.includes("youtube.com/c/")) {
    const customName = url.split("youtube.com/c/")[1].split("/")[0].split("?")[0];
    const searchRes = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${customName}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchRes.json();
    if (searchData.items && searchData.items.length > 0) {
      channelId = searchData.items[0].snippet.channelId;
    } else {
      throw new Error("কাস্টম নাম দিয়ে চ্যানেলটি পাওয়া যায়নি।");
    }
  } else if (url.includes("youtube.com/user/")) {
    forUsername = url.split("youtube.com/user/")[1].split("/")[0].split("?")[0];
  } else if (url.startsWith("@")) {
    handle = url.substring(1);
  } else if (!url.includes("/") && !url.includes("youtube.com")) {
    if (url.startsWith("UC") && url.length === 24) {
      channelId = url;
    } else {
      handle = url;
    }
  } else {
    throw new Error("ইউটিউব চ্যানেল ইউআরএল (URL) এর ফরম্যাটটি সঠিক নয়। সম্পূর্ণ ইউআরএল বা @handle ব্যবহার করার চেষ্টা করুন।");
  }

  let channelUrlParams = `id=${channelId}`;
  if (handle) {
    channelUrlParams = `forHandle=@${handle}`;
  } else if (forUsername) {
    channelUrlParams = `forUsername=${forUsername}`;
  }

  // Fetch Channel Details
  const channelRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&${channelUrlParams}&key=${YOUTUBE_API_KEY}`
  );
  const channelData = await channelRes.json();

  if (channelData.error) {
    throw new Error(`ইউটিউব এপিআই (API) এরর: ${channelData.error.message}`);
  }

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("চ্যানেলটি পাওয়া যায়নি।");
  }

  const channel: YouTubeChannelData = channelData.items[0];
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error("এই চ্যানেলের আপলোড প্লেলিস্ট পাওয়া যায়নি।");
  }

  // Fetch Latest 15 Videos from Uploads Playlist
  const playlistRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=15&key=${YOUTUBE_API_KEY}`
  );
  const playlistData = await playlistRes.json();

  if (playlistData.error) {
    throw new Error(`ইউটিউব এপিআই (API) এরর: ${playlistData.error.message}`);
  }

  if (!playlistData.items || playlistData.items.length === 0) {
    return { channel, videos: [] };
  }

  const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(",");

  // Fetch Video Statistics and Details
  const videosRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  );
  const videosData = await videosRes.json();

  const videos: YouTubeVideoData[] = videosData.items || [];

  return { channel, videos };
}

export async function fetchVideoData(videoUrl: string) {
  const YOUTUBE_API_KEY = localStorage.getItem('YOUTUBE_API_KEY') || "AIzaSyC7rKfXXaTSNRv_zyAZTbEBSErPfgUTpNg";
  
  let videoId = "";
  const url = videoUrl.trim();

  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("youtube.com/shorts/")) {
    videoId = url.split("shorts/")[1].split("?")[0];
  } else if (url.length === 11) {
    videoId = url;
  } else {
    throw new Error("ইউটিউব ভিডিও ইউআরএল (URL) এর ফরম্যাটটি সঠিক নয়।");
  }

  const videoRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  const videoData = await videoRes.json();

  if (!videoData.items || videoData.items.length === 0) {
    throw new Error("ভিডিওটি পাওয়া যায়নি।");
  }

  return videoData.items[0] as YouTubeVideoData;
}

export function isLongForm(video: YouTubeVideoData): boolean {
  const duration = video.contentDetails.duration;
  // ISO 8601 duration parsing (simplified for our needs)
  // PT1M30S -> 1 min 30 sec
  // PT45S -> 45 sec
  if (duration.includes('H')) return true; // Hours
  const match = duration.match(/PT(\d+)M/);
  const minutes = match ? parseInt(match[1]) : 0;
  
  // If no minutes, check seconds
  if (!match) {
    const secMatch = duration.match(/PT(\d+)S/);
    const seconds = secMatch ? parseInt(secMatch[1]) : 0;
    return seconds > 60; // More than 60 seconds is usually not a Short
  }

  return minutes >= 1; // 1 minute or more
}

export async function fetchTrendingVideos(query: string, maxResults = 10) {
  const YOUTUBE_API_KEY = localStorage.getItem('YOUTUBE_API_KEY') || "AIzaSyC7rKfXXaTSNRv_zyAZTbEBSErPfgUTpNg";
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const publishedAfter = sevenDaysAgo.toISOString();

  // We use search with viewCount order.
  const searchRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&publishedAfter=${publishedAfter}&maxResults=${maxResults}&order=viewCount&videoDuration=any&key=${YOUTUBE_API_KEY}`
  );
  const searchData = await searchRes.json();

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

  const videosRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  );
  const videosData = await videosRes.json();

  return (videosData.items || []).filter(isLongForm);
}
