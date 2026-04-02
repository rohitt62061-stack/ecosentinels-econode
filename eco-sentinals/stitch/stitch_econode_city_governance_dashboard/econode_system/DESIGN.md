# Design System Strategy: The Living Ledger

## 1. Overview & Creative North Star
The visual identity for this platform is defined by the **"Living Ledger"**—a design philosophy that balances the rigid, authoritative structure of civic governance with the fluid, organic vitality of urban ecology. 

To move beyond the "template" look of standard SaaS, this design system rejects the constraints of a traditional 12-column grid in favor of **Intentional Asymmetry**. We utilize expansive white space (breathing room) contrasted against high-density data modules. By overlapping interactive map elements with translucent, floating glass containers, we create a sense of depth that feels like a physical "smart city" model rather than a flat web page. The goal is an editorial-grade experience where data feels curated, not just displayed.

## 2. Colors & Tonal Architecture
The palette is rooted in Emerald Green and Slate Blue, but its sophistication comes from how we layer these tones.

*   **Primary Logic:** We use `primary` (#006d36) for high-impact brand moments and `primary_container` (#50c878) for interactive elements like AQI indicators and active states.
*   **Neutral Foundation:** The environment lives on `surface` (#f8f9fa). We utilize the `surface_container` tiers to define hierarchy without visual clutter.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts. 
*   *Example:* A navigation sidebar should be `surface_container_low`, sitting flush against a `surface` main content area. No divider line is permitted.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. To highlight a specific data set, use the **Nesting Principle**:
1.  **Level 0 (Base):** `surface`
2.  **Level 1 (Section):** `surface_container_low`
3.  **Level 2 (Active Card):** `surface_container_lowest` (Pure White)

### The "Glass & Gradient" Rule
To elevate the "Civic Tech" aesthetic, use Glassmorphism for floating UI elements (like Map Legends or User Profiles). Apply `surface_container_lowest` with a 70% opacity and a 12px backdrop-blur. For primary CTAs, apply a subtle linear gradient from `primary` to `primary_container` at a 135-degree angle to provide a "lit from within" glow.

## 3. Typography: Editorial Authority
We use a dual-typeface system to bridge the gap between human-centric storytelling and technical precision.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism and wide apertures. Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to create a bold, authoritative "editorial" header style.
*   **Body & Labels (Inter):** The workhorse. Use `body-md` for high-density data reports. Its tall x-height ensures legibility in complex civic charts and tables.
*   **Typographic Hierarchy:** Always lead with a large `headline-md` in `on_surface`. Follow with a `label-md` in `secondary` (Slate Blue) for metadata. This contrast in scale and color immediately directs the citizen’s eye to the most critical data point.

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** and physics-based light simulation.

*   **The Layering Principle:** Depth is created by "stacking" the surface-container tiers. Place a `surface_container_lowest` card on a `surface_container_high` section to create a soft, natural lift.
*   **Ambient Shadows:** When a card must "float" (e.g., a map popover), use an extra-diffused shadow. 
    *   *Shadow Specs:* `0px 20px 40px`, color: `on_surface` at 6% opacity. This mimics ambient city light rather than a harsh drop shadow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use the `outline_variant` token at 15% opacity. **100% opaque borders are forbidden.**

## 5. Components

### Cards & Data Modules
*   **Styling:** Use `xl` (1.5rem) roundedness for top-level containers and `lg` (1rem) for nested items.
*   **Interaction:** On hover, a card should shift from `surface_container_lowest` to a subtle `surface_bright` with an ambient shadow increase.
*   **No Dividers:** Forbid the use of divider lines within cards. Separate header, body, and footer content using the Spacing Scale (e.g., `8` or `10` units of vertical space).

### Interactive Map Elements
*   **Heatmaps:** Use a gradient ramp from `secondary_container` (cool) to `primary_container` (active) to `tertiary_container` (high alert/AQI).
*   **Overlays:** Use the "Glassmorphism" rule. Map controls should be floating `full` rounded circles with backdrop blurs.

### Buttons
*   **Primary:** `primary` background with `on_primary` text. `md` (0.75rem) roundedness.
*   **Secondary (Civic):** `secondary_container` background with `on_secondary_container` text. This feels professional and understated.
*   **Tertiary:** No background or border. Use `primary` text weight 600.

### Circular Progress (AQI)
*   **Track:** `surface_container_highest`.
*   **Indicator:** `primary_container`. Use a rounded stroke-cap to maintain the "Modern Civic" softness.

### Input Fields
*   **States:** Background should be `surface_container_low`. On focus, transition the background to `surface_container_lowest` and apply a 2px "Ghost Border" using `primary`.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts where the map occupies 65% of the screen and data cards overlap the map's edge.
*   **Do** use the Spacing Scale `12` (3rem) for padding around major headline groups to create a premium, "un-crowded" feel.
*   **Do** use `tertiary` (#99443a) sparingly for "System Alerts" or "Critical Pollution Levels."

### Don't
*   **Don't** use black (#000000) for text. Use `on_surface` (#191c1d) to maintain the Slate Blue professional undertone.
*   **Don't** use default shadows. If a shadow looks "heavy," increase the blur and decrease the opacity.
*   **Don't** use lines to separate list items. Use a slight background toggle between `surface` and `surface_container_low` for zebra-striping if necessary.