# Design Document: Frontend Redesign

## Overview

This document describes the architecture, component interfaces, integration points, and correctness properties for the full frontend redesign of the StudyMate web application. The redesign introduces framer-motion as a dependency, builds a library of ten ReactBits-inspired animated components, enhances the landing page with kinetic text and new sections, redesigns the app shell (Sidebar + Header), and applies scroll-triggered reveals and view-specific animations across all five inner views.

All components are implemented as inline TypeScript React components using framer-motion and TailwindCSS. No external npm packages beyond framer-motion are introduced.

## Architecture

### Dependency Addition

Add `framer-motion@^11.0.0` to `apps/web/package.json` under `dependencies`:

```json
"framer-motion": "^11.0.0"
```

framer-motion 11.x is compatible with React 18.3.x (the version currently in the project).

### Directory Structure

```
apps/web/src/
├── components/
│   └── animated/                    # New: ReactBits animated component library
│       ├── SpotlightCard.tsx
│       ├── TiltedCard.tsx
│       ├── AnimatedContent.tsx
│       ├── ScrollVelocity.tsx
│       ├── GradualBlur.tsx
│       ├── BorderGlow.tsx
│       ├── ShinyText.tsx
│       ├── BlurText.tsx
│       ├── SplitText.tsx
│       ├── CountUp.tsx
│       └── AuroraBackground.tsx    # Bonus: animated hero background
├── views/
│   └── landing/                     # New: extractable landing page sections
│       ├── ProductShowcaseSection.tsx
│       ├── TestimonialsSection.tsx
│       └── NewsCardsSection.tsx
├── StudyMateHero.tsx                # Modified: animated hero + new sections
├── components/
│   ├── Sidebar.tsx                  # Modified: animation wrappers
│   └── Header.tsx                   # Modified: ShinyText + screen transitions
└── views/
    ├── DashboardView.tsx            # Modified: TiltedCard + SpotlightCard
    ├── AssignmentsView.tsx          # Modified: spring entrance for list rows
    ├── PlannerView.tsx             # Modified: AnimatedContent wrappers
    ├── VoiceConsoleView.tsx        # Modified: animated mic indicator
    └── TelemetryView.tsx           # Modified: AnimatedContent wrappers
```

### Integration Strategy

The redesign is additive: existing layout structures, color palettes, functional behavior, and prop interfaces are preserved. Changes consist of wrapping existing content in animated components and inserting new sections between existing ones. No existing sections are removed or reordered.

### Framer-Motion API Usage Summary

| Component | Key framer-motion APIs |
|---|---|
| SpotlightCard | `useMotionValue`, `useMotionTemplate` |
| TiltedCard | `useMotionValue`, `useSpring` |
| AnimatedContent | `useInView`, `motion.div`, `Variants` |
| ScrollVelocity | `useScroll`, `useVelocity`, `useTransform`, `useMotionValue` |
| GradualBlur | CSS `mask-image` / `filter: blur()` |
| BorderGlow | `useMotionValue`, `useMotionTemplate` |
| ShinyText | `motion.span`, `animate`, `useReducedMotion` |
| BlurText | `animate`, `useReducedMotion` |
| SplitText | `motion.span`, `staggerChildren`, `Variants` |
| CountUp | `useMotionValue`, `animate`, `useInView` |
| AuroraBackground | `motion.div`, `animate`, `useReducedMotion` |

All components also use `useReducedMotion` to respect the browser's `prefers-reduced-motion` preference.

---

## Component Library: ReactBits Animated Components

All components live in `apps/web/src/components/animated/` and export a named component plus a TypeScript props interface.

### SpotlightCard

Renders a radial spotlight gradient that follows the pointer within the card bounds.

```typescript
interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  /** Radius of the spotlight gradient in pixels */
  spotlightRadius?: number;
  /** Spotlight color (CSS color string) */
  spotlightColor?: string;
  /** Background color of the card */
  backgroundColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  spotlightRadius = 200,
  spotlightColor = 'rgba(255, 255, 255, 0.15)',
  backgroundColor = 'transparent',
}: SpotlightCardProps): JSX.Element
```

**Implementation notes:**
- Uses `useMotionValue` to track `mouseX` and `mouseY` motion values.
- Uses `useMotionTemplate` to compose a `radial-gradient` string from the motion values.
- On `onMouseMove`, computes the pointer position relative to the card's bounding rect and updates the motion values.
- Renders a `motion.div` with the background set via `useMotionTemplate` and a `maskImage` to confine the spotlight to the card.
- When `useReducedMotion()` returns true, renders a static card without the spotlight overlay.

### TiltedCard

Applies a 3D tilt transformation toward the cursor with an optional glare overlay.

```typescript
interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt angle in degrees */
  tiltMaxAngle?: number;
  /** Whether to show the glare overlay */
  showGlare?: boolean;
  /** Glare opacity (0–1) */
  glareOpacity?: number;
}

export function TiltedCard({
  children,
  className = '',
  tiltMaxAngle = 8,
  showGlare = true,
  glareOpacity = 0.25,
}: TiltedCardProps): JSX.Element
```

**Implementation notes:**
- Uses `useMotionValue` for `rotateX` and `rotateY` values, wrapped in `useSpring` for smooth physics.
- On `onMouseMove`, computes the cursor's offset from the card center as a fraction (-1 to 1), then multiplies by `tiltMaxAngle` to get the rotation.
- The glare overlay is a `motion.div` positioned absolutely with a linear-gradient that shifts based on cursor position.
- When `useReducedMotion()` returns true, renders children with no transform applied.

