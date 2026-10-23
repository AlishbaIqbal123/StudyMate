# Implementation Plan: Frontend Redesign

## Overview

This plan covers the full frontend redesign of the StudyMate web application: adding framer-motion as a dependency, building a library of 11 reusable animated components (10 ReactBits-inspired + AuroraBackground), constructing 3 new landing page sections, enhancing StudyMateHero.tsx with kinetic text and animated backgrounds, redesigning the app shell (Sidebar + Header), applying scroll-triggered reveals and view-specific animations across all 5 inner views, and wiring up barrel exports for clean imports. All components use framer-motion and TailwindCSS with no external packages beyond framer-motion. The design preserves existing color palettes, layout structures, and functional behavior.

## Tasks

- [x] 1. Set up framer-motion dependency and test infrastructure
  - [x] 1.1 Add framer-motion and testing dependencies, configure Vitest
    - Add `framer-motion@^11.0.0` to `apps/web/package.json` under `dependencies`
    - Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@testing-library/user-event` to `devDependencies`
    - Add vitest configuration to `apps/web/vite.config.ts` (test environment: jsdom)
    - Add `test` script to `apps/web/package.json` (`vitest --run`)
    - Run `npm install` in the workspace root
    - Verify `npm run build` completes without TypeScript errors related to framer-motion
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Build animated component library in `apps/web/src/components/animated/`
  - [x] 2.1 Create SpotlightCard component
    - Implement pointer-tracking radial spotlight gradient using `useMotionValue` and `useMotionTemplate`
    - Props: `children`, `className`, `spotlightRadius` (default 200), `spotlightColor` (default `rgba(255,255,255,0.15)`), `backgroundColor` (default transparent)
    - On `onMouseMove`, compute pointer position relative to card bounding rect, update motion values
    - Render `motion.div` with background via `useMotionTemplate` and `maskImage` to confine spotlight
    - Call `useReducedMotion()` — when true, render static card without spotlight overlay
    - Export `SpotlightCard` and `SpotlightCardProps` interface
    - _Requirements: 2.1, 2.11, 2.12, 8.3_

  - [ ]* 2.2 Write property test for SpotlightCard pointer tracking
    - **Property 1: SpotlightCard pointer tracking — for any pointer position within the card's bounding box, the spotlight gradient center SHALL match the pointer's x and y coordinates relative to the card**
    - **Validates: Requirements 2.1**

  - [x] 2.3 Create TiltedCard component
    - Implement 3D rotateX/rotateY toward cursor using `useMotionValue` wrapped in `useSpring` for smooth physics
    - Props: `children`, `className`, `tiltMaxAngle` (default 8), `showGlare` (default true), `glareOpacity` (default 0.25)
    - On `onMouseMove`, compute cursor offset from card center as fraction (-1 to 1), multiply by `tiltMaxAngle`
    - Glare overlay: absolute-positioned `motion.div` with linear-gradient shifting based on cursor position
    - Call `useReducedMotion()` — when true, render children with no 3D transform
    - Export `TiltedCard` and `TiltedCardProps` interface
    - _Requirements: 2.2, 2.11, 2.12, 8.3_

  - [ ]* 2.4 Write property test for TiltedCard rotation proportionality
    - **Property 2: TiltedCard rotation proportional to cursor offset — for any cursor position relative to card center, rotateX/rotateY SHALL be proportional to the offset with correct sign direction**
    - **Validates: Requirements 2.2**

  - [x] 2.5 Create AnimatedContent component
    - Implement scroll-triggered reveal using `useInView` with configurable `rootMargin`
    - Props: `children`, `className`, `direction` (default `up`), `distance` (default 40), `blur` (default 0), `fadeIn` (default true), `duration` (default 0.5), `delay` (default 0), `rootMargin` (default `-50px`), `once` (default true), `disableAnimations` (default false)
    - Define `Variants` for hidden/visible states based on direction, distance, blur, fadeIn
    - When `useReducedMotion()` returns true OR `disableAnimations` is true, render children directly in visible state
    - Export `AnimatedContent` and `AnimatedContentProps` interface
    - _Requirements: 2.3, 2.11, 2.12, 8.2, 8.3_

  - [x] 2.6 Create ScrollVelocity component
    - Implement horizontal marquee whose speed is proportional to page scroll velocity
    - Use `useScroll()`, `useVelocity()` on scroll Y, `useTransform` to map velocity to X translate, combined with `baseSpeed` baseline
    - Props: `text`, `className`, `baseSpeed` (default 50), `velocityMultiplier` (default 0.1), `fontSize` (default `2rem`)
    - Wrap text in `motion.div` with `repeat: Infinity` animation modulated by `useTransform` output
    - Call `useReducedMotion()` — when true, render text statically with no horizontal motion
    - Export `ScrollVelocity` and `ScrollVelocityProps` interface
    - _Requirements: 2.4, 2.11, 2.12, 8.3_

  - [ ]* 2.7 Write property test for ScrollVelocity proportional speed
    - **Property 3: ScrollVelocity proportional speed — for any page scroll velocity, the horizontal translate output SHALL be proportional to scroll velocity × velocityMultiplier plus baseSpeed baseline**
    - **Validates: Requirements 2.4**

  - [x] 2.8 Create GradualBlur component
    - Implement progressive blur gradient mask using CSS `mask-image` with linear gradient and `filter: blur()`
    - Props: `children`, `className`, `direction` (default `bottom`), `blurAmount` (default 12), `transitionZone` (default `100px`)
    - Direction controls gradient orientation (`to bottom`, `to top`, `to left`, `to right`)
    - Call `useReducedMotion()` — when true, render children with no blur filter
    - Export `GradualBlur` and `GradualBlurProps` interface
    - _Requirements: 2.5, 2.11, 2.12, 8.3_

  - [x] 2.9 Create BorderGlow component
    - Implement cursor-tracking glowing border using `useMotionValue` for mouseX/mouseY and `useMotionTemplate` for radial-gradient glow
    - Props: `children`, `className`, `glowColor` (default `rgba(99,102,241,0.6)`), `glowRadius` (default 300), `borderRadius` (default `1rem`)
    - On `onMouseMove`, update motion values with cursor position relative to element
    - Use `overflow: hidden` and `maskImage` to clip glow to element border
    - Call `useReducedMotion()` — when true, render static border without cursor-tracking glow
    - Export `BorderGlow` and `BorderGlowProps` interface
    - _Requirements: 2.6, 2.11, 2.12, 8.3_

  - [ ]* 2.10 Write property test for BorderGlow cursor perimeter tracking
    - **Property 4: BorderGlow cursor perimeter tracking — for any cursor position around the element's bounding box, the glow offset SHALL correspond to the cursor's position along the element perimeter**
    - **Validates: Requirements 2.6**

  - [x] 2.11 Create ShinyText component
    - Implement sweeping sheen using `motion.span` with `background-image` linear-gradient and `background-clip: text`
    - Props: `text`, `className`, `duration` (default 3), `trigger` (default `loop`, option `hover`), `sheenColor` (default `rgba(255,255,255,0.8)`), `textColor` (default `inherit`)
    - For `trigger: 'loop'`, animate `backgroundPosition` with `repeat: Infinity`. For `trigger: 'hover'`, use `whileHover`
    - Call `useReducedMotion()` — when true, render text with static gradient (no animation)
    - Export `ShinyText` and `ShinyTextProps` interface
    - _Requirements: 2.7, 2.11, 2.12, 8.3_

  - [x] 2.12 Create BlurText component
    - Implement blur-to-sharp text animation using framer-motion `animate` function with `filter: blur()`
    - Props: `text`, `className`, `duration` (default 1000ms), `delay` (default 0), `blurAmount` (default 20), `animateOnView` (default false), `rootMargin` (default `-50px`)
    - Initial state: `filter: blur(blurAmount)`, `opacity: 0`. Final state: `filter: blur(0)`, `opacity: 1`
    - When `animateOnView` is true, use `useInView` to trigger; otherwise animate on mount
    - Call `useReducedMotion()` — when true, render text immediately with no blur and full opacity
    - Export `BlurText` and `BlurTextProps` interface
    - _Requirements: 2.8, 2.11, 2.12, 8.3_

  - [ ]* 2.13 Write property test for BlurText resolves to sharp
    - **Property 5: BlurText resolves to sharp — for any text string and configuration, BlurText SHALL start with blur(blurAmount)/opacity 0 and reach blur(0)/opacity 1 after animation completes**
    - **Validates: Requirements 2.8**

  - [x] 2.14 Create SplitText component
    - Split string into individual character spans with staggered entrance animation
    - Props: `text`, `className`, `direction` (default `up`), `staggerInterval` (default 40ms), `easing` (default `easeOut`), `charDuration` (default 400ms), `delay` (default 0)
    - Render each character as `motion.span` with `Variants` for hidden/visible states
    - Parent `motion.span` uses `staggerChildren: staggerInterval / 1000` and `delayChildren: delay / 1000`
    - Each child delay: `index * staggerInterval + delay`. Spaces render as non-breaking spaces
    - Call `useReducedMotion()` — when true, render all characters in final visible state with no stagger
    - Export `SplitText` and `SplitTextProps` interface
    - _Requirements: 2.9, 2.11, 2.12, 8.3_

  - [ ]* 2.15 Write property test for SplitText character span count
    - **Property 6: SplitText character span count — for any input string of length N, SplitText SHALL render exactly N character spans, each with stagger delay equal to index × staggerInterval + delay**
    - **Validates: Requirements 2.9**

  - [ ] 2.16 Create CountUp component
    - Implement animated numeric counter using `useMotionValue`, `animate()`, and `useInView`
    - Props: `to`, `from` (default 0), `className`, `duration` (default 2s), `delay` (default 0), `decimals` (default 0), `prefix` (default `''`), `suffix` (default `''`), `animateOnView` (default true), `rootMargin` (default `-50px`)
    - Use `useMotionValue(from)` and `animate()` to tween to `to`. Subscribe via `.on('change', ...)` to update React state with formatted number
    - Call `useReducedMotion()` — when true, display target value `to` immediately with no animation
    - Export `CountUp` and `CountUpProps` interface
    - _Requirements: 2.10, 2.11, 2.12, 8.3_

  - [ ]* 2.17 Write property test for CountUp target accuracy
    - **Property 7: CountUp target accuracy — for any start value and target value, after animation completes the displayed value SHALL equal the target value, formatted with specified decimals, prefix, and suffix**
    - **Validates: Requirements 2.10**

  - [~] 2.18 Create AuroraBackground component
    - Render multiple `motion.div` blobs positioned absolutely with radial-gradient backgrounds
    - Props: `className`, `colors` (default aurora palette with gold/blue/green), `blobCount` (default 3), `duration` (default 15s)
    - Each blob animates `x`, `y`, `scale`, `opacity` in infinite loop with staggered delays
    - Container: `pointer-events: none`, low `z-index` (z-0) to sit behind hero content
    - Call `useReducedMotion()` — when true, render static gradient blobs with no motion
    - Export `AuroraBackground` and `AuroraBackgroundProps` interface
    - _Requirements: 3.1, 8.3_

  - [ ]* 2.19 Write property test for reduced motion across all animated components
    - **Property 20: Reduced motion renders final state — for any animated component, when prefers-reduced-motion: reduce is active, the component SHALL render content in final visible state without transition delays, blur, offset, or opacity changes**
    - **Validates: Requirements 8.1, 8.2**

  - [ ]* 2.20 Write unit tests for animated component library
    - Test edge cases: empty string for SplitText, zero target for CountUp, empty children for SpotlightCard
    - Test prop defaults and TypeScript prop interfaces resolve correctly
    - Verify all 11 component files import `useReducedMotion` from framer-motion
    - Mock `IntersectionObserver` for `useInView`-based components (AnimatedContent, BlurText, CountUp)
    - Mock `matchMedia` for `useReducedMotion` tests
    - _Requirements: 2.11, 2.12, 8.1, 8.2, 8.3_

- [~] 3. Checkpoint — Ensure animated component library compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Build new landing page sections in `apps/web/src/views/landing/`
  - [~] 4.1 Create ProductShowcaseSection component
    - Implement horizontally scrolling carousel of rounded cards displaying app screen images/mockups
    - Auto-scroll via `setInterval` with 4000ms interval (within 3000–6000ms range)
    - On `onMouseEnter`, clear interval to pause. On `onMouseLeave`, restart interval
    - Use framer-motion `AnimatePresence` with `mode="wait"` for smooth card transitions
    - Define `ShowcaseSlide` interface: `title`, `description`, `image`, `accentColor?`
    - Include `DEFAULT_SLIDES` array with 4 demo slides (Academic Hub, Assignments Desk, Pomodoro Planner, Voice Console)
    - Styled with dark editorial aesthetic: `#07090E` background, `#E5A952` gold accents, white text
    - Wrapped in `<AnimatedContent direction="up" fadeIn duration={0.6}>`
    - Export `ProductShowcaseSection`, `ProductShowcaseSectionProps`, `ShowcaseSlide`
    - _Requirements: 4.1, 4.2, 4.3, 4.8, 4.9_

  - [ ]* 4.2 Write property test for ProductShowcaseSection auto-scroll interval
    - **Property 11: Product showcase auto-scroll interval within range — for any rendering, the auto-scroll interval SHALL be between 3000ms and 6000ms per card advance**
    - **Validates: Requirements 4.1**

  - [~] 4.3 Create TestimonialsSection component
    - Render at least two testimonial cards, each with customer image, name, and quote
    - Implement accordion-style layout: clicking a card expands to reveal full quote, collapses others
    - Use `useState` for active index, framer-motion `AnimatePresence` and `layout` animations for expand/collapse
    - Define `Testimonial` interface: `name`, `role`, `image`, `quote`, `fullQuote?`
    - Include `DEFAULT_TESTIMONIALS` array with 2 demo testimonials
    - Styled with dark editorial aesthetic: `#07090E` background, `#E5A952` gold accents
    - Wrapped in `<AnimatedContent direction="up" fadeIn duration={0.6}>`
    - Export `TestimonialsSection`, `TestimonialsSectionProps`, `Testimonial`
    - _Requirements: 4.4, 4.5, 4.8, 4.9_

  - [ ]* 4.4 Write property test for TestimonialsSection required fields
    - **Property 12: Testimonial card required fields — for any testimonial card, the card SHALL contain a customer image, name, and quote, and the section SHALL render at least two such cards**
    - **Validates: Requirements 4.4**

  - [~] 4.5 Create NewsCardsSection component
    - Render between 3 and 4 cards, each with title, description, blue gradient background, and arrow link button
    - Blue gradient background: `bg-gradient-to-br from-blue-600/20 to-indigo-600/10`
    - Arrow link button: `<a>` or `<button>` with `onClick` navigating to `link` URL
    - Use framer-motion `whileHover` for subtle scale/translate effect on each card
    - Define `NewsCard` interface: `title`, `description`, `link`, `date?`
    - Include `DEFAULT_NEWS_CARDS` array with 3 demo cards
    - Wrapped in `<AnimatedContent direction="up" fadeIn duration={0.6}>`
    - Export `NewsCardsSection`, `NewsCardsSectionProps`, `NewsCard`
    - _Requirements: 4.6, 4.7, 4.8, 4.9_

  - [ ]* 4.6 Write property test for NewsCardsSection card count and fields
    - **Property 13: News card count and required fields — for any rendering, the section SHALL render between 3 and 4 cards, each with a title, description, blue gradient background, and arrow link button**
    - **Validates: Requirements 4.6**

