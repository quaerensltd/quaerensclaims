# QCBF Design Standard

Status: baseline standard for QCBF 1.2 builders  
Scope: Flight, Holiday, Car Finance and Baggage complaint pack builders  
Purpose: keep future builders consistent without removing specialist logic

## Core Principle

Every Quaerens builder should feel like one product family: a guided, evidence-led complaint pack builder that helps a consumer organise facts, evidence, chronology, financial impact and submission steps. Specialist builders may have different questions and calculations, but the user experience, output naming, draft controls and export structure should stay recognisably consistent.

## 1. Product Naming

Use the pattern:

`Free [Topic] Complaint Pack Builder`

For specialist variants, use:

`[Topic] Agreement Analysis & Complaint Pack Builder`

The final generated bundle should be labelled:

`Quaerens Consumer Complaint File`

Where topic-specific clarity is needed, use a subtitle such as:

`Flight Disruption Complaint Pack` or `Car Finance Agreement Analysis`.

## 2. Page Title Patterns

Use:

`[Topic] Complaint Pack Builder | [Primary Search Need] | Quaerens`

Keep the strongest search phrase near the beginning. Do not describe a full builder as only a letter template.

## 3. Hero Naming

Hero H1s should be problem-led and specific:

- `Build Your Flight Disruption Complaint Pack`
- `Build Your Holiday & Package Travel Complaint Pack`
- `Build Your Car Finance Agreement Analysis & Complaint Pack`
- `Lost, Delayed or Damaged Luggage? Build Your Free Airline Complaint Pack`

## 4. Step Naming

Use:

`Step n of total - Step label`

Each label should describe the user task, not the internal module. Examples:

- Find Your Flight
- Confirm the Journey
- Disruption Details
- Evidence and Timeline
- Review and Download

## 5. Colours

Use the existing Quaerens blue for primary actions, links and active states. Use green only for positive confirmation, ticks, completed status or safe reassurance. Use amber for caution and red only for problem headings or destructive actions.

## 6. Spacing

Maintain generous spacing between major sections. Wizard panels should not touch adjacent cards. On mobile, section padding should reduce but keep clear separation between form groups.

## 7. Border Radius

Cards, forms and panels should use moderate rounded corners consistent with current pages. Avoid highly rounded decorative cards unless already used for primary CTAs.

## 8. Shadows

Use subtle shadows only for elevated cards, hero form panels and generated-output panels. Avoid heavy shadows on every component.

## 9. Heading Hierarchy

Use one H1 only. Use H2 for major sections, H3 for wizard steps and card groups, and avoid styling small labels as large headings.

## 10. Body Text

Keep body text plain, readable and direct. Avoid guaranteed outcome language. Use "may", "can help", "possible", "estimated" and "subject to review" where appropriate.

## 11. Form Labels

Every input must have a visible label. Labels should describe the information needed in plain English.

## 12. Help Text

Help text should explain why the information is requested or how it will be used. Keep it short.

## 13. Error Text

Errors should identify what needs fixing and where. Avoid generic "invalid" messages.

## 14. Inputs

Inputs should have consistent height, border, focus state and placeholder style. Placeholder text must not replace labels.

## 15. Select Controls

Select controls should use clear default prompts, such as `Select an issue` or `Start typing an airline name`.

## 16. Radio Controls

Radio controls should be used for mutually exclusive choices. Card-style radios may be used where the choice is important and benefits from explanation.

## 17. Checkboxes

Checkboxes should be used for multiple selections, consent, draft saving and evidence lists. Consent wording must match the actual implementation.

## 18. Date Fields

Date fields should use consistent date format hints. Where calculations depend on time, scheduled and actual fields should be clearly paired.

## 19. Repeating Groups

Passenger, expense, item and event repeaters should show every added entry and provide a clear remove action.

## 20. Primary Buttons

Primary CTAs should use Quaerens blue and one consistent action phrase per page. Examples:

- Build My Complaint Pack
- Start Free Complaint Pack Builder
- Request My Free Review

## 21. Secondary Buttons

Secondary buttons should use outline styling and describe navigation or supporting actions, such as `How It Works`, `Back`, or `Search Another Flight`.

## 22. Destructive Buttons

Destructive actions, such as deleting saved answers, should be visually distinct and confirm the consequence in nearby text.

