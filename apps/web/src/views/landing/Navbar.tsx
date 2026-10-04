import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  User,
  CheckCircle2,
  Menu,
  X,
  Radio,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface NavbarProps {
  onOpenDashboard: () => void;
  onOpenVoice: () => void;
  onOpenTelemetry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenTelemetry,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-slate-950/50'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl text-white tracking-tight">StudyMate</span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                MCP Add-on
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Voice-First Academic Co-pilot</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => scrollTo('voice-demo')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Voice Engine
          </button>
          <button
            onClick={() => scrollTo('mcp-tools')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            MCP Tools
          </button>
          <button
            onClick={() => scrollTo('personas')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Student Personas
          </button>
          <button
            onClick={() => scrollTo('architecture')}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Architecture
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          {/* Active Profile Pill / Auth Modal Trigger */}
          <button
            onClick={openAuthModal}
            className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition cursor-pointer"
            title="Manage Student Account & Alexa+ Linking"
          >
            <div className="w-5 h-5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center">
              {user?.avatar || 'ST'}
            </div>
            <span className="font-semibold text-white">{user?.name ? user.name.split(' ')[0] : 'Sign In'}</span>
            {user?.alexaLinked ? (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" title="Alexa+ Linked" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Alexa+ Not Linked" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenDashboard}
            className="group relative inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-6 py-6 space-y-4 animate-in fade-in duration-200 backdrop-blur-xl">
          <div className="space-y-3">
            <button
              onClick={() => scrollTo('voice-demo')}
              className="w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
            >
              Voice Engine & Simulator
            </button>
            <button
              onClick={() => scrollTo('mcp-tools')}
              className="w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
            >
              The 5 MCP Tools
            </button>
            <button
              onClick={() => scrollTo('personas')}
              className="w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
            >
              Multi-Student Personas
            </button>
            <button
              onClick={() => scrollTo('architecture')}
              className="w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
            >
              System Architecture & Streamable HTTP
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDashboard();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-md text-center flex items-center justify-center space-x-2"
            >
              <span>Open Companion Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full py-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-sm font-medium text-center flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Student Account & Alexa OAuth</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVoice();
              }}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium text-center"
            >
              Open Voice Console
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
