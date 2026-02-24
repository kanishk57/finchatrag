'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, FileText, Search, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryRAG, uploadFile, listFiles } from '../lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedSource, setSelectedSource] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const fetchFiles = async () => {
        try {
            const data = await listFiles();
            setFiles(data);
        } catch (error) {
            console.error('Failed to fetch files', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await queryRAG(input);
            const assistantMessage: Message = {
                role: 'assistant',
                content: response.answer,
                sources: response.sources
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Is the backend running?'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            await uploadFile(e.target.files[0]);
            await fetchFiles();
        } catch (error) {
            alert('Upload failed: ' + error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-72 border-r border-zinc-900 bg-zinc-950 flex flex-col z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Search size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tighter uppercase block leading-none">FinChat</span>
                        <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Intelligence</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Knowledge Base</h3>
                            <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">{files.length}</span>
                        </div>
                        <div className="space-y-1">
                            {files.map((file, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-all text-xs text-zinc-400 group cursor-default border border-transparent hover:border-zinc-800"
                                >
                                    <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                                        <FileText size={12} className="group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <span className="truncate flex-1 font-medium">{file.name}</span>
                                </motion.div>
                            ))}
                            {files.length === 0 && (
                                <div className="text-[11px] text-zinc-600 px-4 py-8 italic text-center bg-zinc-900/10 border border-dashed border-zinc-900 rounded-2xl">
                                    Connect data sources to begin
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-900 bg-zinc-950/80">
                    <label className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5 active:scale-95">
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} strokeWidth={3} />}
                        <span>{uploading ? 'Analyzing...' : 'Ingest Data'}</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.png,.jpg,.jpeg" />
                    </label>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-zinc-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b,transparent_50%)] opacity-30 pointer-events-none"></div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 scroll-smooth z-10"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-blue-600 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
                                <div className="relative w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-2xl">
                                    <MessageSquare size={40} className="text-blue-500" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600 uppercase">
                                    Terminal Access
                                </h2>
                                <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                                    What would you like to verify today? Our offline RAG engine is primed with your local document stack.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full pt-8">
                                {[
                                    { label: 'Summarize', desc: 'Distill insights from a PDF', color: 'blue' },
                                    { label: 'Cross-Ref', desc: 'Find links between files', color: 'indigo' }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left space-y-2 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
                                        <p className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-500`}>{item.label}</p>
                                        <p className="text-sm text-zinc-400 font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] lg:max-w-[70%] rounded-3xl p-6 shadow-2xl ${m.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-zinc-900/40 backdrop-blur-md text-zinc-100 border border-zinc-800/50'
                                }`}>
                                <div className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                                    {m.content}
                                </div>

                                {m.sources && m.sources.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-zinc-800/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] tracking-[0.3em] font-black text-zinc-600 uppercase">Verified Context</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {m.sources.map((s, si) => (
                                                <button
                                                    key={si}
                                                    onClick={() => setSelectedSource(s)}
                                                    className="text-[10px] font-bold bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-900/50 transition-all flex items-center gap-2 group"
                                                >
                                                    <span className="text-blue-500">#{s.id}</span>
                                                    <span className="truncate max-w-[140px] opacity-60 group-hover:opacity-100">{s.metadata.filename}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start px-2"
                        >
                            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl px-5 py-3 flex items-center gap-3">
                                <Loader2 size={14} className="animate-spin text-blue-500" />
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Assembling Answer</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Source Modal */}
                <AnimatePresence>
                    {selectedSource && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
                            onClick={() => setSelectedSource(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                                            <FileText size={24} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl tracking-tight text-white uppercase">{selectedSource.metadata.filename}</h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Citation Reference #{selectedSource.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSource(null)}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 group"
                                    >
                                        <Plus size={28} className="rotate-45 group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                                <div className="p-10 overflow-y-auto bg-zinc-950/20">
                                    <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 relative">
                                        <div className="absolute top-4 right-6 text-[10px] font-black text-zinc-800 uppercase tracking-widest">Document Segment</div>
                                        <p className="text-zinc-300 leading-relaxed font-medium text-base whitespace-pre-wrap select-text">
                                            {selectedSource.content}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-8 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center">
                                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Match Score: {(selectedSource.score * 100).toFixed(1)}%</div>
                                    <button
                                        onClick={() => setSelectedSource(null)}
                                        className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="p-8 lg:p-12 z-20">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Query the knowledge base..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] py-5 pl-8 pr-20 focus:outline-none focus:ring-0 focus:border-zinc-700 transition-all resize-none shadow-2xl placeholder:text-zinc-700 font-medium text-lg leading-relaxed"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className={`absolute right-4 bottom-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 scale-100' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed scale-90 opacity-50'
                                }`}
                        >
                            <Send size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                    <p className="text-[9px] text-center text-zinc-700 font-black uppercase tracking-[0.5em] mt-8">
                        Offline Neural Engine • Zero-Trust Architecture • Hardware Accelerated
                    </p>
                </div>
            </main>
        </div>
    );
}
