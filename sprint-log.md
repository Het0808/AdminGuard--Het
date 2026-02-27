# Sprint Log — AdmitGuard

## Sprint 0 (Day 3 — Wednesday PM + Evening)
- **Goal:** Understand problem, plan approach, set up repo, research tools.
- **Done:** Repo created, README written, wireframe sketched, researched AI Studio Build mode.
- **Research:** Read official Google AI Studio docs and watched tutorial playlists.
- **Blockers:** None.
- **Key Decision:** Chose a multi-step form to reduce cognitive load for operators handling 11+ fields.
- **Prompts Drafted:** 3 (Foundation, Strict Rules, Edge Cases).

## Sprint 1 (Day 4 — Thursday PM + Evening)
- **Goal:** Working form with strict validation.
- **Done:** All 11 fields rendering, 7 strict rules validated, multi-step navigation implemented.
- **Blockers:** Initial phone validation was too permissive; refined with a more specific regex prompt.
- **Key Decision:** Used inline validation for immediate feedback rather than waiting for submission.
- **Prompts Used:** 3 (Foundation, Strict Rules, Edge Cases).
- **AI Evaluation:** Prompt 1 output was 85% correct. It missed the multi-step navigation which I had to add in a follow-up prompt.

## Sprint 2 (Day 5 — Friday AM)
- **Goal:** Implement soft-rule exception system.
- **Done:** Exception toggles added for DOB, Grad Year, Score, and Test Score. Rationale validation logic implemented.
- **Blockers:** Rationale keyword check was case-sensitive initially; fixed to be case-insensitive.
- **Key Decision:** Required a minimum of 30 characters for rationales to ensure meaningful documentation.
- **AI Evaluation:** The AI correctly implemented the conditional logic for rationale fields but initially forgot to clear state on toggle-off.

## Sprint 3 (Day 5 — Friday PM)
- **Goal:** Configurable rules engine and Audit Log.
- **Done:** Refactored rules into a separate constants file. Created Audit Log with CSV/JSON export.
- **Blockers:** CSV formatting for fields containing commas; handled by joining with standard delimiters.
- **Key Decision:** Added a "Flagged" status for candidates with >2 exceptions for easier manager review.

## Sprint 4 (Day 5 Evening)
- **Goal:** Dashboard, Backend Migration, and Final Polish.
- **Done:** Operations dashboard with real-time stats. Migrated from `localStorage` to an **Express + SQLite** backend for scalability. Added Motion animations for step transitions. Fixed CSV export formatting for Aadhaar/Phone numbers to prevent scientific notation in Excel.
- **Key Decision:** Moved persistence to a real database to support future multi-user scenarios and robust audit trails.
- **AI Evaluation:** The AI successfully generated the Express boilerplate and SQLite schema, but I had to manually refactor the `fetch` calls to handle asynchronous state updates correctly.
