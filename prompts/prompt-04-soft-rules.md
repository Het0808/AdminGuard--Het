# Prompt 4: Soft Rule Exceptions

Implement the Soft Rule system for these fields:
- Date of Birth: Candidate must be ≥ 18 and ≤ 35 years old.
- Graduation Year: Must be between 2015 and 2025.
- Percentage / CGPA: Percentage ≥ 60% or CGPA ≥ 6.0.
- Screening Test Score: Must be ≥ 40.

**Logic**:
- If a soft rule is violated, show a warning message and a "Request Exception" toggle.
- If the toggle is checked, show a rationale text field.
- The rationale must be ≥ 30 characters and include one of: "approved by", "special case", "documentation pending", "waiver granted".
- Submission is only allowed if the rationale is valid.

## AI Reflection
- **What went right**: The conditional rendering of the rationale field worked perfectly.
- **What went wrong**: The AI forgot to clear the rationale text when the "Request Exception" toggle was unchecked, leading to stale data in the state.
- **Correction**: I added a cleanup effect in the `handleExceptionToggle` function to delete the rationale from the state when toggled off.
