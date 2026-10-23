import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { AnimatedContent } from '../../components/animated/index.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ShowcaseSlide {
    title: string;
    description: string;
    icon: string;
    accentColor: string;
    mockupLines: string[];
}

export interface ProductShowcaseSectionProps { slides?: ShowcaseSlide[]; }

const DEFAULT_SLIDES: ShowcaseSlide[] = [
    {
        title: 'Academic Hub',
        description: 'Daily coursework overview',
        icon: '📚',
        accentColor: '#E5A952',
        mockupLines: ['CS 420: Lab 3 — HIGH', 'MATH 312: Problem Set — MED', 'BIO 201: Reading — LOW', '3 tasks due this week'],
    },
    {
        title: 'Assignments Desk',
        description: 'Kanban task management',
        icon: '✅',
        accentColor: '#3B82F6',
        mockupLines: ['● To Do (3)', '● In Progress (1)', '● Completed (8)', 'Drag & drop tasks'],
    },
    {
        title: 'Pomodoro Planner',
        description: 'Focus timer & AI schedule',
        icon: '⏱️',
        accentColor: '#10B981',
        mockupLines: ['25:00 Deep Focus', 'CS 420: Distributed Systems', 'AI Schedule: 3 blocks', 'Next break in 18m'],
    },
    {
        title: 'Voice Console',
        description: 'Alexa+ multi-turn dialogue',
        icon: '🎙️',
        accentColor: '#8B5CF6',
        mockupLines: ['"What\'s due this week?"', 'Found 2 assignments...', '"Start a 45m session"', 'Launching Pomodoro...'],
    },
    {
        title: 'AI Diagnostics',
        description: 'MCP action tester & sync',
        icon: '⚡',
        accentColor: '#F43F5E',
        mockupLines: ['get_tasks → ✓ 200ms', 'add_task → ✓ 142ms', 'SQLite Active', '5 tools available'],
    },
];

const CARD_WIDTH = 280;
const CARD_GAP = 16;

export function ProductShowcaseSection({ slides = DEFAULT_SLIDES }: ProductShowcaseSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const isDragging = useRef(false);

    const scrollTo = useCallback((index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, slides.length - 1));
        setActiveIndex(clampedIndex);
        const offset = -(clampedIndex * (CARD_WIDTH + CARD_GAP));
        animate(x, offset, { type: 'spring', stiffness: 300, damping: 30 });
    }, [slides.length, x]);

    const handleDragEnd = useCallback((_: any, info: any) => {
        const threshold = 80;
        if (info.offset.x < -threshold) scrollTo(activeIndex + 1);
        else if (info.offset.x > threshold) scrollTo(activeIndex - 1);
        else scrollTo(activeIndex);
    }, [activeIndex, scrollTo]);

    return (
        <AnimatedContent direction="up" fadeIn duration={0.6}>
            <section className="relative z-10 py-20 sm:py-28 border-t border-white/[0.06]">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-14 space-y-3 text-center">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">Product Showcase</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">Every screen, designed for deep focus.</h2>
                    <p className="text-sm text-[#C8BFB2] leading-relaxed max-w-xl mx-auto">Five interconnected views that keep your academic life organized, measurable, and voice-accessible.</p>
                </div>

                {/* Carousel container */}
                <div className="relative">
                    {/* Left arrow */}
                    <button
                        onClick={() => scrollTo(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Right arrow */}
                    <button
                        onClick={() => scrollTo(activeIndex + 1)}
                        disabled={activeIndex === slides.length - 1}
                        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Scrollable strip */}
                    <div ref={containerRef} className="overflow-hidden px-16 lg:px-24">
                        <motion.div
                            className="flex gap-4 cursor-grab active:cursor-grabbing"
                            style={{ x }}
                            drag="x"
                            dragConstraints={{ left: -(slides.length - 1) * (CARD_WIDTH + CARD_GAP), right: 0 }}
                            dragElastic={0.1}
                            onDragStart={() => { isDragging.current = true; }}
                            onDragEnd={handleDragEnd}
                        >
                            {slides.map((slide, i) => {
                                const isActive = i === activeIndex;
                                return (
                                    <motion.div
                                        key={i}
                                        onClick={() => { if (!isDragging.current) scrollTo(i); isDragging.current = false; }}
                                        className="shrink-0 rounded-2xl overflow-hidden border transition-all cursor-pointer select-none"
                                        style={{ width: CARD_WIDTH }}
                                        animate={{
                                            scale: isActive ? 1 : 0.92,
                                            opacity: isActive ? 1 : 0.6,
                                            borderColor: isActive ? `${slide.accentColor}60` : 'rgba(255,255,255,0.08)',
                                        }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    >
                                        {/* Card header */}
                                        <div className="px-5 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${slide.accentColor}25, ${slide.accentColor}10)` }}>
                                            <span className="text-2xl">{slide.icon}</span>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{slide.title}</div>
                                                <div className="text-[11px] text-[#C8BFB2]">{slide.description}</div>
                                            </div>
                                        </div>

                                        {/* App mockup */}
                                        <div className="bg-[#0C101C] p-4 space-y-2 min-h-[180px]">
                                            {slide.mockupLines.map((line, li) => (
                                                <div key={li} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: slide.accentColor }} />
                                                    <span className="text-[11px] font-mono text-[#C8BFB2]">{line}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {slides.map((slide, i) => (
                            <button
                                key={i}
                                onClick={() => scrollTo(i)}
                                className="transition-all cursor-pointer rounded-full"
                                style={{
                                    width: i === activeIndex ? '1.5rem' : '0.5rem',
                                    height: '0.5rem',
                                    background: i === activeIndex ? slide.accentColor : 'rgba(255,255,255,0.2)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </AnimatedContent>
    );
}
