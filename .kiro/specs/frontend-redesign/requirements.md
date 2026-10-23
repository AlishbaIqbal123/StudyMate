# Requirements Document

## Introduction

This specification covers a full frontend redesign of the StudyMate web application, encompassing the landing/showcase page, the application shell (Sidebar and Header), and all five inner views (Dashboard, Assignments, Planner, Voice Console, Telemetry). The redesign introduces framer-motion as a new dependency and adds a library of reusable ReactBits-inspired animated components built as inline implementations using framer-motion and TailwindCSS. Existing color palettes, layout structures, and functional behavior are preserved; the redesign enhances visual polish through spring physics, scroll-triggered reveals, gesture interactions, and motion-driven micro-interactions. Three new landing page sections are added: a product showcase carousel, a customer stories/testimonials section, and a news/blog cards section.

## Glossary

- **StudyMate**: The academic productivity web application being redesigned, consisting of a landing page and an inner application with five views.
- **Landing_Page**: The public-facing showcase page rendered when the active screen is `home`, displayed via the `LandingPageView` and `StudyMateHero` components, using a dark editorial aesthetic with `#07090E` background and `#E5A952` gold accents.
- **Inner_App**: The authenticated application area rendered when the active screen is `dashboard`, `assignments`, `planner`, `voice`, or `telemetry`, using a light/dark theme with blue-cyan accents, composed of the Sidebar, Header, and one of five view components.
- **App_Shell**: The persistent UI chrome of the Inner_App, consisting of the Sidebar navigation and the Header bar, wrapping the dynamic main content area.
- **Sidebar**: The left-side navigation component (`Sidebar.tsx`) providing screen switching, profile dropdown, theme toggle, Alexa+ linking, and voice console trigger.
- **Header**: The top bar component (`Header.tsx`) displaying the current screen title, profile switcher, quick actions, theme toggle, and server health status.
- **framer-motion**: The React animation library to be added as a dependency in `apps/web/package.json`, providing spring physics, gesture handling, scroll-triggered animations, and layout animations.
- **ReactBits_Components**: A set of ten reusable animated UI components inspired by the ReactBits design library, implemented inline using framer-motion and TailwindCSS with no external npm packages beyond framer-motion.
- **SpotlightCard**: A card component that renders a soft radial spotlight gradient that follows the pointer position across the card surface.
- **TiltedCard**: A card component that applies a 3D tilt transformation toward the cursor position with an optional glare overlay effect.
- **AnimatedContent**: A wrapper component that reveals child content on scroll or mount using configurable blur, slide, and fade transitions driven by framer-motion's `useInView` hook.
- **ScrollVelocity**: A horizontal text marquee component whose scroll speed increases proportionally to the page scroll velocity, using framer-motion's `useScroll` and `useVelocity` hooks.
- **GradualBlur**: A component that applies a progressive edge blur gradient to headers or section boundaries, creating a soft visual transition between content regions.
- **BorderGlow**: A component that renders a glowing border whose glow position follows the cursor direction along the element perimeter.
- **ShinyText**: A text component that displays a sheen of light that sweeps across the text surface on a loop or on hover.
- **BlurText**: A text component that starts in a blurred state and resolves to sharp text on mount or when scrolled into view.
- **SplitText**: A text component that animates characters with a staggered entrance, splitting the text into individual character spans with sequential motion delays.
- **CountUp**: A numeric counter component that animates from zero (or a configurable start value) to a target value on mount or scroll-into-view, using framer-motion's `useMotionValue` and `animate` functions.
- **Dashboard_View**: The `DashboardView` component, the primary inner view showing KPI cards, course progress, pending tasks, Alexa+ assistant box, and a quick Pomodoro timer.
- **Assignments_View**: The `AssignmentsView` component, supporting Kanban and list modes with drag-and-drop task management across To Do, In Progress, and Completed columns.
- **Planner_View**: The `PlannerView` component, featuring a large Pomodoro timer, mode tabs (focus/break), duration presets, and an AI-generated study schedule.
- **Voice_Console_View**: The `VoiceConsoleView` component, providing a conversational chat interface with the Alexa+ assistant, microphone input, TTS readback, and sample prompt scenarios.
- **Telemetry_View**: The `TelemetryView` component, providing MCP action testing, server health metrics, database inspection tabs, and an activity feed.
- **Aurora_Background**: An animated background effect applied to the landing page hero, rendering flowing gradient or particle visuals using framer-motion animations.
- **Reduced_Motion**: A browser-level user preference (`prefers-reduced-motion: reduce`) that, when active, signals the application to minimize or disable non-essential animations.

