import React, { useState } from 'react';
import { Navbar } from './Navbar.js';
import { HeroSection } from './HeroSection.js';
import { VoiceSimulatorSection } from './VoiceSimulatorSection.js';
import { McpToolsSection } from './McpToolsSection.js';
import { StudentPersonasSection } from './StudentPersonasSection.js';
import { ArchitectureSection } from './ArchitectureSection.js';
import { CtaSection } from './CtaSection.js';
import { Footer } from './Footer.js';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenVoice: () => void;
  onOpenPlanner: () => void;
  onOpenTelemetry: () => void;
  onStudentChanged: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenTelemetry,
  onStudentChanged,
}) => {
  const [activePrompt, setActivePrompt] = useState("What's due this week?");

  const handleSelectPrompt = (prompt: string) => {
    setActivePrompt(prompt);
    // Smoothly scroll down to the voice simulator
    const el = document.getElementById('voice-demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white font-sans antialiased">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenDashboard={onOpenDashboard}
        onOpenVoice={onOpenVoice}
        onOpenTelemetry={onOpenTelemetry}
      />

      <main>
        {/* 2. Master Hero Section */}
        <HeroSection
          onOpenDashboard={onOpenDashboard}
          onOpenVoice={onOpenVoice}
          onSelectPrompt={handleSelectPrompt}
          activePrompt={activePrompt}
        />

        {/* 3. Real-Time Alexa+ Voice Sandbox */}
        <VoiceSimulatorSection
          currentPrompt={activePrompt}
          onPromptChange={setActivePrompt}
          onOpenDashboard={onOpenDashboard}
        />

        {/* 4. The 5 Core MCP Tools Showcase */}
        <McpToolsSection
          onOpenTelemetry={onOpenTelemetry}
          onOpenVoice={onOpenVoice}
        />

        {/* 5. Multi-Student Persona Switcher */}
        <StudentPersonasSection
          onStudentChanged={onStudentChanged}
          onOpenDashboard={onOpenDashboard}
        />

        {/* 6. System Architecture Pipeline */}
        <ArchitectureSection />

        {/* 7. Call To Action Banner */}
        <CtaSection
          onOpenDashboard={onOpenDashboard}
          onOpenVoice={onOpenVoice}
        />
      </main>

      {/* 8. Modern Technical Footer */}
      <Footer
        onOpenTelemetry={onOpenTelemetry}
        onOpenDashboard={onOpenDashboard}
      />
    </div>
  );
};

export default LandingPage;
