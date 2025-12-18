'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { NeoCard, NeoButton, NeoInput, NeoModal, NeoBadge } from '@/components/ui/neo';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { jobsAPI } from '@/lib/api';

const INITIAL_FORM_STATE = {
    id: '',
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    workType: 'On-site',
    company: '',
    department: '',
    skillsRequired: [],
    experienceLevel: 'Mid',
    salaryMin: 0,
    salaryMax: 0,
    currency: 'USD',
    applicationDeadline: '',
    openings: 1,
    status: 'Active',
    industry: '',
    benefits: [],
    educationRequired: '',
    postedBy: 'r1',
    applicantsCount: 0
};

export default function RecruiterJobs() {
  const { user, fetchProfile } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch profile on mount to ensure we have the latest jobs
  useEffect(() => {
    fetchProfile('recruiter');
  }, []);

  // Sync jobs from user profile
  useEffect(() => {
    if (user && user.jobs) {
        const mappedJobs = user.jobs.map(j => ({
            ...j,
            id: j._id || j.id, // Ensure ID availability
            // Map nested salary object to flat structure for form/display consistency
            salaryMin: j.salary?.min || 0,
            salaryMax: j.salary?.max || 0,
            currency: j.salary?.currency || 'USD',
            // Prefer the applications array if populated with rich data, otherwise appliedBy
            applicantsCount: j.applications?.length || j.appliedBy?.length || 0,
            // Ensure we have an array to iterate over. Priority: applications (rich data) -> appliedBy (ids) -> empty
            applications: (j.applications && j.applications.length > 0) ? j.applications : (j.appliedBy || [])
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(mappedJobs);
    }
  }, [user]);

  const filteredJobs = jobs.filter(job => 
    (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (job.department && job.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedJobs = filteredJobs; // Show all filtered jobs

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    // Allow empty string for numeric fields so users can clear them
    const val = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleArrayInput = (e, field) => {
      const values = e.target.value.split(',').map(s => s.trim());
      setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleViewCandidates = (jobId) => {
      setSelectedJobId(jobId);
      setCandidateModalOpen(true);
  };

  const handleOpenCreate = () => {
      setFormData(INITIAL_FORM_STATE);
      setIsEditing(false);
      setIsModalOpen(true);
  };

  const handleOpenEdit = async (job) => {
      setIsEditing(true);
      setIsModalOpen(true);
      setIsFormLoading(true);
      setError('');

      try {
          const res = await jobsAPI.getById(job.id);
          const jobData = res.data || res;
          
          setFormData({
              ...INITIAL_FORM_STATE,
              ...jobData,
              id: jobData._id || jobData.id,
              // Map nested objects if they exist
              salaryMin: jobData.salary?.min || jobData.salaryMin || 0,
              salaryMax: jobData.salary?.max || jobData.salaryMax || 0,
              currency: jobData.salary?.currency || jobData.currency || 'USD',
              company: jobData.companyName || jobData.company || '',
          });
      } catch (err) {
          console.error("Error fetching job details:", err);
          setError("Failed to load job details. Please try again.");
          // Fallback to local data if API fails
          setFormData({
              ...INITIAL_FORM_STATE,
              ...job,
              company: job.companyName || job.company || '',
          });
      } finally {
          setIsFormLoading(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);
    setError('');

    try {
        // Validation
        if (!formData.title || !formData.company || !formData.description) {
            setError("Title, Company, and Description are required.");
            setIsFormLoading(false);
            return;
        }

        const payload = {
            ...formData,
            salary: {
                min: Number(formData.salaryMin) || 0,
                max: Number(formData.salaryMax) || 0,
                currency: formData.currency || 'USD'
            },
            companyName: formData.company
        };

        if (isEditing) {
            await jobsAPI.update(formData.id, payload);
            setSuccessMessage('Job updated successfully!');
        } else {
            const res = await jobsAPI.create(payload);
            if (res.success === false) {
                throw new Error(res.error || "Failed to create job");
            }
            setSuccessMessage('Job posted successfully!');
        }
        
        // Refresh profile to get updated job list
        const profileRes = await fetchProfile('recruiter');
        if (!profileRes.success) {
            console.warn("Profile refresh failed:", profileRes.error);
        }
        
        setIsModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
        console.error("Error saving job:", err);
        setError(err.message || err.response?.data?.message || "Failed to save job. Please try again.");
    } finally {
        setIsFormLoading(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <AuthGuard allowedRoles={['recruiter']}>
    <div className="max-w-6xl mx-auto px-4 py-8">
      {successMessage && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right-5">
          <div className="bg-neo-green border-2 border-neo-black dark:border-white px-6 py-3 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff]">
            <p className="text-white font-bold">{successMessage}</p>
          </div>
        </div>
      )}
      
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-4 border-neo-black dark:border-white pb-4 gap-4">
        <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-2 dark:text-white">Job <span className="text-neo-orange">Management</span></h1>
            <p className="font-mono text-gray-600 dark:text-gray-400 font-bold">Manage postings and view applicants</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end">
            <div className="w-full sm:w-64">
                <label className="block text-xs font-black uppercase mb-1 dark:text-white">Search Jobs / Dept</label>
                <NeoInput 
                    placeholder="Search..." 
                    className="border-4 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <NeoButton onClick={handleOpenCreate} className="bg-neo-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-neo-md h-12 whitespace-nowrap">+ POST JOB</NeoButton>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {displayedJobs.length === 0 ? (
            <div className="text-center py-12 border-4 border-dashed border-gray-300 dark:border-zinc-700 font-mono text-gray-400 bg-gray-50 dark:bg-zinc-900">
                NO JOBS FOUND.
            </div>
        ) : (
            displayedJobs.map(job => (
                <NeoCard key={job.id} className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-4 shadow-neo-md hover:shadow-neo-lg transition-all hover:translate-x-1 gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black uppercase dark:text-white">{job.title}</h3>
                            <span className={`text-xs font-bold px-3 py-1 border-2 border-black rounded-full dark:border-white ${job.status === 'active' || job.status === 'Active' ? 'bg-neo-green text-white' : job.status === 'Draft' ? 'bg-neo-yellow text-black' : 'bg-gray-200 text-gray-500'}`}>
                                {job.status}
                            </span>
                        </div>
                        <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-2">{job.companyName || job.company} • {job.location}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs font-mono font-bold bg-neo-yellow text-black px-2 py-1 border-2 border-black uppercase">
                                Dept: {job.department}
                            </span>
                            <span className="text-xs font-mono font-bold bg-neo-black text-white px-2 py-1 border-2 border-black dark:border-white">
                                {job.applicantsCount} Candidates
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto">
                        <NeoButton variant="secondary" onClick={() => handleOpenEdit(job)} className="text-sm font-bold flex-1 lg:flex-none">EDIT</NeoButton>
                        <NeoButton 
                                className="bg-neo-blue text-white border-neo-black dark:border-white text-sm font-bold flex-1 lg:flex-none hover:bg-blue-400 shadow-neo-sm h-full"
                                onClick={() => handleViewCandidates(job.id)}
                            >
                                VIEW TALENT
                            </NeoButton>
                    </div>
                </NeoCard>
            ))
        )}
      </div>

      {/* CREATE/EDIT JOB MODAL */}
      <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "EDIT JOB POST" : "CREATE NEW JOB POST"} maxWidth="max-w-4xl">
          {isFormLoading && !formData.title && isEditing ? (
              <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-neo-orange border-t-transparent"></div>
              </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            {error && (
                <div className="bg-red-50 border-2 border-red-500 p-3 mb-4 text-red-700 font-bold">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Job Title *</label>
                    <NeoInput name="title" value={formData.title ?? ''} onChange={handleInputChange} required className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Company Name *</label>
                    <NeoInput name="company" value={formData.company || formData.companyName || ''} onChange={handleInputChange} required className="border-4" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Department</label>
                    <NeoInput name="department" value={formData.department ?? ''} onChange={handleInputChange} className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Industry</label>
                    <NeoInput name="industry" value={formData.industry ?? ''} onChange={handleInputChange} className="border-4" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Location</label>
                    <NeoInput name="location" value={formData.location ?? ''} onChange={handleInputChange} className="border-4" />
                </div>
                <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Job Type</label>
                    <select name="jobType" value={formData.jobType || 'Full-time'} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Work Type</label>
                    <select name="workType" value={formData.workType || 'On-site'} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow">
                        <option value="On-site">On-site</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block font-black uppercase mb-1 text-xs dark:text-white">Job Description *</label>
                <textarea name="description" value={formData.description ?? ''} onChange={handleInputChange} className="w-full h-40 bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-neo-orange placeholder:text-gray-400" placeholder="Describe the role..." required></textarea>
            </div>

            <div>
                <label className="block font-black uppercase mb-1 text-xs dark:text-white">Skills Required (Comma separated)</label>
                <NeoInput name="skillsRequired" value={Array.isArray(formData.skillsRequired) ? formData.skillsRequired.join(', ') : (formData.skillsRequired || '')} onChange={(e) => handleArrayInput(e, 'skillsRequired')} className="border-4" />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Experience Level</label>
                    <select name="experienceLevel" value={formData.experienceLevel || 'Mid'} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow">
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Executive">Executive</option>
                    </select>
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Education Required</label>
                    <NeoInput name="educationRequired" value={formData.educationRequired ?? ''} onChange={handleInputChange} className="border-4" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Min Salary</label>
                    <NeoInput type="number" name="salaryMin" value={formData.salaryMin} onChange={handleInputChange} className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Max Salary</label>
                    <NeoInput type="number" name="salaryMax" value={formData.salaryMax} onChange={handleInputChange} className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Currency</label>
                    <NeoInput name="currency" value={formData.currency ?? ''} onChange={handleInputChange} className="border-4" placeholder="USD" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Deadline</label>
                    <NeoInput 
                        type="date" 
                        name="applicationDeadline" 
                        value={formData.applicationDeadline ? formData.applicationDeadline.split('T')[0] : ''} 
                        onChange={handleInputChange} 
                        min={new Date().toISOString().split('T')[0]}
                        className="border-4" 
                    />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Openings</label>
                    <NeoInput type="number" name="openings" value={formData.openings} onChange={handleInputChange} className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Status</label>
                     <select name="status" value={formData.status || 'Draft'} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow">
                        <option value="Active">Active</option>
                        {/* <option value="Draft">Draft</option> */}
                        {/* <option value="Paused">Paused</option> */}
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

             <div>
                <label className="block font-black uppercase mb-1 text-xs dark:text-white">Benefits (Comma separated)</label>
                <NeoInput name="benefits" value={Array.isArray(formData.benefits) ? formData.benefits.join(', ') : (formData.benefits || '')} onChange={(e) => handleArrayInput(e, 'benefits')} className="border-4" />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t-2 border-gray-100 dark:border-zinc-700">
                <NeoButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isFormLoading}>CANCEL</NeoButton>
                <NeoButton type="submit" className="bg-neo-orange text-white border-neo-black" isLoading={isFormLoading} disabled={isFormLoading}>
                    {isEditing ? 'UPDATE JOB' : 'PUBLISH JOB'}
                </NeoButton>
            </div>
         </form>
         )}
      </NeoModal>

      {/* CANDIDATE LIST MODAL */}
      <NeoModal 
        isOpen={candidateModalOpen} 
        onClose={() => setCandidateModalOpen(false)} 
        title={selectedJob ? `APPS FOR: ${selectedJob.title}` : 'CANDIDATES'} 
        maxWidth="max-w-5xl"
        contentClassName="no-scrollbar"
      >
           <div className="p-2">
             <div className="mb-6 bg-neo-black text-white p-6 border-2 border-neo-black shadow-[4px_4px_0px_0px_#54A0FF] flex justify-between items-center dark:border-white">
                 <div>
                     <p className="font-mono text-xs font-bold uppercase tracking-widest text-neo-blue mb-1">AI ANALYSIS COMPLETE</p>
                     <p className="font-bold text-lg">Candidates sorted by relevance.</p>
                 </div>
                 <div className="text-right">
                     <span className="text-4xl font-black text-neo-yellow">{selectedJob?.applicantsCount || 0}</span>
                     <span className="block text-xs uppercase font-bold">Applicants</span>
                 </div>
             </div>
             
             <div className="space-y-6">
                {selectedJob?.applications && selectedJob.applications.length > 0 ? (
                    selectedJob.applications.map((app, index) => {
                        // Helper to safely extract data regardless of slight structure variations
                        const getSafeData = (source) => {
                            // 1. Try standard structure (from recent JSON)
                            if (source.applicant && typeof source.applicant === 'object') {
                                return {
                                    id: source.applicant._id || index,
                                    name: source.applicant.fullName || "Candidate",
                                    title: source.applicant.currentJobTitle || "Applicant",
                                    image: source.applicant.profilePicture,
                                    score: source.aiMatchScore?.overallScore || 0,
                                    insights: source.aiMatchScore?.insights || "No AI insights available.",
                                    status: source.status || "Applied"
                                };
                            }
                            // 2. Fallback: Maybe 'app' IS the applicant object (legacy/flat)
                            return {
                                id: source._id || index,
                                name: source.fullName || source.name || "Candidate",
                                title: source.currentJobTitle || source.title || "Applicant",
                                image: source.profilePicture,
                                score: source.score || 0,
                                insights: source.summary || source.insights || "No AI insights available.",
                                status: source.status || "Applied"
                            };
                        };

                        const data = getSafeData(app);

                        return (
                            <div key={data.id} className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white p-6 shadow-sm hover:shadow-neo transition-all relative group grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Left Column: Avatar & Info */}
                                <div className="md:col-span-5 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-gray-100 dark:border-zinc-700 pb-4 md:pb-0 md:pr-4">
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            {data.image ? (
                                                <img src={data.image} alt={data.name} className="w-12 h-12 rounded-full border-2 border-neo-black object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-neo-yellow border-2 border-neo-black rounded-full flex items-center justify-center font-black text-xl text-black">
                                                    {data.name.charAt(0)}
                                                </div>
                                            )}
                                            
                                            <div className="overflow-hidden">
                                                <h4 className="font-black text-md uppercase tracking-tighter leading-none dark:text-white truncate" title={data.name}>{data.name}</h4>
                                                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1">{data.title}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-1 border border-black ${data.status === 'Applied' ? 'bg-neo-yellow text-black' : data.status === 'Accepted' ? 'bg-neo-green text-white' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'}`}>
                                            {data.status}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">MATCH SCORE</span>
                                        <div className={`text-5xl font-black leading-none ${data.score > 70 ? 'text-neo-green' : data.score > 40 ? 'text-neo-yellow' : 'text-red-500'}`}>
                                            {data.score}%
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Middle Column: AI Summary */}
                                <div className="md:col-span-4 bg-gray-50 dark:bg-zinc-800 p-4 border-l-4 border-neo-black dark:border-white flex flex-col justify-center">
                                    <span className="font-black text-[10px] uppercase text-neo-black dark:text-white mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-neo-blue rounded-full"></span>
                                        AI Insight
                                    </span>
                                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium line-clamp-6">
                                        "{data.insights}"
                                    </p>
                                </div>

                                {/* Right Column: Actions */}
                                <div className="md:col-span-3 flex flex-col gap-2 justify-center">
                                    <button className="w-full bg-neo-black text-white font-black py-3 text-xs border-2 border-neo-black dark:border-white hover:bg-gray-800 dark:hover:bg-zinc-700 uppercase tracking-wider shadow-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                                        <span>📅</span> Schedule
                                    </button>
                                    <button className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white font-black py-3 text-xs border-2 border-neo-black dark:border-white hover:bg-gray-50 dark:hover:bg-zinc-800 uppercase tracking-wider shadow-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                                        <span>📄</span> Profile
                                    </button>
                                    <button className="w-full border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-black py-2 text-xs uppercase tracking-wider active:translate-y-0.5 transition-all">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-gray-500 font-mono">
                        No applications received yet.
                    </div>
                )}
             </div>
          </div>
          {/* <div className="mt-8 pt-4 border-t-4 border-neo-black dark:border-white flex justify-end items-center bg-gray-50 dark:bg-zinc-800 -mx-6 -mb-6 px-6 py-4">
              <NeoButton variant="secondary" onClick={() => setCandidateModalOpen(false)} className="text-sm py-3 px-8">CLOSE VIEWER</NeoButton>
          </div> */}
      </NeoModal>
    </div>
    </AuthGuard>
  );
}