## Requirements

### Requirement 1: Animation Library Integration

**User Story:** As a developer, I want framer-motion added as a project dependency, so that I can build spring-physics animations, scroll reveals, and gesture interactions across the StudyMate frontend.

#### Acceptance Criteria

1. THE `apps/web/package.json` SHALL include `framer-motion` as a production dependency with a pinned version compatible with React 18.
2. WHEN the `apps/web` workspace is built via `npm run build`, THE build process SHALL complete without TypeScript compilation errors related to framer-motion imports.
3. WHEN any StudyMate component imports from `framer-motion`, THE imported APIs SHALL resolve at runtime without module-not-found errors.

### Requirement 2: ReactBits Animated Component Library

**User Story:** As a developer, I want a library of reusable animated components inspired by ReactBits, so that I can apply consistent motion design patterns across the landing page, app shell, and inner views without introducing external animation packages.

#### Acceptance Criteria

1. THE StudyMate codebase SHALL include a `SpotlightCard` component that renders a radial spotlight gradient tracking the pointer position within the card bounds, implemented using framer-motion's `useMotionValue` and `useMotionTemplate` hooks.
2. THE StudyMate codebase SHALL include a `TiltedCard` component that applies a 3D rotateX/rotateY transform toward the cursor using framer-motion's `useMotionValue` for rotation and `useSpring` for smooth physics, with an optional glare overlay layer.
3. THE StudyMate codebase SHALL include an `AnimatedContent` wrapper component that triggers a configurable reveal animation (blur, slide-up, fade-in, or combination) when child content enters the viewport, using framer-motion's `useInView` hook with a configurable root margin.
4. THE StudyMate codebase SHALL include a `ScrollVelocity` component that renders horizontally scrolling text whose speed is proportional to the page scroll velocity, implemented using framer-motion's `useScroll`, `useVelocity`, and `useTransform` hooks.
5. THE StudyMate codebase SHALL include a `GradualBlur` component that applies a progressive blur gradient mask to a content region, creating a soft fade transition at element edges using CSS mask-image or framer-motion blur filters.
6. THE StudyMate codebase SHALL include a `BorderGlow` component that renders a glowing border whose glow position tracks the cursor along the element perimeter, using framer-motion motion values for the glow offset.
7. THE StudyMate codebase SHALL include a `ShinyText` component that animates a light sheen sweeping across text content, implemented using a framer-motion-animated gradient or translateX overlay with a configurable duration and trigger (hover or loop).
8. THE StudyMate codebase SHALL include a `BlurText` component that starts with a blur filter applied and animates to zero blur on mount or scroll-into-view, using framer-motion's `animate` function with a configurable delay.
9. THE StudyMate codebase SHALL include a `SplitText` component that splits a string into individual character spans and applies a staggered entrance animation with configurable direction, stagger interval, and easing.
10. THE StudyMate codebase SHALL include a `CountUp` component that animates a number from a start value to a target value on mount or scroll-into-view, using framer-motion's `useMotionValue`, `animate`, and `useInView` hooks with configurable duration and formatting.
11. THE StudyMate codebase SHALL implement all ten ReactBits_Components as inline TypeScript React components using framer-motion and TailwindCSS classes, with no additional npm package dependencies beyond framer-motion.
12. EACH ReactBits_Component SHALL expose TypeScript prop interfaces for configuration (e.g., duration, delay, direction, color, className) to support reuse across landing page, app shell, and inner view contexts.

