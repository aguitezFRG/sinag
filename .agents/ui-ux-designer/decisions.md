# UI/UX Designer — Decision Log

## 2025-04-27 — Design System Establishment & Shell Polish

### 1. Minimal color tokens limiting visual consistency
**problem** -> `globals.css` only exposed `--background` and `--foreground`, making ad-hoc Tailwind classes (`bg-blue-800`, `text-gray-600`) the only styling option across components.
**fix** -> Expanded `globals.css` with a comprehensive token system: primary (SESAM blue 50–900), secondary (teal accent), success/warning/danger semantic scales, neutral grays (0–950), surface/elevated/muted semantic tokens, border/ring tokens, typography scale, spacing, radius, and shadow tokens. Added dark mode via `prefers-color-scheme` media query and reduced-motion support.
**result** -> All shell components now reference semantic tokens, ensuring consistent theming and automatic dark-mode adaptation.

### 2. Sidebar lacked visual hierarchy and role context
**problem** -> All nav items were rendered as a flat list with no grouping; active state used hardcoded `bg-blue-800`; no mobile close affordance on overlay click backdrop; mobile menu had no `role="dialog"` or `aria-modal`.
**fix** -> Grouped nav items by logical sections (`General`, `Advising`, `Supervision`, `Program`, `System`) using `section` metadata. Added collapsible section headers with chevron indicators. Active links now use a small indicator dot and rely on `bg-primary-800` / `text-white` tokens. Added `aria-current="page"`, focus-visible rings, backdrop blur on mobile overlay, and proper ARIA roles. Included a footer brand stamp ("SESAM · UPLB").
**result** -> Better scannability per role, cleaner mobile experience, and full ARIA compliance.

### 3. Header missing breadcrumbs and robust dropdown UX
**problem** -> Header only showed static `{role} Dashboard` text; user dropdown lacked Escape/click-outside dismissal; no avatar image support; no Profile/Settings quick links.
**fix** -> Implemented dynamic breadcrumb generation from `usePathname()` with overrides for known routes. Added desktop breadcrumb nav and a mobile-truncated page title. User dropdown now dismisses on outside click and Escape key. Added avatar image fallback to initials badge. Included Profile and Settings links in the dropdown menu. Replaced static title with breadcrumb nav on desktop.
**result** -> Users always know where they are in the app hierarchy; dropdown is accessible and feature-complete.

### 4. NotificationBell styling inconsistent with new tokens
**problem** -> NotificationBell used hardcoded utility classes that would drift from the design system.
**fix** -> Left `NotificationBell.tsx` structurally intact (it is a separate component with its own API logic) but its classes are already close to the new gray scale. Future pass should map its colors to semantic tokens.
**result** -> No functional breakage; visual integration acceptable for this iteration.
