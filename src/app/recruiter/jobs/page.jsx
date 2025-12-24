'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { NeoCard, NeoButton, NeoInput, NeoModal, NeoBadge } from '@/components/ui/neo';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { jobsAPI, recruiterAPI } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [expandedInsightId, setExpandedInsightId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [currentAppPage, setCurrentAppPage] = useState(1);
  const appPageSize = 5;
  
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

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayedJobs = filteredJobs.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      setCurrentAppPage(1); // Reset modal pagination
      setCandidateModalOpen(true);
  };

  const handleUpdateStatus = async (jobId, applicationId, status) => {
    // Validate applicationId before making API call
    if (!applicationId || applicationId === 'undefined' || applicationId === undefined) {
      console.error('Invalid application ID:', applicationId);
      setError('Could not identify the application. Please refresh and try again.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      setError('');
      await recruiterAPI.updateApplicationStatus(jobId, applicationId, status);
      setSuccessMessage(`Candidate ${status.toLowerCase()} successfully!`);
      
      // Refresh profile to get updated applications
      await fetchProfile('recruiter');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating application status:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update status. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-6 py-6 border-t-2 border-gray-100 dark:border-zinc-800">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#fff] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neo-yellow dark:hover:bg-neo-yellow dark:hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center border-2 font-black text-sm transition-all ${
                    currentPage === page 
                    ? "bg-neo-blue text-white border-neo-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]" 
                    : "bg-white dark:bg-zinc-800 text-neo-black dark:text-white border-neo-black dark:border-white hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#fff]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#fff] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neo-yellow dark:hover:bg-neo-yellow dark:hover:text-black transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
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
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Department *</label>
                    <NeoInput name="department" value={formData.department ?? ''} onChange={handleInputChange} required className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Industry *</label>
                    <NeoInput name="industry" value={formData.industry ?? ''} onChange={handleInputChange}required className="border-4" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Location *</label>
                    <NeoInput name="location" value={formData.location ?? ''} onChange={handleInputChange} required className="border-4" />
                </div>
                <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Job Type *</label>
                    <select name="jobType" value={formData.jobType || 'Full-time'} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow" required>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Work Type *</label>
                    <select name="workType" value={formData.workType || 'On-site'} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow" required>
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
                <label className="block font-black uppercase mb-1 text-xs dark:text-white">Skills Required (Comma separated) *</label>
                <NeoInput name="skillsRequired" value={Array.isArray(formData.skillsRequired) ? formData.skillsRequired.join(', ') : (formData.skillsRequired || '')} onChange={(e) => handleArrayInput(e, 'skillsRequired')} required className="border-4" />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Experience Level *</label>
                    <select name="experienceLevel" value={formData.experienceLevel || 'Mid'} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow" required>
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Executive">Executive</option>
                    </select>
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Education Required *</label>
                    <NeoInput name="educationRequired" value={formData.educationRequired ?? ''} onChange={handleInputChange} className="border-4" required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Min Salary *</label>
                    <NeoInput type="number" name="salaryMin" value={formData.salaryMin} onChange={handleInputChange} required className="border-4"  />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Max Salary *</label>
                    <NeoInput type="number" name="salaryMax" value={formData.salaryMax} onChange={handleInputChange} required className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Currency *</label>
                    <NeoInput name="currency" value={formData.currency ?? ''} onChange={handleInputChange} className="border-4" required placeholder="USD" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Deadline *</label>
                    <NeoInput 
                        type="date" 
                        name="applicationDeadline" 
                        value={formData.applicationDeadline ? formData.applicationDeadline.split('T')[0] : ''} 
                        onChange={handleInputChange} 
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="border-4" 
                    />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Openings *</label>
                    <NeoInput type="number" name="openings" value={formData.openings} onChange={handleInputChange} required className="border-4" />
                </div>
                 <div>
                    <label className="block font-black uppercase mb-1 text-xs dark:text-white">Status *</label>
                     <select name="status" value={formData.status || 'Draft'} onChange={handleInputChange} required className="w-full bg-white dark:bg-zinc-800 dark:text-white border-4 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow">
                        <option value="Active">Active</option>
                        {/* <option value="Draft">Draft</option> */}
                        {/* <option value="Paused">Paused</option> */}
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

             <div>
                <label className="block font-black uppercase mb-1 text-xs dark:text-white">Benefits (Comma separated) *</label>
                <NeoInput name="benefits" value={Array.isArray(formData.benefits) ? formData.benefits.join(', ') : (formData.benefits || '')} onChange={(e) => handleArrayInput(e, 'benefits')} required className="border-4" />
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
             {error && (
               <div className="mb-4 bg-red-50 border-2 border-red-500 p-3 text-red-700 font-bold">
                 {error}
               </div>
             )}
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
                  <>
                    {(() => {
                      const allApps = selectedJob.applications;
                      const paginatedApps = allApps.slice((currentAppPage - 1) * appPageSize, currentAppPage * appPageSize);

                      return (
                        <>
                          {paginatedApps.map((app, index) => {
                            // Helper to safely extract data regardless of slight structure variations
                            const getSafeData = (source) => {
                              const findApplicationId = (src) => {
                                if (src._id) return src._id;
                                if (src.id) return src.id;
                                if (src.application?._id) return src.application._id;
                                if (src.application?.id) return src.application.id;
                                if (src.applicant?._id) return src.applicant._id;
                                if (src.applicant?.id) return src.applicant.id;
                                return null;
                              };
                              
                              const applicationId = findApplicationId(source);
                              
                              if (source.applicant && typeof source.applicant === 'object') {
                                return {
                                  id: source.applicant._id || `app-${index}`,
                                  applicationId: applicationId,
                                  name: source.applicant.fullName || "Candidate",
                                  title: source.applicant.currentJobTitle || "Applicant",
                                  image: source.applicant.profilePicture,
                                  score: source.aiMatchScore?.overallScore || 0,
                                  insights: source.aiMatchScore?.insights || "No AI insights available.",
                                  status: source.status || "Applied",
                                  resume: source.applicant.resume || source.resume
                                };
                              }
                              return {
                                id: source._id || `app-${index}`,
                                applicationId: applicationId,
                                name: source.fullName || source.name || "Candidate",
                                title: source.currentJobTitle || source.title || "Applicant",
                                image: source.profilePicture,
                                score: source.score || 0,
                                insights: source.summary || source.insights || "No AI insights available.",
                                status: source.status || "Applied",
                                resume: source.resume || source.applicant?.resume
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
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={`inline-block text-[10px] font-black uppercase px-2 py-1 border border-black ${
                                        data.status === 'Applied' ? 'bg-gray-200 text-neo-black dark:bg-zinc-700 dark:text-white' : 
                                        data.status === 'Pending' ? 'bg-neo-yellow text-black' :
                                        data.status === 'Shortlist' ? 'bg-neo-blue text-white' :
                                        data.status === 'Accept' ? 'bg-neo-green text-white' : 
                                        data.status === 'Reject' ? 'bg-red-500 text-white' :
                                        'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'
                                      }`}>
                                        {data.status}
                                      </span>
                                      {data.resume && (
                                        <a href={data.resume} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase px-2 py-1 border-2 border-neo-black bg-white dark:bg-zinc-800 dark:text-white hover:bg-neo-blue hover:text-white transition-colors flex items-center gap-1 shadow-neo-sm active:translate-y-0.5 active:shadow-none">
                                          📄 RESUME
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">MATCH SCORE</span>
                                    <div className={`text-5xl font-black leading-none ${data.score > 70 ? 'text-neo-green' : data.score > 40 ? 'text-neo-yellow' : 'text-red-500'}`}>
                                      {data.score}%
                                    </div>
                                  </div>
                                </div>
                                {/* Middle Column: AI Summary */}
                                <div className={`md:col-span-4 bg-gray-50 dark:bg-zinc-800 p-4 border-l-4 border-neo-black dark:border-white flex flex-col ${expandedInsightId === data.id ? '' : 'justify-center'} transition-all`}>
                                  <span className="font-black text-[10px] uppercase text-neo-black dark:text-white mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-neo-blue rounded-full"></span>
                                    AI Insight
                                  </span>
                                  <p className={`font-mono text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium ${expandedInsightId === data.id ? '' : 'line-clamp-6'}`}>
                                    "{data.insights}"
                                  </p>
                                  {data.insights && data.insights.length > 250 && (
                                    <button onClick={() => setExpandedInsightId(expandedInsightId === data.id ? null : data.id)} className="text-[10px] font-black uppercase text-neo-blue hover:text-blue-600 mt-2 text-left w-fit transition-colors">
                                      {expandedInsightId === data.id ? 'SHOW LESS ▲' : 'VIEW FULL INSIGHT ▼'}
                                    </button>
                                  )}
                                </div>
                                {/* Right Column: Actions */}
                                <div className="md:col-span-3 flex flex-col gap-2 justify-center">
                                  <button className="w-full bg-neo-black text-white font-black py-2.5 text-xs border-2 border-neo-black dark:border-white hover:bg-gray-800 dark:hover:bg-zinc-700 uppercase tracking-wider shadow-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                                    <span>📅</span> Schedule
                                  </button>
                                  <button className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white font-black py-2.5 text-xs border-2 border-neo-black dark:border-white hover:bg-gray-50 dark:hover:bg-zinc-800 uppercase tracking-wider shadow-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                                    <span>📄</span> Profile
                                  </button>
                                  <div className="border-t border-gray-200 dark:border-zinc-700 my-1"></div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleUpdateStatus(selectedJobId, data.applicationId, 'Pending')} className={`py-2 text-[10px] font-black uppercase tracking-wider border-2 transition-all active:translate-y-0.5 flex items-center justify-center gap-1 ${data.status === 'Pending' ? 'bg-neo-yellow text-black border-neo-black cursor-default' : 'bg-white dark:bg-zinc-900 text-neo-black dark:text-white border-neo-black dark:border-white hover:bg-neo-yellow hover:text-black'} ${data.status === 'Accept' || data.status === 'Reject' ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={data.status === 'Pending' || data.status === 'Accept' || data.status === 'Reject'}>
                                      ⏳ Pending
                                    </button>
                                    <button onClick={() => handleUpdateStatus(selectedJobId, data.applicationId, 'Shortlist')} className={`py-2 text-[10px] font-black uppercase tracking-wider border-2 transition-all active:translate-y-0.5 flex items-center justify-center gap-1 ${data.status === 'Shortlist' ? 'bg-neo-blue text-white border-neo-black cursor-default' : 'bg-white dark:bg-zinc-900 text-neo-black dark:text-white border-neo-black dark:border-white hover:bg-neo-blue hover:text-white'} ${data.status === 'Accept' || data.status === 'Reject' ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={data.status === 'Shortlist' || data.status === 'Accept' || data.status === 'Reject'}>
                                      📋 Shortlist
                                    </button>
                                  </div>
                                  <button onClick={() => handleUpdateStatus(selectedJobId, data.applicationId, 'Accept')} className={`w-full py-2.5 text-xs font-black uppercase tracking-wider border-2 transition-all active:translate-y-0.5 flex items-center justify-center gap-2 ${data.status === 'Accept' ? 'bg-neo-green text-white border-neo-black cursor-default shadow-neo-sm' : 'bg-neo-green text-white border-neo-black hover:bg-green-600 shadow-sm'} ${data.status === 'Reject' ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={data.status === 'Accept' || data.status === 'Reject'}>
                                    ✅ Accept
                                  </button>
                                  <button onClick={() => handleUpdateStatus(selectedJobId, data.applicationId, 'Reject')} className={`w-full py-2 text-xs font-black uppercase tracking-wider border-2 transition-all active:translate-y-0.5 flex items-center justify-center gap-2 ${data.status === 'Reject' ? 'bg-red-500 text-white border-red-500 cursor-default' : 'border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`} disabled={data.status === 'Reject' || data.status === 'Accept'}>
                                    ❌ Reject
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {Math.ceil(allApps.length / appPageSize) > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-2 mt-8 py-4 border-t-2 border-gray-100 dark:border-zinc-800">
                              <button onClick={() => setCurrentAppPage(prev => Math.max(1, prev - 1))} disabled={currentAppPage === 1} className="p-1.5 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#fff] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neo-yellow dark:hover:bg-neo-yellow dark:hover:text-black transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="flex gap-1.5">
                                {Array.from({ length: Math.ceil(allApps.length / appPageSize) }, (_, i) => i + 1).map(page => (
                                  <button key={page} onClick={() => setCurrentAppPage(page)} className={`w-8 h-8 flex items-center justify-center border-2 font-black text-xs transition-all ${currentAppPage === page ? "bg-neo-blue text-white border-neo-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]" : "bg-white dark:bg-zinc-800 text-neo-black dark:text-white border-neo-black dark:border-white hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1px_1px_0px_0px_#fff]"}`}>
                                    {page}
                                  </button>
                                ))}
                              </div>
                              <button onClick={() => setCurrentAppPage(prev => Math.min(Math.ceil(allApps.length / appPageSize), prev + 1))} disabled={currentAppPage === Math.ceil(allApps.length / appPageSize)} className="p-1.5 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#fff] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neo-yellow dark:hover:bg-neo-yellow dark:hover:text-black transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
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