### AnimatedContent

A wrapper that triggers a configurable reveal animation when child content enters the viewport.

```typescript
interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
  /** Reveal direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Distance to slide in pixels */
  distance?: number;
  /** Blur amount in pixels for blur transition */
  blur?: number;
  /** Whether to fade in */
  fadeIn?: boolean;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Root margin for useInView (e.g., '-50px') */
  rootMargin?: string;
  /** Whether to animate only once (true) or every time it enters view (false) */
  once?: boolean;
  /** Disable animations entirely (render children immediately) */
  disableAnimations?: boolean;
}

export function AnimatedContent({
  children,
  className = '',
  direction = 'up',
  distance = 40,
  blur = 0,
  fadeIn = true,
  duration = 0.5,
  delay = 0,
  rootMargin = '-50px',
  once = true,
  disableAnimations = false,
}: AnimatedContentProps): JSX.Element
```

**Implementation notes:**
- Uses `useInView` from framer-motion with a `ref` and configurable `rootMargin` to detect viewport entry.
- Defines `Variants` for `hidden` and `visible` states based on `direction`, `distance`, `blur`, and `fadeIn` props.
- When `useReducedMotion()` returns true OR `disableAnimations` is true, renders children directly in the `visible` state without transition.
- The `once` prop controls whether `useInView` resets when the element leaves the viewport.

### ScrollVelocity

Renders horizontally scrolling text whose speed is proportional to page scroll velocity.

```typescript
interface ScrollVelocityProps {
  /** Text to display in the marquee */
  text: string;
  className?: string;
  /** Base scroll speed in pixels per second */
  baseSpeed?: number;
  /** Multiplier applied to scroll velocity */
  velocityMultiplier?: number;
  /** Font size for the marquee text */
  fontSize?: string;
}

export function ScrollVelocity({
  text,
  className = '',
  baseSpeed = 50,
  velocityMultiplier = 0.1,
  fontSize = '2rem',
}: ScrollVelocityProps): JSX.Element
```

**Implementation notes:**
- Uses `useScroll()` to get the scroll position, then `useVelocity()` on the scroll Y to get scroll velocity.
- Uses `useTransform` to map scroll velocity to the X translate value, combining with `baseSpeed` for a constant baseline.
- Wraps the text in a `motion.div` with a `repeat: Infinity` animation, modulating speed via the `useTransform` output.
- When `useReducedMotion()` returns true, renders the text statically with no horizontal motion.

### GradualBlur

Applies a progressive blur gradient mask to a content region, creating a soft fade at edges.

```typescript
interface GradualBlurProps {
  children?: React.ReactNode;
  className?: string;
  /** Direction of the blur gradient */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Blur intensity in pixels */
  blurAmount?: number;
  /** Height/width of the gradient transition zone as a CSS length */
  transitionZone?: string;
}

export function GradualBlur({
  children,
  className = '',
  direction = 'bottom',
  blurAmount = 12,
  transitionZone = '100px',
}: GradualBlurProps): JSX.Element
```

**Implementation notes:**
- Renders a `motion.div` with a CSS `maskImage` that creates a linear gradient from transparent to opaque, producing a progressive blur effect.
- The `direction` prop controls the gradient orientation (e.g., `to bottom`, `to top`).
- Uses `filter: blur()` combined with the mask to create the gradual transition.
- When `useReducedMotion()` returns true, renders children with no blur filter.

### BorderGlow

Renders a glowing border whose glow position tracks the cursor along the element perimeter.

```typescript
interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  /** Glow color (CSS color string) */
  glowColor?: string;
  /** Glow radius in pixels */
  glowRadius?: number;
  /** Border radius of the element */
  borderRadius?: string;
}

export function BorderGlow({
  children,
  className = '',
  glowColor = 'rgba(99, 102, 241, 0.6)',
  glowRadius = 300,
  borderRadius = '1rem',
}: BorderGlowProps): JSX.Element
```

**Implementation notes:**
- Uses `useMotionValue` to track `mouseX` and `mouseY` motion values.
- Uses `useMotionTemplate` to compose a `radial-gradient` glow positioned at the cursor coordinates, clipped to the element's border via `overflow: hidden` and `maskImage`.
- On `onMouseMove`, updates the motion values with the cursor's position relative to the element.
- When `useReducedMotion()` returns true, renders a static border without the cursor-tracking glow.

### ShinyText

Animates a light sheen sweeping across text content on a loop or on hover.

```typescript
interface ShinyTextProps {
  /** Text to display */
  text: string;
  className?: string;
  /** Sheen animation duration in seconds */
  duration?: number;
  /** Trigger: 'hover' sweeps on mouse enter, 'loop' sweeps continuously */
  trigger?: 'hover' | 'loop';
  /** Sheen color (CSS gradient color) */
  sheenColor?: string;
  /** Base text color */
  textColor?: string;
}

export function ShinyText({
  text,
  className = '',
  duration = 3,
  trigger = 'loop',
  sheenColor = 'rgba(255, 255, 255, 0.8)',
  textColor = 'inherit',
}: ShinyTextProps): JSX.Element
```

**Implementation notes:**
- Renders a `motion.span` with a `background-image` linear gradient (base color to sheen color to base color) and `background-clip: text`.
- Animates `backgroundPosition` via framer-motion's `animate` prop. For `trigger: 'loop'`, uses `repeat: Infinity`. For `trigger: 'hover'`, uses `whileHover`.
- When `useReducedMotion()` returns true, renders the text with a static gradient (no animation).

