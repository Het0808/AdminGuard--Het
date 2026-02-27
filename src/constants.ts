import { RuleType, ValidationRule, QUALIFICATIONS, INTERVIEW_STATUSES } from "./types";

export const ADMISSION_RULES: ValidationRule[] = [
  {
    id: "fullName",
    field: "fullName",
    label: "Full Name",
    type: RuleType.STRICT,
    description: "Min 2 characters. No numbers. First & Last name must be capitalized.",
    validate: (val: string) => {
      if (!val || val.trim().length < 2) return { isValid: false, message: "Min 2 characters required." };
      if (/\d/.test(val)) return { isValid: false, message: "Numbers are not allowed." };
      
      const words = val.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length < 2) return { isValid: false, message: "Please enter both First and Last name." };
      
      const allCapitalized = words.every(word => /^[A-Z]/.test(word));
      if (!allCapitalized) return { isValid: false, message: "First letter of each name must be capitalized (e.g. John Doe)." };
      
      return { isValid: true };
    },
  },
  {
    id: "email",
    field: "email",
    label: "Email",
    type: RuleType.STRICT,
    description: "Valid email format. Must be unique.",
    validate: (val: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return { isValid: false, message: "Invalid email format." };
      return { isValid: true };
    },
  },
  {
    id: "phone",
    field: "phone",
    label: "Phone",
    type: RuleType.STRICT,
    description: "10-digit Indian mobile number (starts with 6/7/8/9).",
    validate: (val: string) => {
      if (!/^[6-9]\d{9}$/.test(val)) return { isValid: false, message: "Must be 10 digits starting with 6, 7, 8, or 9." };
      return { isValid: true };
    },
  },
  {
    id: "dob",
    field: "dob",
    label: "Date of Birth",
    type: RuleType.SOFT,
    description: "Candidate must be ≥ 18 and ≤ 35 years old.",
    validate: (val: string) => {
      if (!val) return { isValid: false, message: "DOB is required." };
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18 || age > 35) return { isValid: false, message: `Age is ${age}, must be 18-35.` };
      return { isValid: true };
    },
  },
  {
    id: "qualification",
    field: "qualification",
    label: "Highest Qualification",
    type: RuleType.STRICT,
    description: "Must be one of the approved degrees.",
    validate: (val: string) => {
      if (!QUALIFICATIONS.includes(val)) return { isValid: false, message: "Invalid qualification." };
      return { isValid: true };
    },
  },
  {
    id: "gradYear",
    field: "gradYear",
    label: "Graduation Year",
    type: RuleType.SOFT,
    description: "Must be between 2015 and 2025.",
    validate: (val: number) => {
      if (val < 2015 || val > 2025) return { isValid: false, message: "Year must be 2015-2025." };
      return { isValid: true };
    },
  },
  {
    id: "score",
    field: "score",
    label: "Percentage / CGPA",
    type: RuleType.SOFT,
    description: "Percentage ≥ 60% or CGPA ≥ 6.0.",
    validate: (val: number) => {
      // Logic: if val > 10, assume percentage. if <= 10, assume CGPA.
      if (val > 10) {
        if (val < 60) return { isValid: false, message: "Percentage must be ≥ 60%." };
      } else {
        if (val < 6.0) return { isValid: false, message: "CGPA must be ≥ 6.0." };
      }
      return { isValid: true };
    },
  },
  {
    id: "testScore",
    field: "testScore",
    label: "Screening Test Score",
    type: RuleType.SOFT,
    description: "Must be ≥ 40 out of 100.",
    validate: (val: number) => {
      if (val < 40) return { isValid: false, message: "Score must be ≥ 40." };
      return { isValid: true };
    },
  },
  {
    id: "interviewStatus",
    field: "interviewStatus",
    label: "Interview Status",
    type: RuleType.STRICT,
    description: "Must be Cleared, Waitlisted, or Rejected.",
    validate: (val: string) => {
      if (!INTERVIEW_STATUSES.includes(val)) return { isValid: false, message: "Invalid status." };
      if (val === "Rejected") return { isValid: false, message: "Rejected candidates cannot be submitted." };
      return { isValid: true };
    },
  },
  {
    id: "aadhaar",
    field: "aadhaar",
    label: "Aadhaar Number",
    type: RuleType.STRICT,
    description: "Exactly 12 digits. No alphabets.",
    validate: (val: string) => {
      if (!/^\d{12}$/.test(val)) return { isValid: false, message: "Must be exactly 12 digits." };
      return { isValid: true };
    },
  },
  {
    id: "offerSent",
    field: "offerSent",
    label: "Offer Letter Sent",
    type: RuleType.STRICT,
    description: "Cannot be 'Yes' unless Interview Status is 'Cleared' or 'Waitlisted'.",
    validate: (val: string, formData: any) => {
      if (val === "Yes" && !["Cleared", "Waitlisted"].includes(formData.interviewStatus)) {
        return { isValid: false, message: "Cannot send offer unless status is Cleared/Waitlisted." };
      }
      return { isValid: true };
    },
  },
];

export const RATIONALE_KEYWORDS = ["approved by", "special case", "documentation pending", "waiver granted"];
export const MIN_RATIONALE_LENGTH = 30;
