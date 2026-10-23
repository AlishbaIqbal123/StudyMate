import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedContent } from '../../components/animated/index.js';
import { ChevronDown, Quote } from 'lucide-react';

export interface Testimonial { name: string; role: string; image: string; quote: string; fullQuote?: string; }
export interface TestimonialsSectionProps { testimonials?: Testimonial[]; }

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    { name: 'Sarah Chen', role: 'Computer Science, MIT', image: 'SC', quote: 'StudyMate transformed my study routine with structured Pomodoro sessions.', fullQuote: 'StudyMate transformed my study routine completely. The Pomodoro integration keeps me focused during long coding sessions, and the Alexa+ voice commands mean I can add tasks hands-free. My GPA went up a full point this semester.' },
    { name: 'Marcus Johnson', role: 'Pre-Med, UCLA', image: 'MJ', quote: 'The voice assistant is a game-changer for quick task management.', fullQuote: "The voice assistant is a game-changer for quick task management between classes. The offline-first SQLite storage means everything works even with poor WiFi." },
    { name: 'Priya Sharma', role: 'Data Science, Stanford', image: 'PS', quote: 'Sovereign data storage means I trust this app with my entire semester.', fullQuote: 'As a data science student I am very conscious about where my data lives. Knowing StudyMate is offline-first SQLite with zero tracking pixels made me trust it immediately.' },
];

export function TestimonialsSection({ testimonials = DEFAULT_TESTIMONIALS }: TestimonialsSectionProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    return (
        <AnimatedContent direction="up" fadeIn duration={0.6}>
            <section className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto py-20 sm:py-28 border-t border-white/[0.06]">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#E5A952]/10 text-[#E5A952] border border-[#E5A952]/25">Student Stories</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">Built for the students who mean it.</h2>
                    <p className="text-sm text-[#C8BFB2] leading-relaxed">From CS labs to pre-med clinicals — StudyMate adapts to every academic journey.</p>
                </div>
                <div className="space-y-3">
                    {testimonials.map((t, i) => {
                        const isOpen = activeIndex === i;
                        return (
                            <motion.div key={i} layout className={`rounded-2xl border transition-colors cursor-pointer overflow-hidden ${isOpen ? 'bg-gradient-to-br from-[#E5A952]/10 to-[#E5A952]/5 border-[#E5A952]/30' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'}`} onClick={() => setActiveIndex(isOpen ? null : i)}>
                                <div className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#E5A952]/20 border border-[#E5A952]/40 flex items-center justify-center font-mono font-bold text-[#E5A952] text-sm shrink-0">{t.image}</div>
                                        <div>
                                            <div className="font-serif text-sm font-medium text-white">{t.name}</div>
                                            <div className="text-[11px] font-mono text-[#C8BFB2]">{t.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs text-[#C8BFB2] hidden sm:block italic max-w-xs">"{t.quote}"</p>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-[#C8BFB2] shrink-0" /></motion.div>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                                            <div className="px-5 pb-5">
                                                <div className="pt-3 border-t border-white/[0.08] flex items-start gap-3">
                                                    <Quote className="w-5 h-5 text-[#E5A952] shrink-0 mt-0.5" />
                                                    <p className="text-sm text-[#F5EFE6] leading-relaxed italic">{t.fullQuote || t.quote}</p>
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