- [ ] 5. Enhance StudyMateHero.tsx with animated hero, stats bar, marquee, and new sections
  - [~] 5.1 Add AuroraBackground, BlurText, SplitText, and CountUp to hero section
    - Import `AuroraBackground`, `BlurText`, `SplitText`, `CountUp` from animated components
    - Render `<AuroraBackground>` as first child inside hero section, positioned absolutely behind content with `z-0`
    - Replace the `<h1>` heading text with `<BlurText>` (duration=1200ms, animateOnView=false) composed with `<SplitText>` (staggerInterval=40ms, direction=`up`)
    - Add CountUp stats bar below hero heading, before button group: 3 CountUp components ("5 MCP Tools", "100% Sovereign", "0 Surveillance pixels"), each with animateOnView=true, from=0
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [~] 5.2 Add ScrollVelocity marquee section after hero
    - Import `ScrollVelocity` from animated components
    - Insert `<ScrollVelocity>` section immediately after hero section and before MCP Protocol Showcase (section 3)
    - Text: "DEEP FOCUS · POMODORO · MCP PROTOCOL · ALEXA+ · SOVEREIGN DATA"
    - _Requirements: 3.5_

  - [~] 5.3 Wrap existing landing page sections in AnimatedContent and insert new sections
    - Import `AnimatedContent`, `ProductShowcaseSection`, `TestimonialsSection`, `NewsCardsSection`
    - Wrap each existing section (Voice Simulator, MCP Tools, Student Personas, Architecture, CTA, Footer) in `<AnimatedContent direction="up" fadeIn duration={0.6} once={true}>` at the outermost section element level, preserving existing section IDs and content
    - Insert `<ProductShowcaseSection>` after Voice Studio Sandbox (section 4), before Architecture (section 5)
    - Insert `<TestimonialsSection>` after Architecture (section 5), before Scholar Preview Pass (section 6)
    - Insert `<NewsCardsSection>` after Scholar Preview Pass (section 6), before CTA (section 7)
    - Ensure existing sections appear in the same relative order with new sections inserted between them
    - _Requirements: 3.6, 4.8, 4.9, 7.1_

  - [ ]* 5.4 Write property test for hero heading animation duration range
    - **Property 8: Hero heading animation duration within range — BlurText SHALL use duration between 800ms and 1500ms, SplitText SHALL use per-character delay between 20ms and 60ms**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 5.5 Write property test for hero stats bar count and start value
    - **Property 9: Hero stats bar count and start value — the stats bar SHALL render at least three CountUp components, each with a start value of zero, counting up to target values when scrolled into view**
    - **Validates: Requirements 3.4**

  - [ ]* 5.6 Write property test for landing page section reveal coverage
    - **Property 10: Landing page section reveal coverage — for any section on the Landing_Page (existing or new), the section SHALL be wrapped in AnimatedContent with slide-up and fade-in transition**
    - **Validates: Requirements 3.6, 4.9**

  - [ ]* 5.7 Write property test for existing landing section order preservation
    - **Property 14: Existing landing section order preservation — existing sections SHALL appear in the same relative order, with new sections inserted between them without removing or reordering existing content**
    - **Validates: Requirements 4.8**

  - [ ]* 5.8 Write property test for landing page color palette consistency
    - **Property 21: Landing page color palette consistency — for any section on the Landing_Page, the section SHALL use #07090E background and #E5A952 gold accent colors**
    - **Validates: Requirements 7.1**

