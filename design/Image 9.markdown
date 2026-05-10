---
name: Credex Executive Audit System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#414848'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#717978'
  outline-variant: '#c1c8c7'
  surface-tint: '#426463'
  primary: '#001615'
  on-primary: '#ffffff'
  primary-container: '#062c2b'
  on-primary-container: '#729593'
  inverse-primary: '#a9cdcb'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#260b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#461a00'
  on-tertiary-container: '#e96702'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5eae7'
  primary-fixed-dim: '#a9cdcb'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#2b4c4b'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-desktop: 32px
  margin-mobile: 16px
  gutter: 24px
  card-padding: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The brand personality is **authoritative, forensic, and elite**. This design system is built for the high-stakes environment of financial auditing, where clarity is a form of currency. It avoids the "friendly" tropes of typical SaaS in favor of a **Corporate Modern** aesthetic that leans into technical precision.

The emotional response should be one of "controlled intelligence." Users should feel they are using a tool that is smarter than the average spreadsheet—a digital CFO that finds the needle in the haystack. The style utilizes heavy data density, high-contrast status indicators, and a structured layout that prioritizes information architecture over decorative flair.

## Colors

The palette is anchored by **Deep Forest Green** (`#062C2B`) and **Dark Slate** (`#0F172A`), providing a foundation of institutional stability. 

*   **Primary Action & Success:** A "Vivid Emerald" (`#10B981`) is used for primary buttons and positive health grades.
*   **Warning & Attention:** A "Burned Orange" (`#F97316`) identifies medium-risk spend anomalies.
*   **Critical:** A "Pure Red" (`#EF4444`) is reserved strictly for audit failures and high-risk alerts.
*   **Neutrals:** The background uses a crisp, cool slate-white to keep the interface feeling airy despite the data density. 
*   **Contrast:** High-contrast text (Slate 900 on White) ensures maximum legibility for financial figures.

## Typography

This design system uses a triple-font strategy to balance impact, readability, and technicality:
1.  **Hanken Grotesk (Headlines):** A sharp, contemporary sans-serif used for large displays and section headers. It provides the "punchy" authoritative tone required for executive summaries.
2.  **Inter (UI & Body):** The workhorse font for all interface elements, form fields, and long-form data reading.
3.  **JetBrains Mono (Technical Data):** Used sparingly for currency amounts, audit IDs, and timestamps to evoke the feeling of a precise, technical tool.

**Hierarchy Note:** Use `label-caps` for all table headers and small metadata categories to maintain a disciplined, structured appearance.

## Layout & Spacing

The layout follows a **Strict Fixed Grid** model on desktop to ensure data remains in predictable vertical alignments, transitioning to a fluid stack on mobile.

*   **Desktop:** 12-column grid with a max-width of 1440px. 24px gutters.
*   **Sidebar:** A fixed 280px sidebar in Deep Forest Green serves as the primary navigation anchor.
*   **Spacing Rhythm:** An 8px linear scale is used for all internal component spacing.
*   **Whitespace:** Generous external margins (32px+) are used to separate major data modules, preventing the technical UI from feeling "cramped" or overwhelming.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

*   **The Base:** The page background is a light Slate grey.
*   **The Content Layer:** Cards are white with a 1px border (`#E2E8F0`). 
*   **The Active Layer:** Elements that require interaction (e.g., a selected transaction) use a subtle, diffused shadow (10% opacity) with no spread, making them appear "popped" from the surface.
*   **Depth Metaphor:** The sidebar is the deepest layer (darkest color), with the main dashboard area acting as a clean canvas on top of it.

## Shapes

The shape language is **Soft yet Precise**. 

A radius of `0.25rem` (4px) is the standard for most UI components (buttons, inputs, cards). This "sharp-soft" approach maintains a professional, serious tone while avoiding the aggressive feel of 0px corners.

*   **Exceptions:** Segmented controls and badges may use a slightly higher radius (`0.5rem`) to distinguish them from structural layout containers.
*   **Strictness:** No circular "pills" for buttons; they must remain rectangular with subtle rounding to feel like executive software.

## Components

### Buttons & Inputs
*   **Primary Button:** Deep Forest Green background with White text. Sharp 4px corners.
*   **Input Fields:** Ghost-style with a 1px Slate-200 border. On focus, the border shifts to Emerald Green.
*   **Segmented Controls:** Used for all view-switching (e.g., Monthly vs Quarterly). These should be flat, encased in a light grey container with a white sliding "active" state.

### Cards & Data
*   **Audit Cards:** Flat white background, 1px border. No floating effects. Header of the card should use `label-caps` for the category.
*   **Status Badges:** High-saturation backgrounds (Emerald, Orange, Red) with high-contrast text. These are the "beacons" of the UI, designed to draw the eye immediately to spend health.
*   **Health Grades:** Circular progress rings or bold alphanumeric grades (A, B, F) using the Technical Mono font.

### Interaction
*   **Data Lists:** Tight vertical spacing with subtle zebra-striping on hover. 
*   **No Blobs:** Illustrations are strictly limited to technical line art or data visualizations. No organic shapes, gradients, or 3D character assets.