### BlurText

Starts with a blur filter applied and animates to zero blur on mount or scroll-into-view.

```typescript
interface BlurTextProps {
  text: string;
  className?: string;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Delay before animation in milliseconds */
  delay?: number;
  /** Initial blur amount in pixels */
  blurAmount?: number;
  /** Whether to trigger on scroll-into-view (true) or on mount (false) */
  animateOnView?: boolean;
  /** Root margin for useInView when animateOnView is true */
  rootMargin?: string;
}

export function BlurText({
  text,
  className = '',
  duration = 1000,
  delay = 0,
  blurAmount = 20,
  animateOnView = false,
  rootMargin = '-50px',
}: BlurTextProps): JSX.Element
```

**Implementation notes:**
- Uses framer-motion's `animate` function with `filter: blur()` as the animated property.
- When `animateOnView` is true, uses `useInView` to trigger the animation; otherwise animates on mount.
- Initial state: `filter: blur(${blurAmount}px)`, `opacity: 0`. Final state: `filter: blur(0px)`, `opacity: 1`.
- When `useReducedMotion()` returns true, renders text immediately with no blur and full opacity.

### SplitText

Splits a string into individual character spans with a staggered entrance animation.

```typescript
interface SplitTextProps {
  text: string;
  className?: string;
  /** Direction of the entrance animation */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Per-character stagger interval in milliseconds */
  staggerInterval?: number;
  /** Easing function name or array */
  easing?: string | number[];
  /** Animation duration per character in milliseconds */
  charDuration?: number;
  /** Delay before the first character animates in milliseconds */
  delay?: number;
}

export function SplitText({
  text,
  className = '',
  direction = 'up',
  staggerInterval = 40,
  easing = 'easeOut',
  charDuration = 400,
  delay = 0,
}: SplitTextProps): JSX.Element
```

**Implementation notes:**
- Splits the `text` string into individual characters (including spaces, which render as non-breaking spaces).
- Renders each character as a `motion.span` with a `Variants` object defining `hidden` and `visible` states.
- The parent `motion.span` uses `staggerChildren: staggerInterval / 1000` and `delayChildren: delay / 1000` in the transition config.
- Each child's delay is computed as `index * staggerInterval + delay`.
- When `useReducedMotion()` returns true, renders all characters in their final visible state with no stagger.

### CountUp

Animates a number from a start value to a target value on mount or scroll-into-view.

```typescript
interface CountUpProps {
  /** Target value to count up to */
  to: number;
  /** Starting value (default: 0) */
  from?: number;
  className?: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation in seconds */
  delay?: number;
  /** Number of decimal places to display */
  decimals?: number;
  /** Prefix string (e.g., '$') */
  prefix?: string;
  /** Suffix string (e.g., '%') */
  suffix?: string;
  /** Whether to trigger on scroll-into-view */
  animateOnView?: boolean;
  /** Root margin for useInView */
  rootMargin?: string;
}

export function CountUp({
  to,
  from = 0,
  className = '',
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  animateOnView = true,
  rootMargin = '-50px',
}: CountUpProps): JSX.Element
```

**Implementation notes:**
- Uses `useMotionValue(from)` to create the animated value, and `animate()` from framer-motion to tween it to `to`.
- Uses `useInView` when `animateOnView` is true; otherwise triggers on mount.
- Subscribes to the motion value via `.on('change', ...)` and updates a React state with the formatted number.
- When `useReducedMotion()` returns true, displays the target value `to` immediately with no animation.

### AuroraBackground

Renders flowing gradient visuals behind the hero content as an animated background.

```typescript
interface AuroraBackgroundProps {
  className?: string;
  /** Array of CSS colors for the aurora gradient blobs */
  colors?: string[];
  /** Number of animated blob layers */
  blobCount?: number;
  /** Animation duration for each blob in seconds */
  duration?: number;
}

export function AuroraBackground({
  className = '',
  colors = ['rgba(229, 169, 82, 0.15)', 'rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.08)'],
  blobCount = 3,
  duration = 15,
}: AuroraBackgroundProps): JSX.Element
```

**Implementation notes:**
- Renders multiple `motion.div` blobs positioned absolutely with radial-gradient backgrounds.
- Each blob animates `x`, `y`, `scale`, and `opacity` in an infinite loop with staggered delays, creating a flowing aurora effect.
- The container has `pointer-events: none` and a low `z-index` (e.g., `z-0`) so it sits behind the hero content.
- When `useReducedMotion()` returns true, renders static gradient blobs with no motion.

---

## Landing Page Enhancements

### StudyMateHero.tsx Modifications

The existing `StudyMateHero.tsx` is modified in place. The current section order is:

1. Floating Island Navigation (header)
2. Hero Editorial Manifesto (includes the Interactive Workstation)
3. MCP Protocol Showcase (`id="mcp-protocol"`)
4. Live Voice Studio Sandbox (`id="voice-lab"`)
5. Data Sovereignty & Architecture (`id="architecture"`)
6. Scholar Preview Pass vs Verified Member
7. Call To Action Master Banner
8. Minimalist Editorial Footer

#### Hero Section Animations

The hero section (section 2) gets the following enhancements:

- **AuroraBackground**: Rendered as the first child inside the hero section, positioned absolutely behind all content with `z-0`. The existing ambient glow divs remain.

