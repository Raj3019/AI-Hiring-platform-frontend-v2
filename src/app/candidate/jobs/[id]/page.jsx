'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { getMissingProfileFields } from '@/lib/utils';
import { jobsAPI } from '@/lib/api';
import { NeoCard, NeoButton, NeoBadge } from '@/components/ui/neo';

const formatFieldName = (field) => {
    const map = {
        'fullName': 'Full Name',
        'phone': 'Phone Number', 
        'dateOfBirth': 'Date of Birth',
        'gender': 'Gender',
        'currentCity': 'City',
        'state': 'State',
        'country': 'Country',
        'zipCode': 'Zip Code',
        'resumeFileURL': 'Resume',
        'skills': 'Skills',
        'languages': 'Languages',
        'education.tenth': '10th Education Details',
        'education.graduation': 'Graduation Details',
        'jobPreferences.jobType': 'Preferred Job Type',
        'jobPreferences.workMode': 'Preferred Work Mode'
    };
    return map[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, fetchProfile } = useAuthStore();
  const { jobs } = useDataStore();
  const [job, setJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  
  // Resume source: 'upload' for new upload, 'profile' for existing profile resume
  const [resumeSource, setResumeSource] = useState('upload');
  const [hasProfileResume, setHasProfileResume] = useState(false);
  const [profileResumeUrl, setProfileResumeUrl] = useState('');

  const [error, setError] = useState(null);

  // Color logic matching applications page
  const getStatusColor = (status) => {
    if (!status) return 'blue';
    const s = status.toLowerCase();
    
    if (s.includes('offer') || s.includes('accept') || s.includes('hired') || s.includes('selected')) return 'green';
    if (s.includes('reject')) return 'red';
    if (s.includes('shortlist')) return 'yellow';
    return 'blue';
  };

  useEffect(() => {
    const fetchJobData = async () => {
      let foundJob = jobs.find(j => j._id === params.id || j.id === params.id);
      
      // If job not found or postedBy is just an ID (not populated), fetch fresh data
      if (!foundJob || (foundJob.postedBy && typeof foundJob.postedBy === 'string')) {
        try {
          const res = await jobsAPI.getById(params.id);
          // Handle potential response structures: { data: job } or { ...job }
          foundJob = res.data || res;
        } catch (e) {
          console.error("Failed to fetch job", e);
          const msg = e.response?.data?.error || e.response?.data?.message || e.message;
          setError(msg);
        }
      }
      
      if (foundJob) {
          setJob(foundJob);

          // Check if user has already applied
          if (user && Array.isArray(user.recentApplicationJob) && user.recentApplicationJob.length > 0) {
            const application = user.recentApplicationJob.find(
                app => app.job?._id === foundJob._id || app.job === foundJob._id
            );
            if (application) {
                setIsApplied(true);
                setApplicationStatus(application.status);
            }
          }
      }
    };

    fetchJobData();
  }, [params.id, jobs, user]);

  // Check if user has a profile resume - separate effect to run on user changes
  useEffect(() => {
    if (user) {
      // Debug: Log all possible resume fields
      console.log('📄 Resume fields check:', {
        resume: user.resume,
        resumeUrl: user.resumeUrl,
        resumeFileURL: user.resumeFileURL,
        fullUser: user
      });
      
      // Check all possible field names for resume
      const profileResume = user.resume || user.resumeUrl || user.resumeFileURL;
      if (profileResume) {
        setHasProfileResume(true);
        setProfileResumeUrl(profileResume);
      } else {
        setHasProfileResume(false);
        setProfileResumeUrl('');
      }
    }
  }, [user]);

  // Fetch fresh profile data on mount to ensure we have the latest resume info
  useEffect(() => {
    if (user?.role) {
      fetchProfile(user.role);
    }
  }, []);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeName('');
  };

  const handleAnalyze = async () => {
    // For profile resume, we don't need a file
    if (resumeSource === 'upload' && !resumeFile) return;
    if (resumeSource === 'profile' && !hasProfileResume) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    
    if (resumeSource === 'profile') {
      // Use existing profile resume
      formData.append('useExistingResume', 'true');
    } else {
      // Upload new resume
      formData.append('resume', resumeFile);
      formData.append('useExistingResume', 'false');
    }

    try {
      const response = await jobsAPI.scoreResume(job.id || job._id, formData);
      if (response.success) {
        setAnalysisResult(response.data);
        setShowScoreModal(true);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      // Optional: Add toast error here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    // Validate based on resume source
    if (resumeSource === 'upload' && !resumeFile) return;
    if (resumeSource === 'profile' && !hasProfileResume) return;
    
    setIsApplying(true);
    
    try {
        const applyFormData = new FormData();
        
        if (resumeSource === 'profile') {
          // Use existing profile resume
          applyFormData.append('useExistingResume', 'true');
        } else {
          // Upload new resume
          applyFormData.append('resume', resumeFile);
          applyFormData.append('useExistingResume', 'false');
        }

        await jobsAPI.apply(job._id || job.id, applyFormData);

        // Update UI
        setIsApplied(true);
        setApplicationStatus('Applied');
        
        // Sync Profile
        if (user && user.role) {
            fetchProfile(user.role);
        }

    } catch (error) {
        console.error("Application failed:", error);
    } finally {
        setIsApplying(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not Disclosed';
    if (typeof salary === 'object') {
      const { min, max, currency } = salary;
      if (min !== undefined && max !== undefined) {
         return `${currency || '$'}${min.toLocaleString()} - ${currency || '$'}${max.toLocaleString()}`;
      }
      return 'Competitive Salary';
    }
    return salary;
  };

  if (!job) {
    return (
      <AuthGuard allowedRoles={['candidate']}>
        {error ? (
            <div className="min-h-[50vh] flex items-center justify-center">
                <NeoCard className="border-4 border-red-500 p-8 text-center bg-white dark:bg-zinc-900 max-w-lg shadow-neo-lg">
                    <h2 className="text-3xl font-black text-red-500 mb-4 uppercase">Error</h2>
                    <p className="font-mono font-bold text-xl mb-6 dark:text-white">{error}</p>
                    <Link href="/candidate/jobs">
                        <NeoButton className="bg-neo-black text-white w-full">Back to Jobs</NeoButton>
                    </Link>
                </NeoCard>
            </div>
        ) : (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <p className="text-center font-bold dark:text-white">Loading...</p>
            </div>
        )}
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['candidate']}>
      <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Navigation */}
        <Link href="/candidate/jobs" className="mb-6 flex items-center font-bold text-neo-black dark:text-white hover:underline group">
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> Back to Jobs
        </Link>

        {/* Header Block */}
        <div className="bg-white dark:bg-neo-black border-4 border-neo-black dark:border-white p-8 shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 bg-neo-yellow border-b-4 border-l-4 border-neo-black font-black uppercase text-sm text-neo-black">
              {job.status || 'Active'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase leading-none mb-4 dark:text-white">{job.title}</h1>
          <div className="flex flex-wrap gap-4 items-center font-mono text-sm md:text-base font-bold text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-2"><span className="text-xl">🏢</span> {job.companyName}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-2"><span className="text-xl">📍</span> {job.location}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-2">
                 <span className="text-xl">👤</span> 
                 Posted by: {job.postedBy?.fullName || (typeof job.postedBy === 'string' && job.postedBy.length < 24 ? job.postedBy : 'Recruiter')}
              </span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-2">
                  <span className="text-xl">👥</span> 
                  {(job.applications?.length || job.appliedBy?.length || 0)} Applicants
                  {job.applications?.length > 0 && (
                      <span className="text-xs ml-1 text-neo-red font-black">
                          ({job.applications.filter(a => a.status === 'Reject' || a.status === 'Rejected').length} Rejected)
                      </span>
                  )}
              </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
               <NeoBadge variant="blue">{job.jobType || 'Full-time'}</NeoBadge>
               <NeoBadge variant="green">{job.workType || 'Remote'}</NeoBadge>
               <NeoBadge variant="pink">{job.department || 'Engineering'}</NeoBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Main Content */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neo-green/10 dark:bg-green-900/20 border-4 border-neo-green p-6 flex flex-col justify-center items-center text-center">
                        <span className="font-bold uppercase text-xs tracking-widest text-neo-green mb-1">Annual Salary</span>
                        <span className="text-3xl font-black text-neo-black dark:text-white">{formatSalary(job.salary)}</span>
                    </div>
                    <div className="bg-neo-red/10 dark:bg-red-900/20 border-4 border-neo-red p-6 flex flex-col justify-center items-center text-center">
                        <span className="font-bold uppercase text-xs tracking-widest text-neo-red mb-1">Apply Before</span>
                        <span className="text-3xl font-black text-neo-black dark:text-white">{job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '2024-12-31'}</span>
                    </div>
                </div>

                {/* Description */}
                <NeoCard className="prose prose-lg max-w-none font-mono dark:prose-invert">
                    <h3 className="font-black text-xl uppercase border-b-4 border-neo-black dark:border-white pb-2 mb-4 dark:text-white">Overview</h3>
                    <p className="whitespace-pre-line text-gray-800 dark:text-gray-300">{job.description || 'We are looking for a talented professional to join our team. Must have relevant experience and a passion for excellence.'}</p>
                </NeoCard>

                {/* Requirements */}
                <NeoCard>
                    <h3 className="font-black text-xl uppercase border-b-4 border-neo-black dark:border-white pb-2 mb-4 dark:text-white">Requirements</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="text-neo-green text-xl font-black">✓</span>
                          <span className="font-bold dark:text-white">Experience: {job.experienceLevel || 'Senior'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-neo-green text-xl font-black">✓</span>
                          <span className="font-bold dark:text-white">Education: {job.educationRequired || 'Bachelors Degree'}</span>
                        </li>
                        {(job.skillsRequired || ['React', 'TypeScript', 'GenAI']).map((skill, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-neo-green text-xl font-black">✓</span>
                            <span className="dark:text-white">{skill}</span>
                          </li>
                        ))}
                    </ul>
                </NeoCard>

                {/* Benefits */}
                <NeoCard>
                    <h3 className="font-black text-xl uppercase border-b-4 border-neo-black dark:border-white pb-2 mb-4 dark:text-white">Benefits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(job.benefits || ['Health', 'Dental', '401k']).map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700">
                                <span className="text-neo-yellow text-xl">★</span>
                                <span className="font-bold text-sm dark:text-white">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </NeoCard>
            </div>

            {/* RIGHT COLUMN: Sidebar (Sticky) */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Apply Card */}
                <div className="sticky top-24">
                    <NeoCard className="border-4 shadow-neo-xl dark:shadow-[8px_8px_0px_0px_#ffffff] bg-white dark:bg-zinc-900 relative p-0 overflow-hidden">
                        <div className="bg-neo-black dark:bg-white p-4">
                          <h3 className="font-black text-2xl uppercase text-center text-white dark:text-neo-black">Apply Now</h3>
                        </div>
                        
                        <div className="p-6">
                        {!isApplied ? (
                            <div className="space-y-4">
                                
                                {/* Resume Source Toggle */}
                                <div className="bg-gray-50 dark:bg-zinc-800 p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg">
                                  <p className="font-bold text-sm uppercase mb-3 dark:text-white text-center">Choose Resume Source</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Upload New Option */}
                                    <button
                                      type="button"
                                      onClick={() => setResumeSource('upload')}
                                      className={`p-3 border-3 rounded-lg font-bold text-xs uppercase transition-all flex flex-col items-center gap-1 ${
                                        resumeSource === 'upload'
                                          ? 'bg-neo-blue text-white border-neo-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                                          : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 hover:border-neo-blue'
                                      }`}
                                    >
                                      <span className="text-xl">📤</span>
                                      <span>Upload New</span>
                                    </button>
                                    
                                    {/* Use Profile Resume Option */}
                                    <button
                                      type="button"
                                      onClick={() => hasProfileResume && setResumeSource('profile')}
                                      disabled={!hasProfileResume}
                                      className={`p-3 border-3 rounded-lg font-bold text-xs uppercase transition-all flex flex-col items-center gap-1 ${
                                        resumeSource === 'profile'
                                          ? 'bg-neo-green text-white border-neo-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                                          : hasProfileResume 
                                            ? 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 hover:border-neo-green'
                                            : 'bg-gray-100 dark:bg-zinc-950 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                                      }`}
                                    >
                                      <span className="text-xl">{hasProfileResume ? '📋' : '🚫'}</span>
                                      <span>Use Profile</span>
                                      {!hasProfileResume && <span className="text-[10px] normal-case">No resume saved</span>}
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Upload New Resume Section */}
                                {resumeSource === 'upload' && (
                                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="border-4 border-dashed border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 p-6 text-center hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer group rounded-lg">
                                        <input type="file" onChange={handleFileUpload} className="hidden" id="resume-upload" accept=".pdf,.doc,.docx" />
                                        <label htmlFor="resume-upload" className="cursor-pointer block">
                                            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📂</div>
                                            <p className="font-bold text-sm uppercase dark:text-white">Drop Resume Here</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, DOCX (Max 5MB)</p>
                                        </label>
                                    </div>

                                    {resumeName && (
                                        <div className="animate-in fade-in slide-in-from-top-2 mt-3">
                                          <div className="flex items-center justify-between text-xs font-bold text-green-600 mb-2 truncate">
                                              <span className="truncate max-w-[200px]" title={resumeName}>✓ {resumeName}</span>
                                              <button onClick={handleRemoveFile} className="text-red-500 hover:underline shrink-0 ml-2">Remove</button>
                                          </div>
                                          <NeoButton 
                                              onClick={handleAnalyze} 
                                              disabled={isAnalyzing} 
                                              className="w-full bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-neo-black dark:border-white hover:bg-gray-100 dark:hover:bg-zinc-700 py-3 text-xs shadow-sm"
                                          >
                                              {isAnalyzing ? (
                                                  <span className="flex items-center justify-center gap-2">
                                                      <span className="animate-spin">⚙️</span> Scanning...
                                                  </span>
                                              ) : '✨ Check Resume Score'}
                                          </NeoButton>
                                        </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Use Profile Resume Section */}
                                {resumeSource === 'profile' && hasProfileResume && (
                                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="bg-green-50 dark:bg-green-900/20 border-4 border-neo-green p-4 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="text-3xl">📄</div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-sm text-neo-green uppercase">Profile Resume</p>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1" title={profileResumeUrl}>
                                            {profileResumeUrl.split('/').pop() || 'resume.pdf'}
                                          </p>
                                        </div>
                                        <a 
                                          href={profileResumeUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-neo-blue hover:underline text-xs font-bold shrink-0"
                                        >
                                          View ↗
                                        </a>
                                      </div>
                                    </div>
                                    <NeoButton 
                                        onClick={handleAnalyze} 
                                        disabled={isAnalyzing} 
                                        className="w-full bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-neo-black dark:border-white hover:bg-gray-100 dark:hover:bg-zinc-700 py-3 text-xs shadow-sm mt-3"
                                    >
                                        {isAnalyzing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin">⚙️</span> Scanning...
                                            </span>
                                        ) : '✨ Check Resume Score'}
                                    </NeoButton>
                                  </div>
                                )}

                                <NeoButton 
                                  onClick={handleSubmit} 
                                  className="w-full bg-neo-black dark:bg-neo-green text-white dark:text-black hover:bg-gray-800 dark:hover:bg-green-400 py-4 text-lg border-4 mt-4 shadow-neo-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={
                                    (resumeSource === 'upload' && !resumeFile) || 
                                    (resumeSource === 'profile' && !hasProfileResume) || 
                                    (user && getMissingProfileFields(user).length > 0) ||
                                    isApplying
                                  }
                                >
                                    {isApplying ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin">⏳</span> Submitting...
                                        </span>
                                    ) : (user && getMissingProfileFields(user).length > 0) ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span>⚠️</span> Complete Profile to Apply
                                        </span>
                                    ) : 'SUBMIT APPLICATION'}
                                </NeoButton>
                                {user && getMissingProfileFields(user).length > 0 && (
                                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900 text-center rounded">
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Missing required fields:</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {getMissingProfileFields(user).map(f => formatFieldName(f)).join(', ')}
                                        </p>
                                        <Link href="/profile" className="block mt-2 text-xs font-black underline text-red-600 hover:text-red-800">
                                            Go to Profile →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                <h3 className="text-xl font-black uppercase dark:text-white">
                                   {applicationStatus === 'Pending' ? 'Application Sent!' : `Status: ${applicationStatus || 'Applied'}`}
                                </h3>
                                <div className="mt-2">
                                   <NeoBadge variant={getStatusColor(applicationStatus)}>
                                      {applicationStatus || 'Under Review'}
                                   </NeoBadge>
                                </div>
                                <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-4">Good luck, legend.</p>
                                <Link href="/candidate/applications">
                                  <NeoButton variant="ghost" className="mt-6 text-xs underline">View All Applications</NeoButton>
                                </Link>
                            </div>
                        )}
                        </div>
                    </NeoCard>

                    {/* Company Info Card */}
                    <NeoCard className="mt-6 bg-gray-50 dark:bg-zinc-800 border-2">
                        <h4 className="font-black uppercase text-sm mb-4 border-b-2 border-gray-200 dark:border-zinc-700 pb-2 dark:text-white">About Company</h4>
                        <p className="font-bold text-lg mb-1 dark:text-white">{job.company}</p>
                        <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-4">{job.industry || 'Technology'}</p>
                        <a href="#" className="text-neo-blue font-bold text-sm hover:underline block">Visit Website &rarr;</a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 font-bold text-xs hover:underline block mt-2">View other jobs</a>
                    </NeoCard>
                </div>
            </div>
        </div>
        {/* Resume Score Modal */}
        {showScoreModal && analysisResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] w-full max-w-3xl max-h-[90vh] overflow-y-auto relative flex flex-col">
              
              {/* Retro Mac-style Header */}
              <div className="bg-neo-black dark:bg-white p-3 flex justify-between items-center sticky top-0 z-10 border-b-4 border-neo-black dark:border-white">
                <div className="flex gap-2 ml-2">
                    <div className="w-4 h-4 rounded-full bg-neo-red border-2 border-white dark:border-neo-black"></div>
                    <div className="w-4 h-4 rounded-full bg-neo-yellow border-2 border-white dark:border-neo-black"></div>
                    <div className="w-4 h-4 rounded-full bg-neo-green border-2 border-white dark:border-neo-black"></div>
                </div>
                <h3 className="text-lg font-black uppercase text-white dark:text-neo-black tracking-widest">Analysis_Result.exe</h3>
                <button 
                  onClick={() => setShowScoreModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-neo-red text-white border-2 border-white dark:border-neo-black hover:bg-red-600 font-bold"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-none">
                
                {/* Score Dashboard */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                   {/* Main Gauge */}
                   <div className="relative group hover:scale-105 transition-transform duration-300">
                      <div className="w-48 h-48 rounded-full border-8 border-neo-black dark:border-white bg-white dark:bg-zinc-800 flex flex-col items-center justify-center relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                          <span className="text-6xl font-black text-neo-black dark:text-white" style={{ textShadow: '2px 2px 0px #FFB800' }}>{analysisResult.overallScore}</span>
                          <span className="text-xs font-black bg-neo-black text-white px-2 py-1 mt-2 rotate-[-5deg]">TOTAL SCORE</span>
                      </div>
                      <div className="absolute -top-4 -right-4 bg-neo-yellow border-4 border-neo-black dark:border-white p-2 text-xs font-bold rotate-12 shadow-neo-sm transform group-hover:rotate-[20deg] transition-transform">
                          AI RATED
                      </div>
                   </div>

                   {/* Stats Box */}
                   <div className="flex-1 w-full space-y-4">
                      <div className="bg-white dark:bg-zinc-800 p-4 border-4 border-neo-black dark:border-white shadow-[4px_4px_0px_0px_#00E5FF]">
                         <div className="flex justify-between items-center mb-1">
                             <span className="font-bold uppercase text-xs">Skills Match</span>
                             <span className="font-black text-neo-blue">{analysisResult.skillsMatch}%</span>
                         </div>
                         <div className="w-full bg-gray-200 h-4 border-2 border-neo-black dark:border-white relative">
                             <div className="h-full bg-neo-blue transition-all duration-1000" style={{ width: `${analysisResult.skillsMatch}%` }}></div>
                         </div>
                      </div>
                      
                      <div className="bg-white dark:bg-zinc-800 p-4 border-4 border-neo-black dark:border-white shadow-[4px_4px_0px_0px_#FF00E5]">
                         <div className="flex justify-between items-center mb-1">
                             <span className="font-bold uppercase text-xs">Experience Match</span>
                             <span className="font-black text-neo-pink">{analysisResult.experienceMatch}%</span>
                         </div>
                         <div className="w-full bg-gray-200 h-4 border-2 border-neo-black dark:border-white relative">
                             <div className="h-full bg-neo-pink transition-all duration-1000" style={{ width: `${analysisResult.experienceMatch}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Insights Terminal */}
                <div className="bg-neo-black dark:bg-zinc-950 p-2 border-4 border-neo-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,255,0,0.2)]">
                   <div className="bg-gray-800 p-1 flex items-center justify-between mb-2">
                       <span className="text-[10px] text-green-400 font-mono pl-2">root@ai-analyzer:~/insights</span>
                   </div>
                   <div className="bg-black p-4 font-mono text-sm leading-relaxed text-green-400 min-h-[120px]">
                     <span className="text-gray-500 mr-2">$ cat analysis.txt</span><br/>
                     <span className="typing-effect">{analysisResult.insights}</span>
                     <span className="animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 align-middle"></span>
                   </div>
                </div>

                {/* Skills Breakdown */}
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="bg-[#e6ffe6] dark:bg-green-950/30 p-6 border-4 border-neo-green relative">
                      <div className="absolute -top-3 left-4 bg-neo-green text-white px-3 py-1 font-black text-xs uppercase border-2 border-neo-black">
                         Matched Skills
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {analysisResult.matchedSkills.map((skill, i) => (
                          <div key={i} className="flex items-center bg-white dark:bg-zinc-900 border-2 border-neo-green px-3 py-1.5 shadow-[2px_2px_0px_0px_#00CC00] transform hover:-translate-y-1 transition-transform">
                             <span className="text-neo-green mr-2 text-lg">✓</span>
                             <span className="font-bold text-xs dark:text-white uppercase">{skill}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                   
                   {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
                     <div className="bg-[#ffe6e6] dark:bg-red-950/30 p-6 border-4 border-neo-red relative">
                        <div className="absolute -top-3 left-4 bg-neo-red text-white px-3 py-1 font-black text-xs uppercase border-2 border-neo-black">
                           Missing Skills
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {analysisResult.missingSkills.map((skill, i) => (
                            <div key={i} className="flex items-center bg-white dark:bg-zinc-900 border-2 border-neo-red px-3 py-1.5 shadow-[2px_2px_0px_0px_#FF0000] transform hover:-translate-y-1 transition-transform">
                               <span className="text-neo-red mr-2 font-black">!</span>
                               <span className="font-bold text-xs dark:text-white uppercase decoration-red-500 decoration-2">{skill}</span>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>

              </div>

              {/* Modal Footer */}
              {/* <div className="p-6 bg-white dark:bg-zinc-900 border-t-4 border-neo-black dark:border-white">
                <button 
                  onClick={() => setShowScoreModal(false)}
                  className="w-full py-4 bg-neo-yellow border-2 border-neo-black font-black uppercase tracking-widest hover:bg-neo-black hover:text-white transition-all shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Close Terminal
                </button>
              </div> */}

            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
