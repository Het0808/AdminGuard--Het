# AdmitGuard — Admission Data Validation & Compliance System

AdmitGuard is a lightweight, compliance-first application designed to replace unstructured spreadsheet-based admission trackers. It enforces institutional eligibility rules at the point of entry, ensuring that only qualified candidates move forward in the enrollment pipeline.

## The Problem
Admission pipelines at premier institutions (IITs, IIMs) often suffer from data integrity failures. Wasted operational hours occur when ineligible candidates are caught late in the process (document verification) rather than at the initial entry. AdmitGuard solves this by enforcing strict and soft validation rules during data entry.

## Key Features
- **Multi-Step Validation Form**: Guided entry for Personal, Academic, and Compliance data.
- **Strict Rule Enforcement**: Zero-tolerance for critical fields (Name, Email, Aadhaar, etc.).
- **Soft Rule Overrides**: Managed exception workflow for borderline cases (Age, CGPA) with mandatory rationale validation.
- **Operations Dashboard**: Real-time visibility into exception rates and flagged entries.
- **Audit Log**: Full transaction history with CSV and JSON export capabilities.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Animations**: Motion
- **Icons**: Lucide React
- **Development**: Vibe Coding with Google AI Studio (Gemini 3.1 Pro)

## Setup & Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build for production: `npm run build`

## Screenshots
*(Add screenshots here after deployment)*

## License
Apache-2.0
