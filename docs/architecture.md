# Architecture — AdmitGuard

## Overview
AdmitGuard is a client-side React application that manages candidate admission data with a focus on compliance and data integrity.

## Data Flow
1. **Input**: User enters data into the multi-step form.
2. **Validation**: The `ValidationEngine` (defined in `ADMISSION_RULES`) checks each field in real-time.
3. **State Management**: React `useState` hooks manage the `formData` and `errors`.
4. **Persistence**: Data is sent to an **Express.js API** and stored in a **SQLite database** (`better-sqlite3`).
5. **Output**: Users can view metrics on the Dashboard or export the Audit Log as CSV/JSON.

## Key Components
- **server.ts**: The backend entry point handling API routes and SQLite integration.
- **App.tsx**: The frontend controller handling routing (tabs), state, and API communication.
- **types.ts**: Centralized TypeScript interfaces for `CandidateData` and `ValidationRule`.
- **constants.ts**: The "Rules Engine" containing the logic for all 11 admission rules.
- **Card/Badge**: Reusable UI primitives for consistent design.

## Validation Logic
- **Strict Rules**: Return `isValid: false` and a message. Submission is disabled if any strict rule fails.
- **Soft Rules**: Return `isValid: false` but allow the user to provide a `rationale`.
- **Rationale Validator**: Checks for `length >= 30` and presence of keywords: `approved by`, `special case`, `documentation pending`, `waiver granted`.