### Requirement 3: Landing Page Hero Enhancements

**User Story:** As a visitor, I want the landing page hero to feature animated backgrounds, kinetic text, and an animated stats bar, so that the page immediately conveys a modern, premium product aesthetic.

#### Acceptance Criteria

1. THE Landing_Page hero section SHALL render an Aurora_Background animated effect behind the hero content, using framer-motion animations that produce flowing gradient or particle visuals without obscuring the foreground text or buttons.
2. WHEN the Landing_Page hero heading mounts, THE heading SHALL animate using the `BlurText` component, transitioning from a blurred state to sharp text within a duration between 800ms and 1500ms.
3. WHEN the Landing_Page hero heading mounts, THE heading SHALL additionally animate using the `SplitText` component, producing a staggered character entrance with a per-character delay between 20ms and 60ms.
4. THE Landing_Page hero section SHALL render a `CountUp` stats bar displaying at least three animated numeric statistics (e.g., "5 MCP Tools", "100% Sovereign", "0 Surveillance pixels") that count up from zero to their target values when the stats bar enters the viewport.
5. THE Landing_Page SHALL include a `ScrollVelocity` text marquee section positioned after the hero section, rendering horizontally scrolling text whose speed increases proportionally to the user's scroll velocity.
6. WHEN each existing Landing_Page section (Voice Simulator, MCP Tools, Student Personas, Architecture, CTA, Footer) enters the viewport, THE section SHALL animate into view using the `AnimatedContent` wrapper component with a slide-up and fade-in transition.

### Requirement 4: New Landing Page Sections

**User Story:** As a visitor, I want the landing page to include a product showcase carousel, a customer stories section, and a news/blog cards section, so that I can discover product capabilities, read social proof, and explore latest updates.

#### Acceptance Criteria

1. THE Landing_Page SHALL include a product showcase carousel section that displays app screen images or mockups in rounded cards, auto-scrolling horizontally at an interval between 3 and 6 seconds per card advance.
2. WHEN a pointer hovers over the product showcase carousel, THE carousel SHALL pause auto-scrolling and resume auto-scrolling when the pointer leaves the carousel area.
3. THE product showcase carousel section SHALL use framer-motion layout animations or AnimatePresence for smooth card transitions between slides.
4. THE Landing_Page SHALL include a customer stories and testimonials section that renders at least two testimonial cards, each containing a customer image, a name, and a quote, styled with the dark editorial Landing_Page aesthetic (`#07090E` background, `#E5A952` gold accents).
5. THE customer stories section SHALL present testimonials in an accordion-style or expandable card layout, allowing a visitor to expand a testimonial card to reveal the full quote and collapse others.
6. THE Landing_Page SHALL include a news and blog cards section that renders between 3 and 4 cards, each displaying a title, a description, a blue gradient background, and an arrow link button.
7. WHEN a news/blog card arrow link is clicked, THE card SHALL navigate to a corresponding detail or external article link.
8. THE three new Landing_Page sections (product showcase, customer stories, news/blog cards) SHALL be inserted alongside the existing sections without removing or reordering the existing section content.
9. WHEN each new Landing_Page section enters the viewport, THE section SHALL animate into view using the `AnimatedContent` wrapper component with a slide-up and fade-in transition.

### Requirement 5: App Shell Redesign

**User Story:** As a student using the inner app, I want the Sidebar and Header to feature entrance animations, icon treatments, and smooth transitions, so that the app shell feels polished and responsive to interaction.

#### Acceptance Criteria