- **BlurText heading**: The existing `<h1>` heading text is replaced with `<BlurText>` components. The two-line heading ("The academic flow state." and "Structured through conversation.") each use BlurText with `duration={1200}` (within the 800–1500ms range) and `animateOnView={false}` (animate on mount).

- **SplitText heading**: The same heading text is also wrapped in `<SplitText>` with `staggerInterval={40}` (within the 20–60ms range) and `direction="up"`. BlurText and SplitText are composed: the heading uses SplitText for the character stagger, and each character's entrance includes a blur-to-sharp transition.

- **CountUp stats bar**: A new stats bar is added below the hero heading, before the button group. It renders at least three `<CountUp>` components:
  - "5" with suffix " MCP Tools" (from 0 to 5)
  - "100" with suffix "% Sovereign" (from 0 to 100)
  - "0" with suffix " Surveillance pixels" (from 0 to 0)
  Each uses `animateOnView={true}` to trigger when scrolled into view.

- **ScrollVelocity marquee**: A new `<ScrollVelocity>` section is inserted immediately after the hero section (section 2) and before the MCP Protocol Showcase (section 3). The text displays a rotating set of keywords like "DEEP FOCUS · POMODORO · MCP PROTOCOL · ALEXA+ · SOVEREIGN DATA".

#### Existing Section Reveal Animations

Each existing section (Voice Simulator, MCP Tools, Student Personas/Preview Pass, Architecture, CTA, Footer) is wrapped in `<AnimatedContent>` with `direction="up"`, `fadeIn={true}`, `duration={0.6}`, and `once={true}`. The wrapping is applied at the outermost section element level, preserving the existing section IDs and content.

#### New Landing Page Sections

Three new sections are inserted into `StudyMateHero.tsx` between existing sections without reordering existing content. The insertion points are:

1. **ProductShowcaseSection** — inserted after the Voice Studio Sandbox (section 4) and before the Architecture section (section 5).
2. **TestimonialsSection** — inserted after the Architecture section (section 5) and before the Scholar Preview Pass section (section 6).
3. **NewsCardsSection** — inserted after the Scholar Preview Pass section (section 6) and before the CTA section (section 7).

Each new section is a separate component file in `apps/web/src/views/landing/` and is rendered with an `<AnimatedContent>` wrapper.

### ProductShowcaseSection.tsx

```typescript
interface ProductShowcaseSectionProps {
  /** List of showcase slides */
  slides: ShowcaseSlide[];
}

interface ShowcaseSlide {
  /** Title of the showcase slide */
  title: string;
  /** Description text */
  description: string;
  /** Image URL or mockup identifier */
  image: string;
  /** Accent color for the slide */
  accentColor?: string;
}

export function ProductShowcaseSection({ slides }: ProductShowcaseSectionProps): JSX.Element
```

**Implementation notes:**
- Renders a horizontally scrolling carousel of rounded cards, each displaying an app screen image/mockup.
- Auto-scrolls using a `setInterval` with an interval between 3000–6000ms (configured at 4000ms by default).
- On `onMouseEnter`, the interval is cleared to pause auto-scroll. On `onMouseLeave`, the interval is restarted.
- Uses framer-motion's `AnimatePresence` with `mode="wait"` for smooth card transitions between slides.
- Styled with the dark editorial aesthetic: `#07090E` background, `#E5A952` gold accents, white text.
- Wrapped in `<AnimatedContent direction="up" fadeIn duration={0.6}>`.

### TestimonialsSection.tsx

```typescript
interface TestimonialsSectionProps {
  /** List of testimonials */
  testimonials: Testimonial[];
}

interface Testimonial {
  /** Customer name */
  name: string;
  /** Customer role/major */
  role: string;
  /** Customer image URL */
  image: string;
  /** Short quote (collapsed view) */
  quote: string;
  /** Full quote (expanded view) */
  fullQuote?: string;
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps): JSX.Element
```

**Implementation notes:**
- Renders at least two testimonial cards. Each card contains a customer image, name, and quote.
- Uses an accordion-style layout: clicking a card expands it to reveal the full quote and collapses others. Managed by a `useState` for the active index.
- Uses framer-motion's `AnimatePresence` and `layout` animations for smooth expand/collapse transitions.
- Styled with the dark editorial aesthetic: `#07090E` background, `#E5A952` gold accents.
- Wrapped in `<AnimatedContent direction="up" fadeIn duration={0.6}>`.

### NewsCardsSection.tsx

```typescript
interface NewsCardsSectionProps {
  /** List of news/blog cards (3–4 items) */
  cards: NewsCard[];
}

interface NewsCard {
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Navigation link (URL) */
  link: string;
  /** Date label */
  date?: string;
}

export function NewsCardsSection({ cards }: NewsCardsSectionProps): JSX.Element
```

**Implementation notes:**
- Renders between 3 and 4 cards, each displaying a title, description, a blue gradient background, and an arrow link button.
- The blue gradient background uses `bg-gradient-to-br from-blue-600/20 to-indigo-600/10` Tailwind classes.
- The arrow link button uses an `<a>` or `<button>` with an `onClick` that navigates to the `link` URL.
- Uses framer-motion `whileHover` for a subtle scale/translate effect on each card.
- Wrapped in `<AnimatedContent direction="up" fadeIn duration={0.6}>`.

---

## App Shell Redesign

### Sidebar.tsx Modifications

The existing `Sidebar.tsx` is modified with animation wrappers while preserving all existing props, navigation items, and behavior.

