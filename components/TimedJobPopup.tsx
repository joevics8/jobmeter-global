"use client";

import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
// Change this line
const THREE_MINUTES_MS = 45 * 1000; // 45 seconds

interface TimedJobPopupProps {
  forceShow?: boolean; // Used for the Job List logic
}

export default function TimedJobPopup({ forceShow = false }: TimedJobPopupProps) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // forceShow is derived from isNigerianJob which is set after mount,
    // so this effect will re-run once it flips true. Guard until then.
    if (!forceShow) return;

    // 1. Frequency Check — only suppress if shown recently
    try {
      const stored = localStorage.getItem('timed-popup-shown');
      if (stored && Date.now() - parseInt(stored, 10) < FIVE_DAYS_MS) return;
    } catch (_) {
      // localStorage unavailable (e.g. private browsing restrictions)
    }

    // 2. Delay Timer
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, THREE_MINUTES_MS);

    return () => clearTimeout(timer);
  }, [forceShow]);

  const handleClose = () => {
    setShowPopup(false);
    try {
      localStorage.setItem('timed-popup-shown', Date.now().toString());
    } catch (_) {}
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      <div className="relative bg-white text-black rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200">
        <button onClick={handleClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black text-white rounded-full">
          <X size={16} />
        </button>

        <div className="pt-12 pb-8 px-8 text-center">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl -rotate-6 transform">
            <Zap className="w-8 h-8 fill-amber-400 text-amber-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter leading-none mb-4 uppercase">Too Busy to <br /><span className="text-gray-400">Apply?</span></h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            With JobMeter "Apply for Me Service", we apply to up to 15 jobs on your behalf each month. Sourced, matched, with tailored CV for each application.
          </p>
          <a href="/apply-for-me" className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition-all group">
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 py-4 px-8 flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-bold uppercase tracking-tighter text-gray-600">
            Exclusive to Nigerian Professionals
          </span>
        </div>
      </div>
    </div>
  );
}