1. WHEN the Inner_App mounts and the Sidebar renders, THE Sidebar SHALL animate into view using the `AnimatedContent` component or an equivalent framer-motion entrance animation with a slide-from-left and fade-in transition.
2. THE Sidebar navigation items SHALL render icons with a glass-style treatment, using framer-motion or TailwindCSS to apply a subtle backdrop blur, translucent background, and scale-on-hover effect to each icon container.
3. WHEN a Sidebar navigation item is the active screen, THE active item SHALL display a `BorderGlow` effect that renders a glowing border tracking the cursor direction along the item perimeter.
4. WHEN the Header renders, THE brand name text in the Header SHALL display the `ShinyText` component, producing a light sheen that sweeps across the brand name on a loop or hover trigger.
5. WHEN the user switches between inner app screens, THE Header screen title and subtitle SHALL transition with a smooth framer-motion animation (fade or slide) with a duration between 200ms and 500ms.

### Requirement 6: Inner Views Enhancement

**User Story:** As a student navigating the inner views, I want each view to feature consistent scroll reveals and view-specific animated components, so that the application feels cohesive and visually engaging across all screens.

#### Acceptance Criteria

1. WHEN any section within any Inner_App view (Dashboard_View, Assignments_View, Planner_View, Voice_Console_View, Telemetry_View) enters the viewport, THE section SHALL animate into view using the `AnimatedContent` wrapper component with a configurable slide and fade transition.
2. THE Dashboard_View SHALL render KPI cards using the `TiltedCard` component, applying a 3D tilt toward the cursor with a glare overlay for each KPI card.
3. THE Dashboard_View SHALL render course progress cards using the `SpotlightCard` component, applying a pointer-tracking spotlight gradient to each course progress card surface.
4. THE Assignments_View SHALL render task list rows (in list mode) with a spring entrance animation, using framer-motion's `AnimatePresence` or layout animations to produce a staggered spring entrance for each task row as it appears.
5. THE Planner_View SHALL apply the `AnimatedContent` component to each major planner section (banner, timer card, AI schedule blocks, study stats tracker), triggering a reveal animation when each section enters the viewport.
6. THE Voice_Console_View SHALL render the microphone indicator with an animated pill-style treatment using framer-motion, producing a pulsing or scaling animation on the mic button when listening is active and a calm idle state when inactive.
7. THE Telemetry_View SHALL apply the `AnimatedContent` component to each data section (status banner, action tester, activity feed, database inspector), triggering a reveal animation when each section enters the viewport.

### Requirement 7: Color Palette and Theme Preservation

**User Story:** As a returning StudyMate user, I want the existing color palettes and theme behavior preserved, so that the redesign enhances motion without changing the visual identity I am familiar with.

#### Acceptance Criteria

1. THE Landing_Page SHALL retain the dark editorial aesthetic with a `#07090E` background and `#E5A952` gold accent colors for all existing and new sections.
2. THE Inner_App SHALL retain the light/dark theme system with blue-cyan accent colors, toggled via the existing theme context, for the Sidebar, Header, and all five views.
3. WHEN the user toggles the theme between light and dark mode in the Inner_App, THE animated components and framer-motion transitions SHALL respect the active theme's color tokens without requiring a full page reload.

### Requirement 8: Reduced Motion and Performance

**User Story:** As a user with vestibular sensitivity or a low-powered device, I want the application to respect my motion preferences and avoid jank, so that the animations do not cause discomfort or performance issues.

#### Acceptance Criteria

1. WHEN the browser reports `prefers-reduced-motion: reduce`, THE StudyMate application SHALL disable or minimize all non-essential framer-motion animations, rendering content in its final visible state without transition delays.
2. THE `AnimatedContent` component SHALL accept a prop to disable animations, and when reduced motion is active, SHALL render child content immediately without a scroll-triggered reveal.
3. THE ReactBits_Components SHALL use framer-motion's `useReducedMotion` hook or an equivalent check to detect the browser preference and skip animation logic when reduced motion is active.
4. WHILE framer-motion animations are running, THE StudyMate application SHALL maintain a frame rate of at least 30 frames per second on the target hardware, using hardware-accelerated CSS transforms (translate, opacity, blur) rather than layout-triggering properties.
