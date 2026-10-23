import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedContent } from '../../components/animated/index.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ShowcaseSlide {
    title: string;
    description: string;
    image: string;
    accentColor?: string;
    icon: string;
}
export interface ProductShowcaseSectionProps { slides?: ShowcaseSlide[]; }

const DEFAULT_SLIDES: ShowcaseSlide[] = [
    { title: 'Academic Hub', description: 'Daily coursework overview with live KPI cards, assignment tracking, and AI-powered study suggestions.', image: 'dashboard', accentColor: '#E5A952', icon: '📚' },
    { title: 'Assignments Desk', description: 'Kanban-style task management with drag-and-drop columns: To Do, In Progress, and Done.', image: 'assignments', accentColor: '#3B82F6', icon: '✅' },
    { title: 'Pomodoro Planner', description: 'AI-generated timed study sprints with a large focus timer, break intervals, and recovery scheduling.', image: 'planner', accentColor: '#10B981', icon: '⏱️' },
    { title: 'Voice Console', description: 'Alexa+ conversational agent with multi-turn dialogue, microphone input, and TTS readback.', image: 'voice', accentColor: '#8B5CF6', icon: '🎙️' },
];

export function ProductShowcaseSection({ slides = DEFAULT_SLIDES }: ProductShowcaseSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startInterval = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => setActiveIndex(p => (p + 1) % slides.length), 4000);
    };
    useEffect(() => { startInterval(); return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, [slides.length]);
    const go = (dir: 1 | -1) => { setActiveIndex(p => (p + dir + slides.length) % slides.length); startInterval(); };
    const slide = slides[activeIndex];
    return (
        <AnimatedContent direction="up" fadeIn duration={0.6}>
            <section className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto py-20 sm:py-28 border-t border-white/[0.06]">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">Product Showcase</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">Every screen, designed for deep focus.</h2>
                    <p className="text-sm text-[#C8BFB2] leading-relaxed">Five interconnected views that keep your academic life organized, measurable, and voice-accessible.</p>
                </div>
                <div className="relative rounded-[2.5rem] bg-white/[0.03] border border-white/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
                    onMouseEnter={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
                    onMouseLeave={() => startInterval()}>
                    <div className="p-2 sm:p-3">
                        <div className="rounded-[calc(2.5rem-0.75rem)] bg-[#0C101C] border border-white/[0.08] overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10">
                                    <div className="flex-1 space-y-5 text-left">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${slide.accentColor}20`, border: `1px solid ${slide.accentColor}40` }}>{slide.icon}</div>
                                        <div>
                                            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">{slide.title}</h3>
                                            <p className="text-sm text-[#C8BFB2] leading-relaxed mt-2 max-w-md">{slide.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {slides.map((_, i) => (
                                                <button key={i} onClick={() => { setActiveIndex(i); startInterval(); }} className="transition-all cursor-pointer rounded-full"
                                                    style={{ width: i === activeIndex ? '2rem' : '0.5rem', height: '0.5rem', background: i === activeIndex ? (slide.accentColor ?? '#E5A952') : 'rgba(255,255,255,0.2)' }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full md:w-80 h-48 sm:h-56 rounded-2xl flex items-center justify-center shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${slide.accentColor}15, ${slide.accentColor}05)`, border: `1px solid ${slide.accentColor}25` }}>
                                        <span className="text-7xl opacity-80">{slide.icon}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                    <button onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </section>
        </AnimatedContent>
    );
}