**Entrance animation:**
- The outer `<aside>` element is wrapped in `<AnimatedContent direction="left" fadeIn duration={0.5} once={true}>` to produce a slide-from-left and fade-in entrance on mount.

**Icon glass treatment:**
- Each nav item's icon container gets Tailwind classes for glass-style: `backdrop-blur-md bg-white/5 dark:bg-white/10 border border-white/10` and a framer-motion `whileHover={{ scale: 1.1 }}` for the scale-on-hover effect.

**Active item BorderGlow:**
- When a nav item is the active screen (`isActive` is true), the item is wrapped in `<BorderGlow>` with `glowColor` matching the active accent (`rgba(99, 102, 241, 0.5)` for light mode, `rgba(34, 211, 238, 0.5)` for dark mode).
- The BorderGlow tracks the cursor position along the item's perimeter.

### Header.tsx Modifications

The existing `Header.tsx` is modified while preserving all props, screen titles, and action buttons.

**ShinyText brand name:**
- The brand name text "studymate" in the sidebar logo area and the header screen title area uses `<ShinyText>` with `trigger="loop"` and `duration={4}`.

**Screen transition animation:**
- The screen title and subtitle area is wrapped in a `<motion.div>` with `key={activeScreen}` and `AnimatePresence` to trigger a re-animation on screen switch.
- The transition uses `initial={{ opacity: 0, y: 10 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, y: -10 }}` with `duration={0.3}` (300ms, within the 200–500ms range).

---

## Inner Views Enhancement

### DashboardView.tsx

- **KPI cards**: The existing `<KpiCards>` component renders KPI cards. Each KPI card is wrapped in `<TiltedCard>` with `tiltMaxAngle={8}` and `showGlare={true}`.
- **Course progress cards**: Each course progress card in the "Course Pacing" section is wrapped in `<SpotlightCard>` with `spotlightColor="rgba(229, 169, 82, 0.1)"`.
- **All major sections** (guest banner, hero banner, KPI row, Alexa+ assistant box, two-column layout) are wrapped in `<AnimatedContent direction="up" fadeIn duration={0.5}>`.

### AssignmentsView.tsx

- **List mode task rows**: Each task row in list mode is wrapped in a `<motion.div>` with a spring entrance animation. The parent container uses `staggerChildren` to produce a staggered entrance as rows appear.
  ```typescript
  const listVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  ```
- **All major sections** (top banner, filter bar, kanban board, list view) are wrapped in `<AnimatedContent>`.

### PlannerView.tsx

- Each major planner section is wrapped in `<AnimatedContent direction="up" fadeIn duration={0.5}>`:
  1. Top banner
  2. Focus assignment banner (conditional)
  3. Timer card (big Pomodoro clock)
  4. AI schedule blocks
  5. Study stats tracker (inside AuthGate)

### VoiceConsoleView.tsx

- **Microphone indicator**: The mic toggle button uses a `motion.button` with conditional animation:
  - When `isListening` is true: `animate={{ scale: [1, 1.1, 1] }}` with `transition={{ repeat: Infinity, duration: 1 }}` (pulsing).
  - When `isListening` is false: `animate={{ scale: 1 }}` (calm idle state).
- **All major sections** (top banner, chat canvas, prompt scenarios) are wrapped in `<AnimatedContent>`.

### TelemetryView.tsx

- Each major telemetry section is wrapped in `<AnimatedContent direction="up" fadeIn duration={0.5}>`:
  1. Status banner
  2. Action tester card
  3. Activity feed
  4. Database inspector

---

## Color Palette and Theme Preservation

### Landing Page (Dark Editorial)

The landing page retains its existing dark aesthetic throughout all existing and new sections:
- Background: `#07090E`
- Gold accent: `#E5A952`
- Text: `#F5EFE6` (primary), `#C8BFB2` (secondary)
- All new animated components on the landing page use these color tokens.

### Inner App (Light/Dark Theme)

The inner app retains the existing light/dark theme system with blue-cyan accents:
- Light mode: `#FAF7F2` background, `#1C1917` text, `#E5A952` gold, blue-cyan accents
- Dark mode: `#0B0D13` / `#0E1117` background, `#F5EFE6` text, `#E5A952` gold, cyan accents
- Animated components use Tailwind's `dark:` variant and the existing `ThemeContext` to respect the active theme.
- Framer-motion animations use `transition` properties (opacity, transform, filter) that are theme-agnostic. Color values in animations are derived from Tailwind classes that automatically switch with the theme context.

### Theme Toggle Without Reload

The existing `ThemeContext` toggles a class on the root element. Since animated components use Tailwind classes (not hardcoded color values in motion configs), the theme switch updates CSS classes without requiring a page reload. The framer-motion animations continue running with the updated color tokens.

---

## Reduced Motion and Performance

### useReducedMotion Integration

Every animated component calls `useReducedMotion()` from framer-motion. When the browser reports `prefers-reduced-motion: reduce`:

- **SpotlightCard**: Renders a static card without the spotlight overlay.
- **TiltedCard**: Renders children with no 3D transform.
- **AnimatedContent**: Renders children immediately in the visible state (no slide, no fade, no blur).
- **ScrollVelocity**: Renders the text statically with no horizontal motion.
- **GradualBlur**: Renders children with no blur filter.
- **BorderGlow**: Renders a static border without the cursor-tracking glow.
- **ShinyText**: Renders the text with a static gradient (no sweeping animation).
- **BlurText**: Renders the text immediately with no blur and full opacity.
- **SplitText**: Renders all characters in their final visible state with no stagger.
- **CountUp**: Displays the target value immediately with no count-up animation.
- **AuroraBackground**: Renders static gradient blobs with no motion.

