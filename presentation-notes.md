# AdmitGuard: Solution Proposal Presentation Notes

## 1. Presentation Structure (5 Minutes Total)

### Slide 1: The Business Problem (30s)
*   **The Hook**: "Excel is where data goes to die."
*   **The Pain**: Operations team wasting hundreds of hours on ineligible candidates.
*   **The Impact**: Wasted counselor time, poor candidate experience, and compliance risks with institutional partners (IITs/IIMs).

### Slide 2: The Solution - AdmitGuard (45s)
*   **Core Concept**: A "Compliance-First" data entry system.
*   **Strict vs. Soft Rules**: Zero-tolerance for identity/status errors; structured overrides for borderline eligibility.
*   **Auditability**: Every exception requires a rationale and is logged for manager review.

### Slide 3: Technical Approach & AI Strategy (1m)
*   **Full-Stack Architecture**: Migrated from client-side storage to an **Express + SQLite** backend for enterprise scalability.
*   **Vibe Coding**: Used the R.I.C.E framework in Google AI Studio.
*   **Architecture**: Decoupled validation rules from UI components. Rules are stored in a configurable JSON-like object (`constants.ts`).
*   **UX Design**: Multi-step form to reduce cognitive load; real-time feedback to prevent "Submit-and-Pray" errors.

### Slide 4: Live Demo (2m)
*   **Action 1**: Show **Strict Validation** (e.g., entering a number in the Name field or selecting 'Rejected' status).
*   **Action 2**: Show **Soft Rule Exception** (e.g., entering a 5.9 CGPA, toggling the exception, and demonstrating the rationale keyword validation).
*   **Action 3**: Show **Audit Log & Dashboard** (Highlight the "Flagged" entries and the CSV export feature).

### Slide 5: Business Impact & Future (45s)
*   **ROI**: 100% adherence to strict rules. Estimated 30% reduction in wasted interview slots.
*   **Scalability**: Easy to update rules for new cohorts without touching code.
*   **Next Steps**: Integration with Google Sheets API and a manager-specific approval dashboard.

---

## 2. Speaker Notes (Key Talking Points)

*   **On the Problem**: "We weren't just missing data; we were missing accountability. Borderline cases were being pushed through without anyone knowing why."
*   **On Technical Decisions**: "I chose a multi-step flow because admission forms are high-stakes. By breaking it into Personal, Academic, and Compliance steps, we ensure the operator is focused on one category of rules at a time."
*   **On AI Usage**: "I didn't just ask the AI to 'build an app.' I iterated through five distinct sprints: Structure, Strict Logic, Soft Logic, Audit, and finally, UI Refinement. This kept the code clean and the logic sound."
*   **On the Rationale System**: "The rationale field isn't just a text box. It's a compliance gate. It checks for specific keywords like 'approved by' to ensure the operator has actually followed the protocol."

---

## 3. Prompt Engineering Summary (For the Panel)

| Sprint | Prompt Goal | Key Constraint |
| :--- | :--- | :--- |
| **1. Foundation** | Base form structure | "No logic yet, focus on clean layout and 11 fields." |
| **2. Strict Logic** | Blockers | "Submit button disabled until all strict rules pass. Add Rejected banner." |
| **3. Soft Logic** | Overrides | "Show rationale field only on violation. Validate for 30 chars + keywords." |
| **4. Audit/Ops** | Reporting | "Create a dashboard for exception rates and a CSV export for the audit log." |
| **5. Polish** | UX/UI | "Add Motion animations and a progress indicator for the multi-step flow." |

---

## 4. Final Checklist Before Presentation
- [ ] App is running at the App URL.
- [ ] LocalStorage is cleared (or has 2-3 "clean" test entries).
- [ ] CSV export works (test it one last time).
- [ ] Rationale keywords are memorized (approved by, special case, etc.).
- [ ] Timer is set for 5 minutes.
