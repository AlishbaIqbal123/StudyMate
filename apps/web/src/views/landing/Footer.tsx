import React from 'react';
import { GraduationCap, Github, FileCode, Terminal } from 'lucide-react';

interface FooterProps {
  onOpenTelemetry: () => void;
  onOpenDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTelemetry, onOpenDashboard }) => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Meta */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base">StudyMate</span>
            <p className="text-xs text-slate-400">
              Voice-First Academic Assistant · Amazon Alexa+ & Model Context Protocol
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <button
            onClick={onOpenDashboard}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={onOpenTelemetry}
            className="hover:text-cyan-400 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>MCP Protocol Specs</span>
          </button>
          <a
            href="https://github.com/AlishbaIqbal123/StudyMate"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center space-x-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">MIT Open Source License</span>
        </div>
      </div>
    </footer>
  );
};
