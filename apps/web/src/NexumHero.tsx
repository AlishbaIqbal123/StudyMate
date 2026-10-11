import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

export const NexumHero: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Set page title exactly as requested
  useEffect(() => {
    document.title = 'Nexum Hero';
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'Modules', href: '#modules' },
    { label: 'Clientele', href: '#clientele' },
    { label: 'Solutions', href: '#solutions', hasDropdown: true },
    { label: 'Billing', href: '#billing' },
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden select-none font-sans antialiased">
      {/* Background Video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4"
      />

      {/* Main Content Layout */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Navigation Top Bar */}
        <nav className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              className="h-6 w-6 fill-[#010101] transition-colors lg:fill-white"
              viewBox="0 0 256 256"
            >
              <path d="M 128 128 C 128 198.692 70.692 256 0 256 C 0 185.308 57.308 128 128 128 Z M 128 128 C 198.692 128 256 185.308 256 256 C 185.308 256 128 198.692 128 128 Z M 0 0 C 70.692 0 128 57.308 128 128 C 57.308 128 0 70.692 0 0 Z M 256 0 C 256 70.692 198.692 128 128 128 C 128 57.308 185.308 0 256 0 Z" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-[#010101] transition-colors lg:text-white">
              nexum
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Glass Pill Cluster */}
            <div className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-1.5 backdrop-blur-lg">
              <a
                href="#modules"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Modules
              </a>
              <a
                href="#clientele"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Clientele
              </a>
              <a
                href="#solutions"
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span>Solutions</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </a>
              <a
                href="#billing"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Billing
              </a>
            </div>

            {/* Separate CTA Pill */}
            <button
              type="button"
              className="flex self-stretch items-center justify-center rounded-full px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
            >
              Get started
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg text-[#010101] transition-colors md:hidden lg:text-white"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu
              className={`absolute h-5 w-5 transition-all duration-300 ${
                isMenuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <X
              className={`absolute h-5 w-5 transition-all duration-300 ${
                isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </button>
        </nav>

        {/* Mobile Backdrop Overlay */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
            isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />

        {/* Mobile Slide-In Panel */}
        <div
          className={`fixed right-0 top-0 z-40 flex h-full w-72 flex-col bg-black/90 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Staggered Links */}
          <div className="flex flex-col gap-2 px-6 pt-24">
            {navLinks.map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
                }`}
                style={{
                  transition:
                    'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms, color 150ms',
                  transitionDelay: isMenuOpen ? `${(idx + 1) * 60}ms` : '0ms',
                }}
              >
                <span>{link.label}</span>
                {link.hasDropdown && <ChevronDown className="h-4 w-4 text-white/60" />}
              </a>
            ))}
          </div>

          {/* Bottom Mobile CTA */}
          <div className="mt-auto px-6 pb-10">
            <button
              type="button"
              className={`w-full rounded-full py-3 text-center text-sm font-medium text-white transition-all duration-400 hover:opacity-90 ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{
                background: 'linear-gradient(to bottom, #2B2B2B, #101010)',
                transitionDelay: isMenuOpen ? '300ms' : '0ms',
              }}
            >
              Get started
            </button>
          </div>
        </div>

        {/* Bottom-Anchored Main Content */}
        <main className="mt-auto flex flex-col gap-8 px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-12 lg:pb-16">
          {/* Left: Headline + Email CTA */}
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#010101] transition-colors sm:text-4xl lg:text-[3.5rem] lg:text-white">
              Ship AI workers that grind while you rest
            </h1>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex flex-col gap-3 sm:mt-8 sm:inline-flex sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:bg-white sm:p-1.5"
            >
              <input
                type="email"
                placeholder="Type your email"
                className="rounded-full bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none sm:w-64 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-2"
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:py-2.5"
                style={{ background: 'linear-gradient(to bottom, #2B2B2B, #101010)' }}
              >
                Get started
              </button>
            </form>
          </div>

          {/* Right: Two Glass Cards */}
          <div className="flex flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5">
            {/* Stats Card */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
              <div>
                <div
                  className="text-3xl font-normal tracking-tight text-[#010101] transition-colors sm:text-4xl lg:text-white"
                  style={{ fontFamily: "'Silkscreen', cursive" }}
                >
                  42,500+
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#010101]/70 transition-colors sm:mt-4 lg:text-white/70">
                  Teams run Nexum to handle recurring ops daily.
                </p>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
              <div>
                <div className="mb-3 flex items-center gap-2 sm:mb-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-black text-xs font-bold text-white">
                    S
                  </div>
                  <span className="text-sm font-semibold text-[#010101] transition-colors lg:text-white">
                    Stratify
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#010101]/80 transition-colors lg:text-white/80">
                  "With Nexum we went from managing tedious operational work to having AI agents that handle everything."
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3 sm:mt-5">
                <img
                  src="https://i.pravatar.cc/72?img=12"
                  alt="Sara Klein"
                  className="h-9 w-9 shrink-0 rounded-full bg-white/20 object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-[#010101] transition-colors lg:text-white">
                    Sara Klein
                  </div>
                  <div className="text-xs text-[#010101]/60 transition-colors lg:text-white/60">
                    Dir of Operations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default NexumHero;
