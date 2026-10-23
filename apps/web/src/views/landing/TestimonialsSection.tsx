import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContent } from '../../components/animated/index.js';
import { ArrowUpRight } from 'lucide-react';

export interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    fullQuote: string;
    color: string;
    initial: string;
}

export interface TestimonialsSectionProps { testimonials?: Testimonial[]; }

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        name: 'Sarah Chen',
        role: 'CS Student',
        company: 'MIT',
        quote: 'StudyMate transformed how I manage my academic workflow.',
        fullQuote: '"StudyMate transformed how I manage my academic workflow. The Alexa+ voice integration means I can add tasks hands-free while coding. My GPA improved a full point this semester — I attribute that entirely to better deadline management."',
        color: '#E5A952',
        initial: 'SC',
    },
    {
        name: 'Marcus Johnson',
        role: 'Pre-Med Student',
        company: 'UCLA',
        quote: 'The voice assistant is unlike anything I have used before.',
        fullQuote: '"The voice assistant is unlike anything I have used before in an academic tool. I can quickly check what is due, start a Pomodoro session, or mark tasks complete — all while my hands are occupied in the lab. It understands natural academic language perfectly."',
        color: '#3B82F6',
        initial: 'MJ',
    },
    {
        name: 'Priya Sharma',
        role: 'Data Science Student',
        company: 'Stanford',
        quote: 'Offline-first and privacy-respecting — exactly what students need.',
        fullQuote: '"As a data science student, I scrutinize every tool I use for privacy. StudyMate\'s offline-first SQLite approach with zero tracking pixels made it an immediate yes. The AI study planner accurately estimates how long my assignments take — better than I do myself."',
        color: '#10B981',
        initial: 'PS',
    },
    {
        name: 'James Park',
        role: 'Engineering Student',
        company: 'Georgia Tech',
        quote: 'The MCP protocol integration is genuinely clever engineering.',
        fullQuote: '"The MCP protocol integration is genuinely clever engineering. Seeing how StudyMate exposes deterministic tool schemas to Alexa+ convinced me this is the right architecture for AI-augmented student tools. I contributed a PR the week after discovering it."',
        color: '#8B5CF6',
        initial: 'JP',
    },
];

export function TestimonialsSection({ testimonials = DEFAULT_TESTIMONIALS }: TestimonialsSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <AnimatedContent direction="up" fadeIn duration={0.6}>
            <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 sm:py-28 border-t border-white/[0.06]">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">Student Stories</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">Built for the students who mean it.</h2>
                    <p className="text-sm text-[#C8BFB2] leading-relaxed">From CS labs to pre-med clinicals — StudyMate adapts to every academic journey.</p>
                </div>

                {/* Accordion Gallery */}
                <div className="flex gap-3 h-80 sm:h-96">
                    {testimonials.map((t, i) => {
                        const isActive = i === activeIndex;
                        return (
                            <motion.div
                                key={i}
                                className="relative rounded-2xl overflow-hidden cursor-pointer shrink-0"
                                animate={{ flex: isActive ? 5 : 1 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                                onHoverStart={() => setActiveIndex(i)}
                                onClick={() => setActiveIndex(i)}
                                style={{
                                    background: isActive
                                        ? `linear-gradient(135deg, ${t.color}20, #07090E 60%)`
                                        : `linear-gradient(180deg, ${t.color}30, ${t.color}10)`,
                                    border: `1px solid ${isActive ? t.color + '40' : 'rgba(255,255,255,0.08)'}`,
                                    minWidth: 0,
                                }}
                            >
                                {/* Collapsed state — vertical initial */}
                                <AnimatePresence>
                                    {!isActive && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-3"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0"
                                                style={{ background: `${t.color}30`, border: `1px solid ${t.color}50`, color: t.color }}
                                            >
                                                {t.initial}
                                            </div>
                                            <div
                                                className="font-mono text-[9px] font-semibold uppercase tracking-widest text-white/50 writing-mode-vertical"
                                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                            >
                                                {t.company}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Expanded state — full content */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: 0.15, duration: 0.3 }}
                                            className="absolute inset-0 p-8 flex flex-col justify-between"
                                        >
                                            {/* Top: Company badge */}
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-mono shrink-0"
                                                    style={{ background: `${t.color}20`, border: `1px solid ${t.color}40`, color: t.color }}
                                                >
                                                    {t.initial}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-white">{t.name}</div>
                                                    <div className="text-[11px] text-[#C8BFB2]">{t.role} · {t.company}</div>
                                                </div>
                                            </div>

                                            {/* Middle: Quote */}
                                            <div className="space-y-3">
                                                <p className="font-serif text-xl sm:text-2xl font-normal text-white leading-snug max-w-lg">
                                                    {t.quote}
                                                </p>
                                                <p className="text-xs sm:text-sm text-[#C8BFB2]/80 leading-relaxed max-w-md line-clamp-3">
                                                    {t.fullQuote}
                                                </p>
                                            </div>

                                            {/* Bottom: Read more */}
                                            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: t.color }}>
                                                <span>Read full story</span>
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                                                    style={{ background: `${t.color}20`, border: `1px solid ${t.color}30` }}
                                                >
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </AnimatedContent>
    );
}
