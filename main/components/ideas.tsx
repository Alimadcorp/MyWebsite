'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, X, Clock } from 'lucide-react';

interface Idea {
  text: string;
  time: string;
}

export default function IdeasModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/ideas')
        .then((res) => res.json())
        .then((data) => {
          setIdeas(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">

      <div className="flex flex-col gap-4 p-6 rounded-xl bg-[#0a0a0a] border-2 border-white/10 w-full max-w-md shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-white">
            The Last Two Ideas
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-20 bg-white/5 rounded-lg w-full" />
              <div className="h-20 bg-white/5 rounded-lg w-full" />
            </div>
          ) : (
            ideas.map((idea, i) => (
              <div 
                key={i} 
                className="p-4 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col gap-2 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                  <Clock size={10} />
                  {new Date(idea.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-md">
                  {idea.text}
                </div>
              </div>
            ))
          )}

          {!loading && ideas.length === 0 && (
            <div className="text-center py-4 text-sm text-white/30">Something went wrong :/</div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}