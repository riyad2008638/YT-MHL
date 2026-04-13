import React, { useState, useEffect } from 'react';
import { X, Key, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('YOUTUBE_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem('YOUTUBE_API_KEY');
      toast.success('এপিআই কী মুছে ফেলা হয়েছে।');
    } else {
      localStorage.setItem('YOUTUBE_API_KEY', apiKey.trim());
      toast.success('এপিআই কী সফলভাবে সেভ করা হয়েছে।');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                সেটিংস (Settings)
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2">
                  YouTube Data API v3 Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="আপনার এপিআই কী এখানে দিন"
                  className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 mt-0.5 text-orange-500" />
                  <span>
                    এই অ্যাপটি ব্যবহার করতে আপনার নিজস্ব YouTube Data API v3 কী প্রয়োজন। এটি আপনার ব্রাউজারে লোকালি সেভ থাকবে।
                  </span>
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-orange-500 mb-1">কীভাবে এপিআই কী পাবেন?</h4>
                <ol className="text-[10px] sm:text-xs text-neutral-400 list-decimal list-inside space-y-1">
                  <li>Google Cloud Console-এ যান।</li>
                  <li>একটি নতুন প্রজেক্ট তৈরি করুন।</li>
                  <li>"YouTube Data API v3" এনাবল করুন।</li>
                  <li>Credentials থেকে একটি API Key তৈরি করুন।</li>
                </ol>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-white/5 bg-white/5 flex justify-end gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleSave}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-white text-black hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                সেভ করুন
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
