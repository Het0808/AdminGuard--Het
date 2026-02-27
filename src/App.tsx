/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  LayoutDashboard, 
  UserPlus, 
  Search,
  ChevronRight,
  AlertTriangle,
  Info,
  Download,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CandidateData, 
  RuleType, 
  QUALIFICATIONS, 
  INTERVIEW_STATUSES 
} from './types';
import { 
  ADMISSION_RULES, 
  RATIONALE_KEYWORDS, 
  MIN_RATIONALE_LENGTH 
} from './constants';

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "success" | "warning" | "error" }) => {
  const styles = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'audit' | 'dashboard'>('form');
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [formData, setFormData] = useState<Partial<CandidateData>>({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    qualification: '',
    gradYear: 2024,
    scoreType: 'Percentage',
    score: 0,
    testScore: 0,
    interviewStatus: '',
    aadhaar: '',
    offerSent: 'No',
    exceptions: {},
    flagged: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { id: 1, title: 'Personal', icon: <UserPlus size={16} /> },
    { id: 2, title: 'Academic', icon: <ShieldCheck size={16} /> },
    { id: 3, title: 'Compliance', icon: <ShieldCheck size={16} /> },
  ];
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Load from Backend
  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (e) {
      console.error("Failed to fetch candidates", e);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const validateField = (field: string, value: any) => {
    const rule = ADMISSION_RULES.find(r => r.field === field);
    if (!rule) return null;

    const result = rule.validate(value, formData);
    if (!result.isValid) {
      return result.message || "Invalid value";
    }
    return null;
  };

  const handleInputChange = (field: string, value: any) => {
    const error = validateField(field, value);
    
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // If the rule is now satisfied (no error), remove the exception request
      if (!error && next.exceptions?.[field] !== undefined) {
        const nextExceptions = { ...next.exceptions };
        delete nextExceptions[field];
        return { ...next, exceptions: nextExceptions };
      }
      return next;
    });

    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const handleExceptionToggle = (field: string) => {
    setFormData(prev => {
      const newExceptions = { ...prev.exceptions };
      if (newExceptions[field]) {
        delete newExceptions[field];
      } else {
        newExceptions[field] = "";
      }
      return { ...prev, exceptions: newExceptions };
    });
  };

  const handleRationaleChange = (field: string, rationale: string) => {
    setFormData(prev => ({
      ...prev,
      exceptions: { ...prev.exceptions, [field]: rationale }
    }));
  };

  const validateRationale = (text: string) => {
    if (text.length < MIN_RATIONALE_LENGTH) return false;
    return RATIONALE_KEYWORDS.some(k => text.toLowerCase().includes(k));
  };

  const canSubmit = useMemo(() => {
    // Check all fields have values
    const requiredFields = ADMISSION_RULES.map(r => r.field);
    const hasAllValues = requiredFields.every(f => formData[f as keyof CandidateData] !== undefined && formData[f as keyof CandidateData] !== '');
    
    // Check strict errors
    const hasStrictErrors = Object.keys(errors).some(field => {
      const rule = ADMISSION_RULES.find(r => r.field === field);
      return rule?.type === RuleType.STRICT;
    });

    // Check soft errors have valid rationales
    const softErrors = Object.keys(errors).filter(field => {
      const rule = ADMISSION_RULES.find(r => r.field === field);
      return rule?.type === RuleType.SOFT;
    });

    const allSoftErrorsHaveRationale = softErrors.every(field => {
      const rationale = formData.exceptions?.[field];
      return rationale && validateRationale(rationale);
    });

    // Check if any soft error is NOT toggled as exception
    const allSoftErrorsToggled = softErrors.every(field => formData.exceptions?.[field] !== undefined);

    // If flagged, we allow submission even if rationales are missing (as it's marked for review)
    const softComplianceMet = formData.flagged || (allSoftErrorsToggled && allSoftErrorsHaveRationale);

    return hasAllValues && !hasStrictErrors && softComplianceMet;
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const exceptionCount = Object.keys(formData.exceptions || {}).length;
    const newCandidate: CandidateData = {
      ...(formData as CandidateData),
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      flagged: formData.flagged || exceptionCount > 2,
    };

    // Check for duplicate email
    if (candidates.some(c => c.email === newCandidate.email)) {
      setErrors(prev => ({ ...prev, email: "Email already exists in records." }));
      return;
    }

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate),
      });

      if (response.ok) {
        setCandidates([newCandidate, ...candidates]);
        setShowSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          dob: '',
          qualification: '',
          gradYear: 2024,
          scoreType: 'Percentage',
          score: 0,
          testScore: 0,
          interviewStatus: '',
          aadhaar: '',
          offerSent: 'No',
          exceptions: {},
          flagged: false,
        });
        setErrors({});
        setCurrentStep(1);
      }
    } catch (e) {
      console.error("Failed to save candidate", e);
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCandidates(candidates.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete candidate", e);
    }
  };

  const exportCSV = () => {
    if (candidates.length === 0) return;
    const headers = ["Full Name", "Email", "Phone", "DOB", "Qualification", "Grad Year", "Score", "Test Score", "Interview Status", "Aadhaar", "Offer Sent", "Exceptions Count", "Timestamp"];
    const rows = candidates.map(c => [
      c.fullName,
      c.email,
      `\t${c.phone}`, // Prefix with tab to force string in Excel
      c.dob,
      c.qualification,
      c.gradYear,
      c.score,
      c.testScore,
      c.interviewStatus,
      `\t${c.aadhaar}`, // Prefix with tab to force string in Excel
      c.offerSent,
      Object.keys(c.exceptions).length,
      c.timestamp
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "admitguard_audit.csv");
    link.click();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(candidates, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'admitguard_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // --- Dashboard Stats ---
  const stats = useMemo(() => {
    const total = candidates.length;
    const exceptions = candidates.filter(c => Object.keys(c.exceptions).length > 0).length;
    const flagged = candidates.filter(c => c.flagged).length;
    const rate = total > 0 ? ((exceptions / total) * 100).toFixed(1) : 0;
    
    return { total, exceptions, flagged, rate };
  }, [candidates]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">AdmitGuard</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Compliance System</p>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'form' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">Admission Form</span>
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <History size={18} />
                <span className="hidden sm:inline">Audit Log</span>
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-end gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">New Candidate Enrollment</h2>
                  <p className="text-slate-500 mt-1">Enter candidate details to verify eligibility against institutional rules.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                  {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <button 
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentStep === step.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${currentStep === step.id ? 'border-white/30 bg-white/20' : 'border-slate-200'}`}>
                          {step.id}
                        </span>
                        <span className="hidden md:inline">{step.title}</span>
                      </button>
                      {idx < steps.length - 1 && <div className="w-4 h-px bg-slate-200" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {formData.interviewStatus === 'Rejected' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-700"
                >
                  <AlertCircle size={20} />
                  <p className="font-bold">Rejected candidates cannot be enrolled.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-8 space-y-8">
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Info size={16} />
                        </div>
                        <h3 className="font-semibold text-slate-800">Personal Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Full Name <Badge>Strict</Badge>
                          </label>
                          <input 
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.fullName ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                            placeholder="e.g. John Doe"
                          />
                          {errors.fullName && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.fullName}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Email Address <Badge>Strict</Badge>
                          </label>
                          <input 
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.email ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                            placeholder="john@example.com"
                          />
                          {errors.email && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Phone Number <Badge>Strict</Badge>
                          </label>
                          <input 
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.phone ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                            placeholder="10-digit mobile"
                          />
                          {errors.phone && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Date of Birth <Badge variant="warning">Soft</Badge>
                          </label>
                          <input 
                            type="date"
                            value={formData.dob}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.dob ? 'border-amber-300 bg-amber-50 focus:ring-amber-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                          />
                          {errors.dob && (
                            <div className="space-y-2 mt-2">
                              <p className="text-xs text-amber-700 font-medium flex items-center gap-1"><AlertTriangle size={12}/> {errors.dob}</p>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={!!formData.exceptions?.dob}
                                  onChange={() => handleExceptionToggle('dob')}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">Request Exception</span>
                              </label>
                              {formData.exceptions?.dob !== undefined && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                  <textarea 
                                    value={formData.exceptions.dob}
                                    onChange={(e) => handleRationaleChange('dob', e.target.value)}
                                    placeholder="Enter rationale (min 30 chars, include keywords like 'approved by')..."
                                    className={`w-full p-3 text-xs rounded-xl border outline-none focus:ring-2 ${validateRationale(formData.exceptions.dob || '') ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100' : 'border-slate-200 focus:ring-indigo-100'}`}
                                    rows={3}
                                  />
                                  <div className="flex justify-between items-center px-1">
                                    <span className={`text-[10px] font-bold ${formData.exceptions.dob?.length >= 30 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                      {formData.exceptions.dob?.length || 0}/30 chars
                                    </span>
                                    {validateRationale(formData.exceptions.dob || '') && (
                                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Rationale Valid
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button 
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                        >
                          Next Step <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Academic Info */}
                  {currentStep === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <ShieldCheck size={16} />
                        </div>
                        <h3 className="font-semibold text-slate-800">Academic & Eligibility</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Highest Qualification <Badge>Strict</Badge>
                          </label>
                          <select 
                            value={formData.qualification}
                            onChange={(e) => handleInputChange('qualification', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                          >
                            <option value="">Select Degree</option>
                            {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Graduation Year <Badge variant="warning">Soft</Badge>
                          </label>
                          <input 
                            type="number"
                            value={formData.gradYear === 0 ? '' : formData.gradYear}
                            onChange={(e) => handleInputChange('gradYear', parseInt(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.gradYear ? 'border-amber-300 bg-amber-50 focus:ring-amber-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                          />
                          {errors.gradYear && (
                            <div className="space-y-2 mt-2">
                              <p className="text-xs text-amber-700 font-medium flex items-center gap-1"><AlertTriangle size={12}/> {errors.gradYear}</p>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={!!formData.exceptions?.gradYear}
                                  onChange={() => handleExceptionToggle('gradYear')}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">Request Exception</span>
                              </label>
                              {formData.exceptions?.gradYear !== undefined && (
                                <textarea 
                                  value={formData.exceptions.gradYear}
                                  onChange={(e) => handleRationaleChange('gradYear', e.target.value)}
                                  placeholder="Enter rationale..."
                                  className={`w-full p-3 text-xs rounded-xl border outline-none focus:ring-2 ${validateRationale(formData.exceptions.gradYear || '') ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100' : 'border-slate-200 focus:ring-indigo-100'}`}
                                  rows={2}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700">
                              {formData.scoreType} <Badge variant="warning">Soft</Badge>
                            </label>
                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button 
                                type="button"
                                onClick={() => handleInputChange('scoreType', 'Percentage')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${formData.scoreType === 'Percentage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                              >
                                %
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleInputChange('scoreType', 'CGPA')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${formData.scoreType === 'CGPA' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                              >
                                CGPA
                              </button>
                            </div>
                          </div>
                          <input 
                            type="number"
                            step="0.01"
                            value={formData.score === 0 ? '' : formData.score}
                            onChange={(e) => handleInputChange('score', parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.score ? 'border-amber-300 bg-amber-50 focus:ring-amber-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                          />
                          {errors.score && (
                            <div className="space-y-2 mt-2">
                              <p className="text-xs text-amber-700 font-medium flex items-center gap-1"><AlertTriangle size={12}/> {errors.score}</p>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={!!formData.exceptions?.score}
                                  onChange={() => handleExceptionToggle('score')}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">Request Exception</span>
                              </label>
                              {formData.exceptions?.score !== undefined && (
                                <textarea 
                                  value={formData.exceptions.score}
                                  onChange={(e) => handleRationaleChange('score', e.target.value)}
                                  placeholder="Enter rationale..."
                                  className={`w-full p-3 text-xs rounded-xl border outline-none focus:ring-2 ${validateRationale(formData.exceptions.score || '') ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100' : 'border-slate-200 focus:ring-indigo-100'}`}
                                  rows={2}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Screening Score (0-100) <Badge variant="warning">Soft</Badge>
                          </label>
                          <input 
                            type="number"
                            value={formData.testScore === 0 ? '' : formData.testScore}
                            onChange={(e) => handleInputChange('testScore', parseInt(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.testScore ? 'border-amber-300 bg-amber-50 focus:ring-amber-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                          />
                          {errors.testScore && (
                            <div className="space-y-2 mt-2">
                              <p className="text-xs text-amber-700 font-medium flex items-center gap-1"><AlertTriangle size={12}/> {errors.testScore}</p>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={!!formData.exceptions?.testScore}
                                  onChange={() => handleExceptionToggle('testScore')}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">Request Exception</span>
                              </label>
                              {formData.exceptions?.testScore !== undefined && (
                                <textarea 
                                  value={formData.exceptions.testScore}
                                  onChange={(e) => handleRationaleChange('testScore', e.target.value)}
                                  placeholder="Enter rationale..."
                                  className={`w-full p-3 text-xs rounded-xl border outline-none focus:ring-2 ${validateRationale(formData.exceptions.testScore || '') ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100' : 'border-slate-200 focus:ring-indigo-100'}`}
                                  rows={2}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between pt-4">
                        <button 
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                          Back
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                        >
                          Next Step <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Compliance */}
                  {currentStep === 3 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <ShieldCheck size={16} />
                        </div>
                        <h3 className="font-semibold text-slate-800">Compliance & Status</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Aadhaar Number <Badge>Strict</Badge>
                          </label>
                          <input 
                            type="text"
                            value={formData.aadhaar}
                            onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.aadhaar ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                            placeholder="12-digit Aadhaar"
                          />
                          {errors.aadhaar && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.aadhaar}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Interview Status <Badge>Strict</Badge>
                          </label>
                          <select 
                            value={formData.interviewStatus}
                            onChange={(e) => handleInputChange('interviewStatus', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.interviewStatus ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                          >
                            <option value="">Select Status</option>
                            {INTERVIEW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {errors.interviewStatus && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.interviewStatus}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex justify-between">
                            Offer Letter Sent? <Badge>Strict</Badge>
                          </label>
                          <select 
                            value={formData.offerSent}
                            onChange={(e) => handleInputChange('offerSent', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none focus:ring-2 ${errors.offerSent ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                          {errors.offerSent && <p className="text-xs text-rose-600 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors.offerSent}</p>}
                        </div>

                        <div className="space-y-1.5 flex items-end pb-1">
                          <label className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer group w-full transition-all hover:bg-rose-100">
                            <input 
                              type="checkbox" 
                              checked={!!formData.flagged}
                              onChange={(e) => handleInputChange('flagged', e.target.checked)}
                              className="w-5 h-5 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-rose-700">Flag for Manual Review</span>
                              <span className="text-[10px] text-rose-500 font-medium">Mark this entry as suspicious or requiring attention</span>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-between pt-4">
                        <button 
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                          Back
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Summary & Submission */}
                  <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Exceptions</p>
                        <p className={`text-xl font-black ${(Object.keys(formData.exceptions || {}).length > 2 || formData.flagged) ? 'text-rose-600' : 'text-slate-900'}`}>
                          {Object.keys(formData.exceptions || {}).length}
                        </p>
                      </div>
                      {(Object.keys(formData.exceptions || {}).length > 2 || formData.flagged) && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 animate-pulse">
                          <AlertTriangle size={14} />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {formData.flagged ? 'Manual Review Flagged' : 'Manager Review Required'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={!canSubmit}
                      className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-white transition-all shadow-xl flex items-center justify-center gap-2 ${canSubmit ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-0.5' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
                    >
                      {canSubmit ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                      Submit Candidate
                    </button>
                  </div>
                </Card>
              </form>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div 
              key="audit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Audit Log</h2>
                  <p className="text-slate-500 mt-1">Transaction history of all candidate enrollments and exceptions.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                  <button 
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Download size={18} />
                    Export JSON
                  </button>
                </div>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Candidate</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Exceptions</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {candidates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No records found.</td>
                        </tr>
                      ) : (
                        candidates.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                                  {c.fullName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{c.fullName}</p>
                                  <p className="text-xs text-slate-500">{c.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={c.interviewStatus === 'Cleared' ? 'success' : 'warning'}>
                                {c.interviewStatus}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${Object.keys(c.exceptions).length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                  {Object.keys(c.exceptions).length}
                                </span>
                                {c.flagged && <Badge variant="error">Flagged</Badge>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-slate-500 font-medium">
                                {new Date(c.timestamp).toLocaleDateString()}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(c.timestamp).toLocaleTimeString()}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => deleteCandidate(c.id)}
                                className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Operations Dashboard</h2>
                <p className="text-slate-500 mt-1">Real-time metrics on admission pipeline health and compliance.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Submissions</p>
                  <p className="text-4xl font-black text-slate-900">{stats.total}</p>
                  <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={14} />
                    <span>Live data</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Exception Rate</p>
                  <p className="text-4xl font-black text-slate-900">{stats.rate}%</p>
                  <div className="mt-4 flex items-center gap-1 text-amber-600 text-xs font-bold">
                    <AlertTriangle size={14} />
                    <span>Requires monitoring</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Flagged Entries</p>
                  <p className="text-4xl font-black text-rose-600">{stats.flagged}</p>
                  <div className="mt-4 flex items-center gap-1 text-rose-600 text-xs font-bold">
                    <AlertCircle size={14} />
                    <span>Critical review needed</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">System Status</p>
                  <p className="text-4xl font-black text-emerald-600">Active</p>
                  <div className="mt-4 flex items-center gap-1 text-slate-400 text-xs font-bold">
                    <ShieldCheck size={14} />
                    <span>Rules enforced</span>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-500" />
                    Recent Exceptions
                  </h3>
                  <div className="space-y-4">
                    {candidates.filter(c => Object.keys(c.exceptions).length > 0).slice(0, 5).map(c => (
                      <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-900">{c.fullName}</p>
                          <Badge variant="warning">{Object.keys(c.exceptions).length} Exceptions</Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                          "{Object.values(c.exceptions)[0]}"
                        </p>
                      </div>
                    ))}
                    {candidates.filter(c => Object.keys(c.exceptions).length > 0).length === 0 && (
                      <p className="text-center text-slate-400 py-8 italic">No exceptions recorded.</p>
                    )}
                  </div>
                </Card>

                <Card className="p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-indigo-500" />
                    Compliance Summary
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-600">Strict Rule Adherence</span>
                        <span className="text-emerald-600">100%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-600">Soft Rule Compliance</span>
                        <span className="text-amber-600">{100 - parseFloat(stats.rate as string)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${100 - parseFloat(stats.rate as string)}%` }} />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        System is enforcing <span className="font-bold text-slate-900">11 active rules</span>. 
                        Rationales are being validated for minimum length and keyword presence. 
                        Manager flags are triggered at <span className="font-bold text-slate-900">3+ exceptions</span>.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccess(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Submission Successful</h3>
              <p className="text-slate-500 mb-8">Candidate data has been validated and recorded in the audit log.</p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck size={16} />
            <p className="text-xs font-bold uppercase tracking-widest">AdmitGuard v1.0.0</p>
          </div>
          <p className="text-xs text-slate-400 font-medium">Built for IIT Gandhinagar PG Diploma AI-ML Orientation</p>
        </div>
      </footer>
    </div>
  );
}
