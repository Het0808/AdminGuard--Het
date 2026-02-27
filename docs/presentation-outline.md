# AdmitGuard: Solution Proposal Presentation Outline

**Time Limit:** 5 Minutes (Hard Cutoff)
**Audience:** FLC Leadership Panel

---

## Slide 1: Title Slide (15s)
*   **Project Name:** AdmitGuard
*   **Subtitle:** Solution Proposal — Admission Data Compliance System
*   **Presenter:** [Your Name]
*   **Date:** February 27, 2026

---

## Slide 2: Problem Statement (45s)
*   **Data Integrity Failure**: Unstructured spreadsheet entry leads to inconsistent candidate data.
*   **Rule Complexity**: High-stakes eligibility criteria (IIT/IIM) are often misapplied by staff.
*   **Silent Errors**: Ineligible candidates are caught too late, wasting institutional resources.
*   **Lack of Accountability**: No structured method to document or audit rule overrides.

---

## Slide 3: Impact Analysis (30s)
*   **Operational Waste**: Significant hours lost on counselor time and interview panels for ineligible leads.
*   **Brand Damage**: Negative candidate experience due to rejections at advanced stages.
*   **Compliance Risk**: Potential breach of institutional partnership agreements due to data errors.

---

## Slide 4: Proposed Solution (45s)
*   **AdmitGuard**: A compliance-first validation system that enforces rules at the point of entry.
*   **Strict Enforcement**: Blocks submission for non-negotiable criteria (e.g., Aadhaar, Status).
*   **Managed Exceptions**: Structured rationale system for borderline cases (e.g., CGPA).
*   **Operations Dashboard**: Real-time visibility into pipeline health and exception rates.

---

## Slide 5: Live Demo (90s)
*   **Scenario 1 (Clean)**: Demonstrate a standard, valid submission.
*   **Scenario 2 (Exception)**: Trigger a soft-rule violation (e.g., 5.9 CGPA), toggle exception, and enter a valid rationale.
*   **Scenario 3 (Flagged)**: Demonstrate how 3+ exceptions trigger a "Manager Review" flag.
*   **Audit Log**: Show the recorded entry and the CSV export capability.

---

## Slide 6: Technical Architecture (30s)
*   **Modular Engine**: Validation logic is decoupled from UI components for easy rule updates.
*   **Data Flow**: React Form → Validation Engine (JSON Config) → LocalStorage Sync → Audit Log.
*   **Tech Stack**: React 19, TypeScript, Tailwind CSS, and Motion for UX.

---

## Slide 7: Prompt Engineering Approach (30s)
*   **Iterative Chaining**: Built the system in 5 distinct sprints (Foundation → Strict → Soft → Audit → Polish).
*   **Refinement**: Used specific edge-case prompts to fix complex regex and state-sync issues.
*   **AI Efficiency**: Leveraged Gemini 3.1 Pro for logic generation while maintaining manual oversight of UX.

---

## Slide 8: Limitations & Next Steps (20s)
*   **Current Prototype**: Client-side storage, single-user environment.
*   **V2 Roadmap**: Implement multi-user authentication, SQL database persistence, and CRM API integration.

---

## Slide 9: Ask / Recommendation (15s)
*   **Recommendation**: We recommend deploying AdmitGuard as a hosted web app for the upcoming cohort.
*   **Timeline**: Ready for pilot testing by [Date].

---

## Professional Language Reminder
*   **Don't say**: "We made this cool app." -> **Say**: "We developed a data validation system that addresses..."
*   **Don't say**: "It works on my laptop." -> **Say**: "The prototype is deployed and accessible at [URL]."
*   **Don't say**: "Any questions?" -> **Say**: "We recommend [Next Step]. Happy to discuss implementation timeline."

---

## Potential Q&A Prep
1.  **"What if we need to add a new rule?"** -> "The architecture is modular; new rules can be added to the JSON config without modifying the core UI logic."
2.  **"How do you prevent rationale gaming?"** -> "The system enforces minimum character counts and mandatory compliance keywords, ensuring rationales are meaningful."
3.  **"Why not a Google Sheet add-on?"** -> "A standalone app provides a more controlled UI, preventing accidental formula deletions and ensuring 100% rule enforcement."