- [~] 6. Checkpoint — Ensure landing page enhancements compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Redesign app shell (Sidebar + Header animations)
  - [~] 7.1 Add entrance animation, icon glass treatment, and BorderGlow to Sidebar.tsx
    - Import `AnimatedContent` and `BorderGlow` from animated components
    - Wrap outer `<aside>` element in `<AnimatedContent direction="left" fadeIn duration={0.5} once={true}>` for slide-from-left entrance
    - Add glass-style Tailwind classes to each nav item icon container: `backdrop-blur-md bg-white/5 dark:bg-white/10 border border-white/10`
    - Add framer-motion `whileHover={{ scale: 1.1 }}` to each icon container for scale-on-hover
    - When a nav item is active (`isActive` is true), wrap it in `<BorderGlow>` with glowColor matching active accent (`rgba(99,102,241,0.5)` light, `rgba(34,211,238,0.5)` dark)
    - Preserve all existing SidebarProps, navigation items, and behavior
    - _Requirements: 5.1, 5.2, 5.3, 7.2, 7.3_

  - [ ]* 7.2 Write property test for Sidebar nav icon glass treatment
    - **Property 15: Sidebar nav icon glass treatment — for any navigation item, the icon container SHALL have backdrop blur, translucent background, and scale-on-hover effect**
    - **Validates: Requirements 5.2**

  - [~] 7.3 Add ShinyText brand name and screen transition animation to Header.tsx
    - Import `ShinyText` from animated components, `motion` and `AnimatePresence` from framer-motion
    - Replace brand name text "studymate" in the header with `<ShinyText>` using `trigger="loop"` and `duration={4}`
    - Wrap screen title and subtitle area in `<motion.div>` with `key={activeScreen}` and `<AnimatePresence>` to trigger re-animation on screen switch
    - Transition: `initial={{ opacity: 0, y: 10 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, y: -10 }}` with `duration={0.3}` (300ms, within 200–500ms range)
    - Preserve all existing HeaderProps, screen titles, and action buttons
    - _Requirements: 5.4, 5.5, 7.2, 7.3_

  - [ ]* 7.4 Write property test for Header screen transition duration range
    - **Property 16: Header screen transition duration within range — for any screen switch, the Header screen title and subtitle SHALL transition with a duration between 200ms and 500ms**
    - **Validates: Requirements 5.5**