### AnimatedContent Disable Prop

The `AnimatedContent` component accepts a `disableAnimations` boolean prop. When true (or when reduced motion is active), it renders children directly in the visible state without a scroll-triggered reveal. This allows individual sections to opt out of animations.

### Performance Guidelines

- All framer-motion animations use hardware-accelerated CSS properties: `transform` (translate, rotate, scale), `opacity`, and `filter` (blur). No layout-triggering properties (`width`, `height`, `margin`, `padding`) are animated.
- `useInView` uses `once={true}` where appropriate to avoid re-triggering animations on scroll back and forth.
- The `ScrollVelocity` component uses `useTransform` to derive motion values from scroll data without causing re-renders.
- `CountUp` uses a single `useMotionValue` and `.on('change')` subscription rather than `setState` on every frame, minimizing React re-renders.

---

## Error Handling

### Graceful Degradation

- If framer-motion fails to load (module-not-found), the components should still render their children. Each animated component wraps its animation logic in a try/catch or conditional that falls back to rendering children in a static state.
- If `useInView` is not supported (e.g., older browser), `AnimatedContent` defaults to rendering children immediately.
- If the Web Audio API or Speech Recognition API is unavailable, existing fallback behavior is preserved (no change from current implementation).

### TypeScript Safety

- All component props interfaces use optional properties with sensible defaults.
- All framer-motion motion values are properly typed (e.g., `MotionValue<number>`).
- No `any` types are used in the animated component prop interfaces.

---

## Components and Interfaces

The following table summarizes all new components and their key interfaces. Full interface definitions are provided in the Component Library section above.

| Component | File | Key Props | Wrapped In |
|---|---|---|---|
| SpotlightCard | `animated/SpotlightCard.tsx` | `children`, `spotlightRadius`, `spotlightColor` | N/A (card itself) |
| TiltedCard | `animated/TiltedCard.tsx` | `children`, `tiltMaxAngle`, `showGlare`, `glareOpacity` | N/A (card itself) |
| AnimatedContent | `animated/AnimatedContent.tsx` | `children`, `direction`, `distance`, `blur`, `fadeIn`, `duration`, `delay`, `disableAnimations` | Wraps existing sections |
| ScrollVelocity | `animated/ScrollVelocity.tsx` | `text`, `baseSpeed`, `velocityMultiplier` | N/A (marquee itself) |
| GradualBlur | `animated/GradualBlur.tsx` | `children`, `direction`, `blurAmount` | N/A (overlay) |
| BorderGlow | `animated/BorderGlow.tsx` | `children`, `glowColor`, `glowRadius` | Wraps active nav items |
| ShinyText | `animated/ShinyText.tsx` | `text`, `duration`, `trigger`, `sheenColor` | Replaces static text |
| BlurText | `animated/BlurText.tsx` | `text`, `duration`, `delay`, `blurAmount`, `animateOnView` | Replaces heading text |
| SplitText | `animated/SplitText.tsx` | `text`, `direction`, `staggerInterval`, `easing` | Wraps heading text |
| CountUp | `animated/CountUp.tsx` | `to`, `from`, `duration`, `decimals`, `prefix`, `suffix` | N/A (counter itself) |
| AuroraBackground | `animated/AuroraBackground.tsx` | `colors`, `blobCount`, `duration` | N/A (background layer) |
| ProductShowcaseSection | `views/landing/ProductShowcaseSection.tsx` | `slides: ShowcaseSlide[]` | AnimatedContent |
| TestimonialsSection | `views/landing/TestimonialsSection.tsx` | `testimonials: Testimonial[]` | AnimatedContent |
| NewsCardsSection | `views/landing/NewsCardsSection.tsx` | `cards: NewsCard[]` | AnimatedContent |

### Integration Points

- **StudyMateHero.tsx**: Imports `BlurText`, `SplitText`, `CountUp`, `ScrollVelocity`, `AuroraBackground`, `AnimatedContent`, `ProductShowcaseSection`, `TestimonialsSection`, `NewsCardsSection`. New sections are inserted between existing sections at the points described in the Landing Page Enhancements section.
- **Sidebar.tsx**: Imports `AnimatedContent` (entrance), `BorderGlow` (active item). Preserves existing `SidebarProps` interface.
- **Header.tsx**: Imports `ShinyText` (brand name), `AnimatePresence` and `motion` from framer-motion (screen transitions). Preserves existing `HeaderProps` interface.
- **DashboardView.tsx**: Imports `TiltedCard`, `SpotlightCard`, `AnimatedContent`. Preserves existing `DashboardViewProps` interface.
- **AssignmentsView.tsx**: Imports `motion`, `AnimatePresence` from framer-motion for list row spring entrance. Imports `AnimatedContent` for section reveals. Preserves existing `AssignmentsViewProps` interface.
- **PlannerView.tsx**: Imports `AnimatedContent`. Preserves existing `PlannerViewProps` interface.
- **VoiceConsoleView.tsx**: Imports `motion` from framer-motion for mic button animation. Imports `AnimatedContent` for section reveals. Preserves existing props interface.
- **TelemetryView.tsx**: Imports `AnimatedContent`. Preserves existing `TelemetryViewProps` interface.

## Data Models

### Existing Types (Unchanged)

