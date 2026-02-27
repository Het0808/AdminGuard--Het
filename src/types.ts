import { Type } from "@google/genai";

export enum RuleType {
  STRICT = "STRICT",
  SOFT = "SOFT",
  SYSTEM = "SYSTEM",
}

export interface ValidationRule {
  id: string;
  field: string;
  label: string;
  type: RuleType;
  description: string;
  validate: (value: any, formData: any) => { isValid: boolean; message?: string };
}

export interface CandidateData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  qualification: string;
  gradYear: number;
  scoreType: 'Percentage' | 'CGPA';
  score: number;
  testScore: number;
  interviewStatus: string;
  aadhaar: string;
  offerSent: string;
  timestamp: string;
  exceptions: Record<string, string>; // fieldId -> rationale
  flagged: boolean;
}

export const QUALIFICATIONS = [
  "B.Tech",
  "B.E.",
  "B.Sc",
  "BCA",
  "M.Tech",
  "M.Sc",
  "MCA",
  "MBA",
];

export const INTERVIEW_STATUSES = ["Cleared", "Waitlisted", "Rejected"];