- [ ] 8. Enhance inner views with scroll reveals and view-specific animations
  - [~] 8.1 Enhance DashboardView.tsx with TiltedCard, SpotlightCard, and AnimatedContent
    - Import `TiltedCard`, `SpotlightCard`, `AnimatedContent` from animated components
    - Wrap each KPI card in `<TiltedCard tiltMaxAngle={8} showGlare={true}>`
    - Wrap each course progress card in `<SpotlightCard spotlightColor="rgba(229,169,82,0.1)">`
    - Wrap all major sections (guest banner, hero banner, KPI row, Alexa+ assistant box, two-column layout) in `<AnimatedContent direction="up" fadeIn duration={0.5}>`
    - Preserve existing DashboardViewProps interface and functional behavior
    - _Requirements: 6.1, 6.2, 6.3, 7.2, 7.3_

  - [~] 8.2 Enhance AssignmentsView.tsx with spring entrance and AnimatedContent
    - Import `motion`, `AnimatePresence` from framer-motion, `AnimatedContent` from animated components
    - Wrap each task list row (in list mode) in `<motion.div>` with spring entrance variant: `{ opacity: 0, y: 20 }` → `{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }`
    - Parent container uses `staggerChildren: 0.05` for staggered entrance as rows appear
    - Wrap all major sections (top banner, filter bar, kanban board, list view) in `<AnimatedContent>`
    - Preserve existing AssignmentsViewProps interface and functional behavior
    - _Requirements: 6.1, 6.4, 7.2, 7.3_

  - [ ]* 8.3 Write property test for Assignments list row staggered spring entrance
    - **Property 18: Assignments list row staggered spring entrance — for any set of task rows in list mode, each row SHALL have a spring entrance animation with stagger delay proportional to its index**
    - **Validates: Requirements 6.4**

  - [~] 8.4 Enhance PlannerView.tsx with AnimatedContent wrappers
    - Import `AnimatedContent` from animated components
    - Wrap each major planner section in `<AnimatedContent direction="up" fadeIn duration={0.5}>`: top banner, focus assignment banner (conditional), timer card, AI schedule blocks, study stats tracker
    - Preserve existing PlannerViewProps interface and functional behavior
    - _Requirements: 6.1, 6.5, 7.2, 7.3_

  - [~] 8.5 Enhance VoiceConsoleView.tsx with animated mic indicator and AnimatedContent
    - Import `motion` from framer-motion, `AnimatedContent` from animated components
    - Replace mic toggle button with `motion.button`:
      - When `isListening` is true: `animate={{ scale: [1, 1.1, 1] }}` with `transition={{ repeat: Infinity, duration: 1 }}` (pulsing)
      - When `isListening` is false: `animate={{ scale: 1 }}` (calm idle state)
    - Wrap all major sections (top banner, chat canvas, prompt scenarios) in `<AnimatedContent>`
    - Preserve existing VoiceConsoleView props interface and functional behavior
    - _Requirements: 6.1, 6.6, 7.2, 7.3_

  - [ ]* 8.6 Write property test for Voice Console mic button active vs idle state
    - **Property 19: Voice Console mic button active vs idle state — when listening is active the button SHALL display pulsing/scaling animation, when inactive SHALL display calm idle state**
    - **Validates: Requirements 6.6**

  - [~] 8.7 Enhance TelemetryView.tsx with AnimatedContent wrappers
    - Import `AnimatedContent` from animated components
    - Wrap each major telemetry section in `<AnimatedContent direction="up" fadeIn duration={0.5}>`: status banner, action tester card, activity feed, database inspector
    - Preserve existing TelemetryViewProps interface and functional behavior
    - _Requirements: 6.1, 6.7, 7.2, 7.3_

  - [ ]* 8.8 Write property test for inner view section reveal coverage
    - **Property 17: Inner view section reveal coverage — for any major section within any Inner_App view, the section SHALL be wrapped in AnimatedContent with configurable slide and fade transition**
    - **Validates: Requirements 6.1, 6.5, 6.7**

