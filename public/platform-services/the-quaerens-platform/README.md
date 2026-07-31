# The Quaerens Platform Page

Version: 1.0.0  
Status: Production page, not linked from global navigation

## Purpose

This directory supports `/the-quaerens-platform.html`, the public explanation page for The Quaerens Platform&trade;.

The page explains how Quaerens connects public self-service tools, QCMS professional support, QCMS Operations, future portals and future intelligence capabilities into one evidence-first consumer complaint ecosystem.

## Structure

- `../../the-quaerens-platform.html` contains the semantic page content, metadata, structured data and internal links.
- `the-quaerens-platform.styles.css` contains the standalone responsive styling.
- `the-quaerens-platform.app.js` contains small progressive-enhancement behaviours.

## Design Rationale

The page uses a calm, premium Quaerens style rather than a heavy promotional layout. The redesign reduces long article-style text and uses coded visual systems so visitors can understand the platform quickly. It is built around the governing platform question:

Does this help someone resolve a complaint more efficiently or with greater confidence?

The visual system is intentionally structured around:

- Trust, Logic, People and Solutions as platform pillars.
- A central approved Quaerens logo platform diagram.
- Four ecosystem groups with clear availability labels.
- A seven-stage Complaint Journey.
- Knowledge before action, evidence before argument and choice before payment.

## Colour Roles

- Deep blue: platform authority, trust and final reassurance.
- Quaerens blue: primary actions and active states.
- Muted green: evidence, readiness and user confidence.
- Warm gold: outcome and practical progress.
- Restrained plum: future intelligence and wider platform capability.

## Icon Strategy

The page uses coded CSS shapes and inline SVG icons. It does not use icon fonts, external icon libraries or CDN-dependent graphics.

The large platform visual is not an embedded infographic image. It is built from semantic HTML, CSS positioning and accessible text so it can remain responsive, readable and maintainable.

## Accessibility

The page includes:

- A skip link.
- One H1.
- Semantic sections and headings.
- Keyboard-accessible controls.
- Visible focus states.
- Reduced-motion support.
- Decorative SVGs marked as hidden from assistive technology.
- Responsive layouts with no intentional horizontal scrolling.

## Responsive Behaviour

The layout is designed for desktop and mobile:

- Desktop uses a split hero, pillar feed, central ecosystem diagram and horizontal journey layout.
- Tablet stacks wider sections where needed.
- Mobile uses vertical sections, full-width buttons and stacked journey stages.

Target widths considered: 360px, 390px, 768px, 1024px and 1440px.

## CTA Destinations

- `Start with Complaint Packs` links to `/complaint-platform.html`.
- `See the Ecosystem` scrolls to the ecosystem diagram.
- `Understand QCMS Professional Support` links to `/complaint-platform.html`.
- `Explore the Knowledge Centre` links to `/consumer-rights-knowledge-centre.html`.

## Future Extension

Future public platform pages should reuse this approach:

- Explain architecture through coded, accessible components.
- Keep future capabilities clearly labelled as future.
- Avoid implying automatic submission, guaranteed outcomes or legal representation.
- Preserve the separation between Complaint Packs, QCMS, QCMS Operations, Operations CRM, Client Portal and Partner Portal.

## Confirmation

The full platform infographic was not embedded as a single image. The page uses coded layout, text, SVG and CSS so the content remains responsive, accessible and easier to maintain.
