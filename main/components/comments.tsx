'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, RefreshCw, Clock } from 'lucide-react';
import { format } from 'timeago.js';

const CHANNEL = 'comments:alimadhomepage';
const PULL_URL = `https://log.alimad.co/api/pull?channel=${CHANNEL}`;
const LOG_URL = (text: string) =>
    `https://log.alimad.co/api/log?channel=${CHANNEL}&text=${encodeURIComponent(text)}`;

interface LogEntry {
    text: string;
    time: string;
    [key: string]: unknown;
}

function parseTime(raw: string): Date {
    const n = Number(raw);
    return isNaN(n) ? new Date(raw) : new Date(n * 1000);
}

function relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    if(diff < 7 * 24 * 3600 * 1000) return format(date);
    if(new Date().getFullYear() != date.getFullYear()) return date.toLocaleDateString();
    return date.toLocaleDateString("en-US", { day: 'numeric', month: 'long' });
}

function CommentItem({ entry }: { entry: LogEntry }) {
    const date = parseTime(entry.time);

    return (
        <div className="flex flex-col gap-0 px-1 border-l-2 pl-2 dark:border-accent-light border-black w-full justify-left items-start text-left">
            <div className="text-sm leading-relaxed w-[80%] dark:text-gray-200 break-words whitespace-pre-wrap">
                {entry.text}
            </div>
            <div className="text-xs opacity-50">
                {relativeTime(date)}
            </div>
        </div>
    );
}

export default function StyledComments() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    async function fetchLogs() {
        setLoading(true);
        try {
            const res = await fetch(PULL_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setLogs([...data.logs].reverse());
        } catch (e) {
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
        } finally {
            setSending(false);
        }
    }

    return (
        <section className="flex flex-col gap-2 mb-12 max-w-5xl mt-8 p-4 rounded-xl dark:bg-black/20 border-2 dark:border-white/10 w-full text-left">
            <div className="flex justify-between items-center">
                <div className="flex p-1 m-0 items-center gap-2 font-semibold text-lg">
                    Comments
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
                    className="w-full bg-black/10 dark:bg-white/5 border-0 rounded-lg p-3 text-sm outline-none focus:border-3 focus:border-accent-light transition-all duration-100 resize-y min-h-[80px]"
                />
                <div className="flex justify-end items-center mt-0 px-1">
                    <button
                        disabled={sending || !text.trim()}
                        className="flex cursor-pointer items-center gap-2 px-6 py-2 rounded-md bg-black dark:bg-accent-light text-white dark:text-black font-semibold text-xs disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95">
                        {sending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                        {sending ? 'Posting' : 'Post'}
                    </button>
                </div>
            </form>
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