The following types from `@studymate/types` are used by the views and are not modified by the redesign:

```typescript
// From @studymate/types (existing, unchanged)
interface Task {
  id: number;
  title: string;
  course_name: string;
  course_code?: string;
  due_date?: string;
  est_minutes?: number;
  priority: TaskPriority; // 'high' | 'medium' | 'low'
  status: TaskStatus;     // 'pending' | 'in_progress' | 'done'
}

interface Course {
  id: number;
  name: string;
  code?: string;
}

interface CourseProgress {
  course_id: number;
  course_name: string;
  course_code?: string;
  completed_pct: number;
}

interface StudyPlan {
  summary: string;
  blocks: StudyBlock[];
}
```

### New Data Models

```typescript
// Product showcase carousel slide
interface ShowcaseSlide {
  title: string;
  description: string;
  image: string;
  accentColor?: string;
}

// Customer testimonial
interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  fullQuote?: string;
}

// News/blog card
interface NewsCard {
  title: string;
  description: string;
  link: string;
  date?: string;
}

// Aurora background configuration
interface AuroraConfig {
  colors: string[];
  blobCount: number;
  duration: number;
}
```

### Default Data Values

The new landing page sections use static demo data defined in their respective component files:

```typescript
// ProductShowcaseSection default slides
const DEFAULT_SLIDES: ShowcaseSlide[] = [
  { title: 'Academic Hub', description: 'Daily coursework overview', image: 'dashboard-mockup', accentColor: '#E5A952' },
  { title: 'Assignments Desk', description: 'Kanban task management', image: 'assignments-mockup', accentColor: '#3B82F6' },
  { title: 'Pomodoro Planner', description: 'Focus timer & AI schedule', image: 'planner-mockup', accentColor: '#10B981' },
  { title: 'Voice Console', description: 'Alexa+ conversational agent', image: 'voice-mockup', accentColor: '#8B5CF6' },
];

// TestimonialsSection default testimonials
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: 'Sarah Chen', role: 'CS Major, MIT', image: 'sarah-avatar', quote: 'StudyMate transformed my study routine...', fullQuote: 'StudyMate transformed my study routine. The Pomodoro integration keeps me focused...' },
  { name: 'Marcus Johnson', role: 'Pre-Med, UCLA', image: 'marcus-avatar', quote: 'The voice assistant is a game-changer...', fullQuote: 'The voice assistant is a game-changer for quick task management between classes...' },
];

// NewsCardsSection default cards
const DEFAULT_NEWS_CARDS: NewsCard[] = [
  { title: 'MCP Protocol 2025-11-25', description: 'Streamable HTTP support and Alexa+ integration updates', link: '#', date: 'Nov 25, 2025' },
  { title: 'Pomodoro Science', description: 'How timed intervals improve deep focus retention', link: '#', date: 'Nov 18, 2025' },
  { title: 'Data Sovereignty', description: 'Why offline-first SQLite beats cloud surveillance', link: '#', date: 'Nov 10, 2025' },
];
```

## Testing Strategy

### Dual Testing Approach

The redesign uses both property-based tests and example-based unit tests:

**Property-Based Tests (PBT)**:
- Validate universal properties across many generated inputs (minimum 100 iterations per property test).
- Focus on pure component logic: pointer tracking math, character splitting, count-up animation, reduced-motion behavior.
- Use framer-motion's test utilities or mock `useInView` / `useMotionValue` where viewport or motion value interactions need to be simulated.
- Each property test references its design document property number.

**Unit / Example Tests**:
- Verify specific scenarios: hover-to-pause carousel, accordion expand/collapse, theme toggle without reload, component renders with expected Tailwind classes.
- Verify integration points: DashboardView renders TiltedCard for KPIs, Sidebar renders BorderGlow for active item, Header uses ShinyText for brand name.
- Verify edge cases: empty string for SplitText, zero target for CountUp, single testimonial card.

**Smoke Tests**:
- Verify build completes without TypeScript errors.
- Verify framer-motion dependency is present in package.json.
- Verify all 10 component files exist with correct imports.
- Verify `useReducedMotion` is imported in all 10 component files.

### Test File Locations

```
apps/web/src/components/animated/__tests__/
├── SpotlightCard.test.tsx
├── TiltedCard.test.tsx
├── AnimatedContent.test.tsx
├── ScrollVelocity.test.tsx
├── GradualBlur.test.tsx
├── BorderGlow.test.tsx
├── ShinyText.test.tsx
├── BlurText.test.tsx
├── SplitText.test.tsx
├── CountUp.test.tsx
└── AuroraBackground.test.tsx

apps/web/src/views/landing/__tests__/
├── ProductShowcaseSection.test.tsx
├── TestimonialsSection.test.tsx
└── NewsCardsSection.test.tsx
```

### Property Test Configuration

- Minimum 100 iterations per property test (due to randomization).
- Each property test tagged with: `Feature: frontend-redesign, Property {number}: {property_text}`.
- Mock `IntersectionObserver` for `useInView`-based components.
- Mock `matchMedia` for `useReducedMotion` tests.
- Use `@testing-library/react` for rendering components in tests.

---

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: SpotlightCard pointer tracking

*For any* pointer position within the card's bounding box, the `SpotlightCard` component's spotlight gradient center SHALL match the pointer's x and y coordinates relative to the card.

**Validates: Requirements 2.1**

### Property 2: TiltedCard rotation proportional to cursor offset

