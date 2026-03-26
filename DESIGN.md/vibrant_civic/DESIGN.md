# Design System Specification: Civic Editorial

## 1. Overview & Creative North Star: "The Digital Magistrate"
This design system moves away from the sterile, "template" aesthetic of global tech and toward a sophisticated, **High-End Editorial** experience tailored for the Municipal Corporation of Delhi. 

**The Creative North Star: The Digital Magistrate.**
The interface should feel like an official leather-bound ledger meets a high-end architectural journal. We achieve this through **Organic Brutalism**: a structural layout that is unapologetically data-dense but softened by a warm, paper-like palette and elegant, high-contrast serif typography. 

To break the "standard UI" look, we utilize:
*   **Intentional Asymmetry:** Overlapping metric cards and side-panels that break the 12-column grid.
*   **Tonal Authority:** Reliance on background shifts rather than lines to define space.
*   **Textural Depth:** Subtle gradients and glassmorphism that mimic the quality of physical government seals and frosted partitions.

---

## 2. Color & Surface Architecture

### The "No-Line" Rule
**Borders are strictly prohibited for sectioning.** To define the boundaries of a data table or a side panel, use the `surface-container` tiers. A section is "defined" when a `surface-container-low` (#eef5f2) element sits atop a `surface` (#f4fbf8) background. This creates a soft, sophisticated transition that feels premium rather than "boxy."

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, high-quality paper sheets:
*   **Level 0 (Base):** `surface` (#f4fbf8) – The canvas.
*   **Level 1 (Sectioning):** `surface-container-low` (#eef5f2) – Large structural areas (e.g., the map side-panel).
*   **Level 2 (Interaction):** `surface-container` (#e8efec) – Default state for cards and data modules.
*   **Level 3 (Elevation):** `surface-container-highest` (#dde4e1) – Active states or "floating" navigation.

### The "Glass & Gradient" Rule
For hero components and primary CTAs:
*   **Signature Gradients:** Use a subtle linear gradient from `primary-container` (#1B4332) to `primary` (#012D1D) at a 145-degree angle. This adds "soul" and depth to official buttons.
*   **Glassmorphism:** For mobile-first gauges and floating status badges, use `surface-container-lowest` (#ffffff) at 70% opacity with a `24px` backdrop-blur. This creates the "Frosted Glass" effect characteristic of high-end civic spaces.

---

## 3. Typography: Editorial Authority

The typography system is a dialogue between the heritage of the Indian civil service and the precision of modern data science.

*   **Display & Headline (Fraunces):** Used for large impact moments. Its "Soft-Victory" serif style conveys trustworthiness.
    *   *Usage:* State-wide metrics, page titles, and gamified achievement headers.
*   **Title & Body (DM Sans):** A geometric sans-serif that ensures maximum readability for complex civic data.
    *   *Usage:* Labels, table content, and instructional copy.
*   **Data Mono (Geist Mono):** Specifically for Indian Rupee (₹) symbols, coordinate data, and civic ID numbers.
    *   *Role:* Provides a "technical ledger" feel to the platform.

| Role | Font Family | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **display-lg** | Fraunces | 3.5rem | 700 | -0.02em |
| **headline-md** | Fraunces | 1.75rem | 600 | -0.01em |
| **title-md** | DM Sans | 1.125rem | 500 | 0 |
| **body-md** | DM Sans | 0.875rem | 400 | 0 |
| **label-sm** | Geist Mono | 0.6875rem | 500 | 0.05em |

---

## 4. Elevation & Depth: Tonal Layering

We reject traditional drop shadows in favor of **Ambient Light**.

*   **The Layering Principle:** If a metric card needs to stand out, do not add a shadow. Instead, change the background of the container below it to `surface-container-low` and keep the card `surface-container-lowest`.
*   **Ghost Borders:** When accessibility requires a stroke (e.g., input fields), use `outline-variant` (#c1c8c2) at **20% opacity**. It should be felt, not seen.
*   **The Ambient Shadow:** Only for floating action buttons or modal overlays. 
    *   *Spec:* `0px 12px 32px rgba(15, 41, 34, 0.06)`. The shadow uses a tint of `on-surface` (#161D1B) to ensure it looks like a natural shadow on paper, not a digital smudge.

---

## 5. Component Strategies

### Metric Cards & Data-Dense Tables
*   **No Dividers:** Rows in tables should be separated by a `1.5` (0.3rem) spacing gap and alternating background tints (`surface` vs `surface-container-low`) rather than lines.
*   **Rupee Integration:** Use `tertiary` (#431A00) for currency symbols to provide a warm, "Gold Standard" highlight against the `primary` text.

### Gamified Achievement Badges
*   **Visual Style:** Use the **Warm Gold** (`tertiary_fixed`) as a glassmorphic background. 
*   **Shape:** Use the `xl` (0.75rem) roundedness to create a "soft-seal" look.

### Mobile-First Gauges
*   **Stroke:** Use `primary` (#012D1D) for the progress track and `primary-fixed` (#C1ECD4) for the remainder.
*   **Inner Surface:** Use a backdrop-blur of `12px` to make the gauge feel like a physical lens over the data.

### Buttons
*   **Primary:** Background: `primary-container` (#1B4332). Shape: `md` (0.375rem). Text: `on-primary`. 
*   **Secondary:** No background. Ghost border (20% opacity). Text: `primary`.
*   **Interaction:** On hover, shift background to `primary` (#012D1D) and increase the blur of the ambient shadow.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins (e.g., a wider left margin for display text) to create an editorial feel.
*   **Do** overlap elements. A card can slightly "overhang" a side-panel to create a sense of physical layers.
*   **Do** use `Geist Mono` for all numerical values in tables to ensure tabular alignment.

### Don’t
*   **Don't** use 1px solid black or grey borders. This instantly kills the premium aesthetic.
*   **Don't** use pure white (#FFFFFF) for large background areas. Stick to the warm `surface` (#f4fbf8) to reduce eye strain and feel "official."
*   **Don't** use standard "Material Design" shadows. Keep them diffused, low-opacity, and color-tinted.