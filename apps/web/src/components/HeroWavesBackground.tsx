import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext.js';

interface HeroWavesBackgroundProps {
  voiceActive?: boolean;
}

/**
 * Interactive & Multi-Layered Wave Background tuned to Colour Palette 18:
 * - Sage Green: #ABC270 & #839758
 * - Warm Gold:  #FEC868
 * - Warm Coral: #FDA769
 * - Espresso:   #473C33
 * - Warm Cream: #FAF8F1
 */
export const HeroWavesBackground: React.FC<HeroWavesBackgroundProps> = ({
  voiceActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 760);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 760;
    };

    window.addEventListener('resize', handleResize);

    // Mouse interaction for subtle wave parallax
    let mouseX = 0.5;
    let mouseY = 0.5;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let tick = 0;

    const isDark = theme === 'dark';

    // Palette 18 wave layers
    const waveLayers = [
      {
        // Layer 1: Deep Sage Green (#ABC270 / #839758)
        fillTop: isDark ? 'rgba(171, 194, 112, 0.22)' : 'rgba(171, 194, 112, 0.34)',
        fillBottom: isDark ? 'rgba(131, 151, 88, 0.03)' : 'rgba(171, 194, 112, 0.04)',
        stroke: isDark ? 'rgba(171, 194, 112, 0.45)' : 'rgba(131, 151, 88, 0.45)',
        amplitude: 48,
        wavelength: 0.0032,
        speed: 0.016,
        yOffsetRatio: 0.42,
        phaseOffset: 0,
      },
      {
        // Layer 2: Warm Golden Yellow (#FEC868)
        fillTop: isDark ? 'rgba(254, 200, 104, 0.18)' : 'rgba(254, 200, 104, 0.32)',
        fillBottom: isDark ? 'rgba(254, 200, 104, 0.02)' : 'rgba(254, 200, 104, 0.04)',
        stroke: isDark ? 'rgba(254, 200, 104, 0.42)' : 'rgba(235, 174, 68, 0.52)',
        amplitude: 38,
        wavelength: 0.0041,
        speed: -0.013,
        yOffsetRatio: 0.52,
        phaseOffset: 2.1,
      },
      {
        // Layer 3: Warm Peach / Coral (#FDA769)
        fillTop: isDark ? 'rgba(253, 167, 105, 0.16)' : 'rgba(253, 167, 105, 0.28)',
        fillBottom: isDark ? 'rgba(253, 167, 105, 0.02)' : 'rgba(253, 167, 105, 0.03)',
        stroke: isDark ? 'rgba(253, 167, 105, 0.4)' : 'rgba(253, 167, 105, 0.55)',
        amplitude: 44,
        wavelength: 0.0028,
        speed: 0.019,
        yOffsetRatio: 0.61,
        phaseOffset: 4.2,
      },
      {
        // Layer 4: Olive / Espresso Grounding Ribbon (#839758 / #473C33)
        fillTop: isDark ? 'rgba(131, 151, 88, 0.16)' : 'rgba(71, 60, 51, 0.09)',
        fillBottom: isDark ? 'rgba(35, 29, 25, 0.0)' : 'rgba(250, 248, 241, 0.0)',
        stroke: isDark ? 'rgba(171, 194, 112, 0.3)' : 'rgba(71, 60, 51, 0.22)',
        amplitude: 30,
        wavelength: 0.005,
        speed: 0.011,
        yOffsetRatio: 0.71,
        phaseOffset: 1.3,
      },
    ];

    const render = () => {
      tick += voiceActive ? 1.8 : 1;
      ctx.clearRect(0, 0, width, height);

      // Draw each flowing ribbon wave
      waveLayers.forEach((layer, idx) => {
        const baseY = height * layer.yOffsetRatio + (mouseY - 0.5) * 18 * (idx + 1);
        const grad = ctx.createLinearGradient(0, baseY - layer.amplitude * 1.5, 0, height);
        grad.addColorStop(0, layer.fillTop);
        grad.addColorStop(1, layer.fillBottom);

        ctx.beginPath();
        ctx.moveTo(0, height);

        const step = 8;
        for (let x = 0; x <= width + step; x += step) {
          const parallaxPhase = (mouseX - 0.5) * 1.2;
          const primaryWave =
            Math.sin(x * layer.wavelength + tick * layer.speed + layer.phaseOffset + parallaxPhase) *
            layer.amplitude;
          const harmonicWave =
            Math.cos(x * layer.wavelength * 1.75 - tick * layer.speed * 0.7 + idx) *
            (layer.amplitude * 0.38);

          const y = baseY + primaryWave + harmonicWave;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw crisp crest stroke line along the top of the wave
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const parallaxPhase = (mouseX - 0.5) * 1.2;
          const primaryWave =
            Math.sin(x * layer.wavelength + tick * layer.speed + layer.phaseOffset + parallaxPhase) *
            layer.amplitude;
          const harmonicWave =
            Math.cos(x * layer.wavelength * 1.75 - tick * layer.speed * 0.7 + idx) *
            (layer.amplitude * 0.38);
          const y = baseY + primaryWave + harmonicWave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme, voiceActive]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Top Ambient Colour Palette 18 Aura Blobs */}
      <div
        className="absolute -top-28 -left-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-45 dark:opacity-25 transition-opacity"
        style={{
          background:
            'radial-gradient(circle, rgba(171,194,112,0.65) 0%, rgba(131,151,88,0.18) 55%, transparent 75%)',
        }}
      />
      <div
        className="absolute -top-16 right-[-8%] w-[520px] h-[520px] rounded-full blur-3xl opacity-45 dark:opacity-25 transition-opacity"
        style={{
          background:
            'radial-gradient(circle, rgba(254,200,104,0.65) 0%, rgba(253,167,105,0.22) 55%, transparent 75%)',
        }}
      />
      <div
        className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[680px] h-[360px] rounded-full blur-3xl opacity-35 dark:opacity-20"
        style={{
          background:
            'radial-gradient(ellipse, rgba(253,167,105,0.48) 0%, rgba(254,200,104,0.2) 50%, transparent 75%)',
        }}
      />

      {/* 2. Subtle Editorial Dot Matrix Grid */}
      <div
        className="absolute inset-0 opacity-[0.22] dark:opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(#473C33 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 35%, black 35%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 65% at 50% 35%, black 35%, transparent 100%)',
        }}
      />

      {/* 3. Top Decorative SVG Flowing Contour Ribbons */}
      <svg
        className="absolute top-0 left-0 w-full h-[540px] opacity-65 dark:opacity-35"
        viewBox="0 0 1440 540"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="p18-wave-sage" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#839758" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#ABC270" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FEC868" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="p18-wave-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEC868" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#FDA769" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ABC270" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="p18-fill-band" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ABC270" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#FEC868" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FAF8F1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soft upper wave band */}
        <path
          d="M0,96 C320,180 540,20 880,110 C1140,175 1300,65 1440,95 L1440,0 L0,0 Z"
          fill="url(#p18-fill-band)"
        />

        {/* Flowing contour lines */}
        <path
          d="M-60,150 C260,40 520,250 860,120 C1140,15 1320,180 1500,90"
          stroke="url(#p18-wave-sage)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M-60,210 C220,310 580,80 920,210 C1180,305 1340,140 1500,200"
          stroke="url(#p18-wave-gold)"
          strokeWidth="2"
          strokeDasharray="8 8"
          strokeLinecap="round"
        />
        <path
          d="M-40,280 C300,160 640,340 1000,200 C1220,115 1360,250 1480,190"
          stroke="url(#p18-wave-sage)"
          strokeWidth="1.5"
        />
      </svg>

      {/* 4. Real-Time Animated HTML5 Canvas Multi-Wave Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Bottom Layered Sculpted Wave Crest framing the Hero & Study Desk */}
      <svg
        className="absolute bottom-0 left-0 w-full h-36 sm:h-48"
        viewBox="0 0 1440 220"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Back Wave: Warm Peach / Coral (#FDA769) */}
        <path
          d="M0,95 C240,165 480,25 740,95 C1000,165 1240,45 1440,105 L1440,220 L0,220 Z"
          className="fill-[#FDA769]/20 dark:fill-[#FDA769]/10"
        />
        {/* Mid Wave: Warm Gold (#FEC868) */}
        <path
          d="M0,130 C300,55 580,180 900,115 C1150,65 1320,145 1440,120 L1440,220 L0,220 Z"
          className="fill-[#FEC868]/30 dark:fill-[#FEC868]/12"
        />
        {/* Front Wave: Sage Green (#ABC270) */}
        <path
          d="M0,155 C260,195 540,95 840,155 C1120,210 1300,135 1440,165 L1440,220 L0,220 Z"
          className="fill-[#ABC270]/35 dark:fill-[#ABC270]/15"
        />
        {/* Seamless Base Blend into Page Background */}
        <path
          d="M0,185 C380,145 720,215 1080,175 C1260,155 1370,185 1440,180 L1440,220 L0,220 Z"
          className="fill-[#FAF8F1] dark:fill-[#231D19]"
        />
      </svg>
    </div>
  );
};
