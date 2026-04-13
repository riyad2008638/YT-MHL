import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import DashboardPage from './pages/Dashboard';
import DailyIdeas from './pages/DailyIdeas';
import KeywordResearch from './pages/KeywordResearch';
import SEOAnalyzer from './pages/SEOAnalyzer';
import Competitors from './pages/Competitors';
import BattleMode from './pages/BattleMode';
import VideoOptimizer from './pages/VideoOptimizer';
import UpcomingVideoAnalyzer from './pages/UpcomingVideoAnalyzer';
import AIViralPulse from './pages/AIViralPulse';
import AICoach from './pages/AICoach';
import ThumbnailDownloader from './pages/ThumbnailDownloader';
import DescriptionAnalyzer from './pages/DescriptionAnalyzer';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" theme="dark" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="daily-ideas" element={<DailyIdeas />} />
          <Route path="keyword-research" element={<KeywordResearch />} />
          <Route path="seo-analyzer" element={<SEOAnalyzer />} />
          <Route path="competitors" element={<Competitors />} />
          <Route path="battle-mode" element={<BattleMode />} />
          <Route path="video-optimizer" element={<VideoOptimizer />} />
          <Route path="upcoming-analyzer" element={<UpcomingVideoAnalyzer />} />
          <Route path="ai-viral-pulse" element={<AIViralPulse />} />
          <Route path="ai-coach" element={<AICoach />} />
          <Route path="thumbnail-downloader" element={<ThumbnailDownloader />} />
          <Route path="description-analyzer" element={<DescriptionAnalyzer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