- [~] 9. Checkpoint — Ensure inner view enhancements compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Wire up index exports and final integration
  - [~] 10.1 Create barrel index exports for animated component library
    - Create `apps/web/src/components/animated/index.ts` re-exporting all 11 components and their prop interfaces
    - Export: SpotlightCard, TiltedCard, AnimatedContent, ScrollVelocity, GradualBlur, BorderGlow, ShinyText, BlurText, SplitText, CountUp, AuroraBackground
    - Also export type interfaces: SpotlightCardProps, TiltedCardProps, AnimatedContentProps, etc.
    - _Requirements: 2.11, 2.12_

  - [~] 10.2 Final integration verification and build check
    - Verify all imports resolve correctly across StudyMateHero.tsx, Sidebar.tsx, Header.tsx, and all 5 view files
    - Verify `npm run build` completes without TypeScript compilation errors
    - Verify `npm run typecheck` passes with no errors
    - Verify framer-motion imports resolve at runtime without module-not-found errors
    - Verify all 10 ReactBits component files plus AuroraBackground exist with correct exports
    - _Requirements: 1.2, 1.3, 2.11, 2.12_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at three key breaks
- Property tests validate universal correctness properties from the design document (Properties 1–21)
- Unit tests validate specific examples and edge cases
- All animated components use `useReducedMotion` to respect `prefers-reduced-motion: reduce`
- All animations use hardware-accelerated CSS properties (transform, opacity, filter) — no layout-triggering properties
- The redesign is additive: existing layout structures, color palettes, and functional behavior are preserved
- Test infrastructure (Vitest + Testing Library) is set up in task 1.1 since no test framework currently exists
- The design uses TypeScript/React with framer-motion and TailwindCSS — no language selection needed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.5", "2.6", "2.8", "2.9", "2.11", "2.12", "2.14", "2.16", "2.18"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.7", "2.10", "2.13", "2.15", "2.17", "2.19", "2.20", "4.1", "4.3", "4.5", "5.1", "7.1", "7.3", "8.1", "8.2", "8.4", "8.5", "8.7", "10.1"] },
    { "id": 3, "tasks": ["4.2", "4.4", "4.6", "5.2", "7.2", "7.4", "8.3", "8.6", "8.8"] },
    { "id": 4, "tasks": ["5.3"] },
    { "id": 5, "tasks": ["5.4", "5.5", "5.6", "5.7", "5.8"] },
    { "id": 6, "tasks": ["10.2"] }
  ]
}
```
