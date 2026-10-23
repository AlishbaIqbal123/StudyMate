import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedContent } from '../../components/animated/index.js';
import { ArrowUpRight } from 'lucide-react';

export interface NewsCard {
    title: string;
    description: string;
    link: string;
    date?: string;
    tag?: string;
    featured?: boolean;
}

export interface NewsCardsSectionProps { cards?: NewsCard[]; }

const DEFAULT_NEWS_CARDS: NewsCard[] = [
    { title: 'Meet StudyMate: Your AI-powered academic co-pilot', description: 'Capture insights from your coursework, manage deadlines with natural language, and pair with Amazon Alexa+ for hands-free voice control across all your devices.', link: '#', date: 'Nov 25, 2025', tag: 'Launch', featured: true },
    { title: 'StudyMate wins Academic Tool of the Year', description: 'From lecture halls to study rooms, voice-native productivity is changing how students learn.', link: '#', date: 'Nov 18, 2025', tag: 'Award' },
    { title: 'Eric Yuan on AI for Students: Include AI tools in every syllabus', description: 'Productivity researchers discuss how AI co-pilots are making academic study measurably more effective.', link: '#', date: 'Nov 10, 2025', tag: 'Research' },
    { title: 'Recognized as a leader in EdTech AI for the second consecutive year', description: 'See why StudyMate leads in the 2026 AI-Powered Learning Tools report.', link: '#', date: 'Nov 3, 2025', tag: 'Recognition' },
];

function NewsCardItem({ card, large = false }: { card: NewsCard; large?: boolean }) {
    return (
        <motion.a
            href={card.link}
            onClick={e => { if (card.link === '#') e.preventDefault(); }}
            className={`group relative rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer border border-blue-500/20 hover:border-blue-400/50 transition-all ${large ? 'p-8 min-h-[320px]' : 'p-6 min-h-[140px]'}`}
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.85) 0%, rgba(29,78,216,0.9) 50%, rgba(30,64,175,0.95) 100%)' }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
        >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col h-full gap-4">
                <div className={`space-y-3 flex-1 ${large ? '' : ''}`}>
                    {card.tag && (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20">
                            {card.tag}
                        </span>
                    )}
                    <h3 className={`font-serif font-medium text-white leading-snug ${large ? 'text-2xl sm:text-3xl max-w-md' : 'text-base'}`}>
                        {card.title}
                    </h3>
                    {(large || card.description) && (
                        <p className={`text-white/70 leading-relaxed ${large ? 'text-sm max-w-sm' : 'text-xs line-clamp-2'}`}>
                            {card.description}
                        </p>
                    )}
                </div>

                {/* Bottom row */}
                <div className="flex items-end justify-between">
                    {card.date && <span className="text-[11px] font-mono text-white/50">{card.date}</span>}
                    <div className="w-9 h-9 rounded-full bg-white/15 group-hover:bg-white/25 border border-white/20 flex items-center justify-center transition-colors ml-auto">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </motion.a>
    );
}

export function NewsCardsSection({ cards = DEFAULT_NEWS_CARDS }: NewsCardsSectionProps) {
    const [featured, ...rest] = cards;
    return (
        <AnimatedContent direction="up" fadeIn duration={0.6}>
            <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 sm:py-28 border-t border-white/[0.06]">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/25">Latest Updates</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">What's new in StudyMate.</h2>
                    <p className="text-sm text-[#C8BFB2] leading-relaxed">Protocol updates, research insights, and engineering deep-dives from the team.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Featured large card — 3 cols */}
                    <div className="lg:col-span-3">
                        <NewsCardItem card={featured} large={true} />
                    </div>

                    {/* Right smaller cards — 2 cols */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {rest.slice(0, 3).map((card, i) => (
                            <NewsCardItem key={i} card={card} large={false} />
                        ))}
                    </div>
                </div>
            </section>
        </AnimatedContent>
    );
}
