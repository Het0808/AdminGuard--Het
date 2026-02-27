# Prompt 1: The Foundation

**Role**: You are a senior frontend developer building an internal business tool.

**Task**: Create a candidate admission form for an education company's enrollment process. The form collects the following fields:
- Full Name (text)
- Email (text)
- Phone (text, 10 digits)
- Date of Birth (date picker)
- Highest Qualification (dropdown: B.Tech, B.E., B.Sc, BCA, M.Tech, M.Sc, MCA, MBA)
- Graduation Year (number, range 2015-2025)
- Percentage or CGPA (number with a toggle to switch between percentage and CGPA mode)
- Screening Test Score (number, 0-100)
- Interview Status (dropdown: Cleared, Waitlisted, Rejected)
- Aadhaar Number (text, 12 digits only)
- Offer Letter Sent (toggle: Yes/No)

**Constraints**:
- Use a clean, professional design. Not a generic template.
- Each field should show a label, input, and validation message area.
- The submit button should be disabled until all strict validations pass.
- Use a single-page layout with a card-based form design.
- Show a progress indicator or step tracker if the form is long.

Do NOT write all validations yet. Just build the form structure first.

## AI Reflection
- **What went right**: The AI correctly identified all 11 fields and created a clean card-based layout.
- **What went wrong**: It initially used a single long form instead of the requested step-tracker.
- **Correction**: I had to explicitly prompt for the `currentStep` state and wrap sections in conditional rendering to achieve the multi-step flow.
