# Quaerens Builder Templates

This folder documents reusable template structure for self-service complaint pack builders.

Standard builder page sections:

1. Hero with short value statement and primary builder CTA.
2. "What is included" section listing the free pack outputs.
3. "How it works" section explaining the four-step user journey.
4. Browser-first questionnaire.
5. Live preview.
6. Completion screen with generated document tabs, before-send checks and downloads.
7. Evidence, official resources and FAQ sections.

Template rules:

- Development pages can use `noindex` while being tested.
- Do not add development pages to the sitemap.
- Live builder pages should use the same data sources in `/public/data/`.
- Avoid automatic submission language unless a future server-side service actually sends documents.
- Keep "no fee", "no success fee" and "you send it yourself" wording clear where the builder is self-service.