*For any* cursor position relative to the card center, the `TiltedCard` component's `rotateX` and `rotateY` values SHALL be proportional to the cursor's offset from center, with the correct sign direction (cursor above center tilts the top toward the viewer, cursor left of center tilts the left side toward the viewer).

**Validates: Requirements 2.2**

### Property 3: ScrollVelocity proportional speed

*For any* page scroll velocity value, the `ScrollVelocity` component's horizontal translate output SHALL be proportional to the scroll velocity multiplied by the velocity multiplier, combined with the base speed for a constant baseline motion.

**Validates: Requirements 2.4**

### Property 4: BorderGlow cursor perimeter tracking

*For any* cursor position around the element's bounding box, the `BorderGlow` component's glow offset SHALL correspond to the cursor's position along the element perimeter, tracking the cursor direction.

**Validates: Requirements 2.6**

### Property 5: BlurText resolves to sharp

*For any* text string and any valid configuration (duration, delay, blur amount), the `BlurText` component SHALL start in a blurred state with `filter: blur(blurAmount)` and `opacity: 0`, and after the animation completes SHALL reach `filter: blur(0)` and `opacity: 1`.

**Validates: Requirements 2.8**

### Property 6: SplitText character span count

*For any* input string of length N (including spaces and special characters), the `SplitText` component SHALL render exactly N character spans, each with a stagger delay equal to `index * staggerInterval + delay`.

**Validates: Requirements 2.9**

### Property 7: CountUp target accuracy

*For any* start value and target value, after the `CountUp` animation completes, the displayed numeric value SHALL equal the target value, formatted with the specified decimals, prefix, and suffix.

**Validates: Requirements 2.10**

### Property 8: Hero heading animation duration within range

*For any* rendering of the Landing_Page hero heading, the `BlurText` component SHALL use a duration between 800ms and 1500ms, and the `SplitText` component SHALL use a per-character delay between 20ms and 60ms.

**Validates: Requirements 3.2, 3.3**

### Property 9: Hero stats bar count and start value

*For any* rendering of the Landing_Page hero section, the stats bar SHALL render at least three `CountUp` components, each with a start value of zero, counting up to their respective target values when the stats bar enters the viewport.

**Validates: Requirements 3.4**

### Property 10: Landing page section reveal coverage

*For any* section on the Landing_Page (both existing and new), the section SHALL be wrapped in the `AnimatedContent` component with a slide-up and fade-in transition, triggering a reveal animation when the section enters the viewport.

**Validates: Requirements 3.6, 4.9**

### Property 11: Product showcase auto-scroll interval within range

*For any* rendering of the product showcase carousel, the auto-scroll interval SHALL be between 3000ms and 6000ms per card advance.

**Validates: Requirements 4.1**

### Property 12: Testimonial card required fields

*For any* testimonial card in the customer stories section, the card SHALL contain a customer image, a name, and a quote, and the section SHALL render at least two such cards.

**Validates: Requirements 4.4**

### Property 13: News card count and required fields

*For any* rendering of the news and blog cards section, the section SHALL render between 3 and 4 cards, and each card SHALL contain a title, a description, a blue gradient background, and an arrow link button.

**Validates: Requirements 4.6**

### Property 14: Existing landing section order preservation

*For any* rendering of the Landing_Page, the existing sections (Hero/Workstation, MCP Protocol, Voice Lab, Architecture, Scholar Preview, CTA, Footer) SHALL appear in the same relative order as before the redesign, with new sections inserted between them without removing or reordering existing content.

**Validates: Requirements 4.8**

### Property 15: Sidebar nav icon glass treatment

*For any* navigation item in the Sidebar, the icon container SHALL have a glass-style treatment with backdrop blur, a translucent background, and a scale-on-hover effect applied.

**Validates: Requirements 5.2**

### Property 16: Header screen transition duration within range

*For any* screen switch in the Inner_App, the Header screen title and subtitle SHALL transition with a framer-motion animation (fade or slide) with a duration between 200ms and 500ms.

**Validates: Requirements 5.5**

### Property 17: Inner view section reveal coverage

*For any* major section within any Inner_App view (Dashboard, Assignments, Planner, Voice Console, Telemetry), the section SHALL be wrapped in the `AnimatedContent` component with a configurable slide and fade transition, triggering a reveal animation when the section enters the viewport.

**Validates: Requirements 6.1, 6.5, 6.7**

### Property 18: Assignments list row staggered spring entrance

*For any* set of task rows in the Assignments list mode, each row SHALL have a spring entrance animation with a stagger delay proportional to its index, using framer-motion's `AnimatePresence` or layout animations.

**Validates: Requirements 6.4**

### Property 19: Voice Console mic button active vs idle state

*For any* state of the Voice Console microphone button, when listening is active the button SHALL display a pulsing or scaling animation, and when listening is inactive the button SHALL display a calm idle state with no pulsing animation.

**Validates: Requirements 6.6**

### Property 20: Reduced motion renders final state

*For any* animated component in the StudyMate application, when the browser reports `prefers-reduced-motion: reduce` (or when `disableAnimations` is true for `AnimatedContent`), the component SHALL render its content in the final visible state without transition delays, blur, offset, or opacity changes.

**Validates: Requirements 8.1, 8.2**

### Property 21: Landing page color palette consistency

*For any* section on the Landing_Page (existing or new), the section SHALL use the `#07090E` background color and `#E5A952` gold accent colors, maintaining the dark editorial aesthetic.

**Validates: Requirements 7.1**
