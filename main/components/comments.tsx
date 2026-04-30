'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, RefreshCw, MessageSquare, Clock } from 'lucide-react';

const CHANNEL = 'comments:alimadhomepage';
const PULL_URL = `https://log.alimad.co/api/pull?channel=${CHANNEL}`;
const LOG_URL = (text: string) =>
    `https://log.alimad.co/api/log?channel=${CHANNEL}&text=${encodeURIComponent(text)}`;

interface LogEntry {
    text: string;
    time: string;
    [key: string]: unknown;
}

// --- Helpers ---
function parseTime(raw: string): Date {
    const n = Number(raw);
    return isNaN(n) ? new Date(raw) : new Date(n * 1000);
}

function relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

// --- Single Comment Component (Styled like the Song UI) ---
function CommentItem({ entry }: { entry: LogEntry }) {
    const date = parseTime(entry.time);
    
    return (
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-black/5 dark:bg-white/5 border dark:border-white/5 w-full text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs opacity-50">
                    <Clock size={10} />
                    {relativeTime(date)}
                </div>
            </div>
            <div className="text-sm leading-relaxed dark:text-gray-200 break-words whitespace-pre-wrap">
                {entry.text}
            </div>
        </div>
    );
}

// --- Main Comments Section ---
export default function StyledComments() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    async function fetchLogs() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(PULL_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setLogs([...data.logs].reverse());
        } catch (e) {
            setError('Could not load comments.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchLogs(); }, []);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setSent(false);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || trimmed.length > 500) return;

        setSending(true);
        try {
            const res = await fetch(LOG_URL(trimmed));
            if (!res.ok) throw new Error('Failed');
            setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            setSent(true);
            await fetchLogs();
        } catch {
            setError('Failed to post.');
        } finally {
            setSending(false);
        }
    }

    return (
        <section className="flex flex-col gap-3 mb-12 max-w-5xl mt-8 p-4 rounded-xl dark:bg-black/20 border-2 dark:border-white/10 w-full text-left">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
                    <MessageSquare size={18} className="opacity-70" />
                    Comments 
                    <span className="text-xs opacity-40 ml-1">({logs.length})</span>
                </div>
                <button 
                    onClick={fetchLogs} 
                    className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="relative group">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Write a comment..."
                    className="w-full bg-black/10 dark:bg-white/5 border dark:border-white/10 rounded-lg p-3 text-sm outline-none focus:border-cyan-500/50 transition-all resize-none min-h-[80px]"
                />
                <div className="flex justify-between items-center mt-2 px-1">
                    <span className={`text-[10px] ${text.length > 500 ? 'text-red-500' : 'opacity-40'}`}>
                        {text.length}/500
                    </span>
                    <button
                        disabled={sending || !text.trim() || text.length > 500}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-black dark:bg-cyan-500 text-white dark:text-black font-semibold text-xs tracking-wide disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                    >
                        {sending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                        {sending ? 'Posting' : 'Post'}
                    </button>
                </div>
            </form>

            <div className="h-[1px] w-full bg-white/10 my-2" />

            {/* Comments List */}
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {loading && logs.length === 0 ? (
                    <div className="animate-pulse flex flex-col gap-2">
                        <div className="h-16 bg-white/5 rounded-lg w-full" />
                        <div className="h-16 bg-white/5 rounded-lg w-full opacity-50" />
                    </div>
                ) : (
                    logs.map((entry, i) => (
                        <CommentItem key={i} entry={entry} />
                    ))
                )}
                
                {!loading && logs.length === 0 && (
                    <div className="text-center py-6 text-sm opacity-40 italic">
                        No comments yet. Start the conversation!
                    </div>
                )}
            </div>

            {sent && <div className="text-[10px] text-green-500 text-right animate-bounce">✓ Sent!</div>}
        </section>
    );
}