## 23. Progress Indicators

All builders should show step number, total steps, current label and progress bar. Progress should update when the user moves backward or changes answers.

## 24. Summary Cards

Summary cards should explain the current state of the pack and highlight missing information without implying failure.

## 25. Readiness Cards

Readiness cards should show whether the user has enough information to prepare a useful complaint pack, not whether they are guaranteed compensation.

## 26. Evidence Position Cards

Evidence cards should separate strong evidence, possible evidence gaps and optional supporting documents.

## 27. Financial Summary Cards

Financial cards should distinguish statutory estimates, documented expenses, claimed losses and amounts requiring further review.

## 28. Organisation Cards

Organisation cards should group timeline, evidence, correspondence, financial impact and submission route.

## 29. Requested Outcome Cards

Requested outcome cards should use cautious language. Use "requested outcome" or "possible outcome sought", not guaranteed recovery.

## 30. Promised-Versus-Actual Tables

Where used, tables should compare representations, later reality, evidence and possible complaint relevance.

## 31. Timeline Components

Timelines should capture event date, event description, evidence source and whether the event supports the complaint.

## 32. Status Labels

Status labels should be short and consistent, such as:

- Draft saved
- Pack ready
- Estimate available
- Further review required
- Missing information

## 33. Empty States

Preview panels should have clean empty states. They should explain what will appear after the user enters enough information.

## 34. Smart Submission

Smart Submission should mean the final guided submission stage. It should show official submission routes, preferred complaint method, verified complaint email where available and the user's next actions.

## 35. Download Sections

Use standard labels:

- Download Complete PDF
- Download Editable Word or RTF
- Download Plain Text Version
- Copy This Document
- Print My Complaint Pack

Specialist exports can be added below the standard group.

## 36. Pack-Reference Display

Every generated pack should display a pack reference in the preview, PDF cover, Word/RTF output and plain text output. Prefixes may be topic-specific, such as QF, QH, QC and QB.

## 37. Draft Controls

Draft controls should say where answers are saved and how to delete them. Draft restoration should never be silent if meaningful saved data is loaded.

## 38. Privacy Notices

Privacy wording must match the implementation. If answers stay in the browser, say so. If a server or API is used, identify when information is sent.

## 39. Disclaimer Placement

Place disclaimers near the builder start, preview/download area and final submission guidance. Avoid repeating heavy legal wording in every section.

## 40. PDF Covers

PDF covers should show:

- Quaerens Consumer Complaint File
- Builder topic
- Pack reference
- Generated date
- User or passenger name where available
- Important self-service note

## 41. PDF Headings

PDF headings should match the preview document labels.

## 42. PDF Tables

PDF tables should avoid tiny text, overflow and clipped values. Long entries should wrap cleanly.

## 43. PDF Footers

PDF footers should include page numbering, pack reference and a short self-service disclaimer.

## 44. Word/RTF Standards

Word/RTF exports should be editable, readable and structured with clear headings. They should not contain HTML fragments.

## 45. TXT Standards

TXT exports should use plain headings, readable spacing and no decorative characters that risk encoding issues.

## 46. Print Standards

Print views should hide navigation and controls, preserve section headings and avoid cutting cards across pages where practical.

## 47. Accessibility Standards

All builders should support keyboard navigation, visible focus states, proper labels, sufficient contrast, ARIA live updates for step changes and meaningful button text.

## 48. Mobile Standards

Builders must work at 320, 360, 375, 390, 414 and 430 px widths. Inputs, buttons, cards and preview panels must not overflow.

## 49. Specialist Exceptions

Specialist logic may differ by builder. Flight may need route distance and compensation calculations. Car Finance may need agreement analysis. Holiday may need package-travel remedy logic. Baggage may need passenger baggage convention details. The shared standard should not flatten those differences.

## 50. Testing Requirements

Before launch or major changes, run:

- Shared QCBF tests
- Builder-specific migration tests
- Syntax checks for touched JavaScript
- Export checks for PDF, Word/RTF, TXT, copy and print
- Draft save, restore and delete tests
- Mobile layout checks
- Known regression scenarios, including FR578 for Flight

## Rollback Standard

Every builder change should be committed separately enough to revert safely. If a production issue appears, revert the last builder-specific commit or restore the previous deployed file while preserving unrelated changes.
