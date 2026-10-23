import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedContent } from '../../components/animated/index.js';
import { ArrowUpRight } from 'lucide-react';

export interface NewsCard { title: string; description: string; link: string; date?: string; tag?: string; }
export interface NewsCardsSectionProps { cards?: NewsCard[]; }

const DEFAULT_NEWS_CARDS: NewsCard[] = [
    { title: 'MCP Protocol 2025-11-05 Arrives', description: 'Streamable HTTP support and Alexa+ integration enable true real-time voice agent communication with your academic data.', link: '#', date: 'Nov 25, 2025', tag: 'Protocol Update' },
    { title: 'The Pomodoro Science Behind Focus', description: 'How 25-minute timed intervals combined with structured recovery improve deep work retention by measurable margins.', link: '#', date: 'Nov 18, 2025', tag: 'Research' },
    { title: "Why Offline-First Beats Cloud Surveillance", description: "Student data sovereignty matters. Here's why local-first SQLite with zero analytics selling is the right architecture.", link: '#', date: 'Nov 10, 2025', tag: 'Architecture' },
    { title: 'Building a Voice-Native Study Assistant', description: 'How StudyMate combines Web Speech API, NLP, and MCP tool schemas to create Alexa+ commands.', link: '#', date: 'Nov 3, 2025', tag: 'Engineering' },
];

export function NewsCardsSection({ cards = DEFAULT_NEWS_CARDS }: NewsCardsSectionProps) {
    return (
        <AnimatedContent direction="up" fadeIn duration={0.6}>
            <section className="relative z-10 px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto py-20 sm:py-28 border-t border-white/[0.06]">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/25">Latest Updates</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">What's new in StudyMate.</h2>
                    <p className="text-sm text-[#C8BFB2] leading-relaxed">Protocol updates, research insights, and engineering deep-dives from the team.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.slice(0, 4).map((card, i) => (
                        <motion.a key={i} href={card.link} onClick={e => { if (card.link === '#') e.preventDefault(); }}
                            className="group relative rounded-2xl p-5 flex flex-col justify-between gap-4 border border-blue-500/20 hover:border-blue-400/40 transition-colors overflow-hidden cursor-pointer min-h-[220px]"
                            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(59,130,246,0.04) 100%)' }}
                            whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 space-y-3">
                                {card.tag && <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">{card.tag}</span>}
                                <h3 className="font-serif text-base font-medium text-white leading-snug tracking-tight">{card.title}</h3>
                                <p className="text-xs text-[#C8BFB2] leading-relaxed line-clamp-3">{card.description}</p>
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                {card.date && <span className="text-[10px] font-mono text-[#C8BFB2]/70">{card.date}</span>}
                                <div className="w-7 h-7 rounded-full bg-white/[0.08] group-hover:bg-white/[0.15] border border-white/10 flex items-center justify-center transition-colors ml-auto"><ArrowUpRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" /></div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </section>
        </AnimatedContent>
    );
}
