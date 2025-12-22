'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/lib/store';
import { recruiterAPI } from '@/lib/api';
import { NeoCard, NeoButton, NeoInput, NeoBadge } from '@/components/ui/neo';
import { User, Briefcase, MapPin, GraduationCap, Globe, Edit2, Save, X, Trophy } from 'lucide-react';

// Helper component for displaying field in view mode vs edit mode
const DisplayField = ({ label, value, name, type = "text", onChange, isTextarea = false, placeholder = "", isEditing, ...props }) => {
  if (isEditing) {
    if (isTextarea) {
      return (
        <div>
          <label className="block font-bold text-sm mb-1 dark:text-white">{label}</label>
          <textarea 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 focus:outline-none focus:ring-2 focus:ring-neo-yellow font-mono text-sm h-24 resize-none dark:text-white"
            placeholder={placeholder} 
          />
        </div>
      );
    }
    return (
      <NeoInput label={label} type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} {...props} />
    );
  }
  return (
    <div>
      <label className="block font-bold text-xs mb-1 text-gray-400 dark:text-gray-500 uppercase">{label}</label>
      <span className="font-bold dark:text-white text-lg">{value || 'Not specified'}</span>
    </div>
  );
};

export default function RecruiterProfilePage() {
  const { user, updateProfile, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    currentCity: user?.currentCity || '',
    area: user?.area || '',
    state: user?.state || '',
    country: user?.country || 'India',
    zipCode: user?.zipCode || '',
    about: user?.about || '',
    skills: user?.skills || [],
    experienceYears: user?.experienceYears || 0,
    isFresher: user?.experienceYears === 0,
    education: user?.education || {
      tenth: {}, juniorCollege: {}, graduation: {}, postGraduation: {}, phd: {}
    },
    workExperience: user?.workExperience || [],
    languages: user?.languages || [],
    certifications: user?.certifications || [],
    currentRole: user?.currentRole || '',
    currentEmployer: user?.currentEmployer || '',
    companyURL: user?.companyURL || '',
    totalHires: user?.totalHires || 0,
    socials: user?.socials || { linkedin: '', twitter: '' },
    portfolioUrl: user?.portfolioUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    preferences: user?.preferences || { industries: [], jobTypes: [] },
    resumeFileURL: user?.resumeFileURL || '',
    profilePicture: user?.profilePicture || '',
    createdAt: user?.createdAt || ''
  });

  // Sync with store/API data
  const syncFormData = (apiData) => {
    if (!apiData) return;
    setFormData(prev => ({
      ...prev,
      fullName: apiData.fullName || apiData.name || '',
      email: apiData.email || '',
      phone: apiData.phone || '',
      dateOfBirth: apiData.dateOfBirth ? new Date(apiData.dateOfBirth).toISOString().split('T')[0] : '',
      gender: apiData.gender || '',
      currentCity: apiData.currentCity || '',
      area: apiData.area || '',
      state: apiData.state || '',
      country: apiData.country || 'India',
      zipCode: apiData.zipCode || '',
      about: apiData.about || apiData.bio || '',
      skills: apiData.skills || [],
      skillsString: apiData.skills?.join(', ') || '',
      experienceYears: apiData.experienceYears || 0,
      isFresher: apiData.isFresher !== undefined ? apiData.isFresher : (apiData.experienceYears === 0 || apiData.workExperience?.length === 0),
      education: apiData.education || { tenth: {}, juniorCollege: {}, graduation: {}, postGraduation: {}, phd: {} },
      workExperience: apiData.workExperience || [],
      languages: apiData.languages || [],
      certifications: apiData.certifications || [],
      currentRole: apiData.currentRole || '',
      currentEmployer: apiData.currentEmployer || '',
      companyURL: apiData.companyURL || '',
      totalHires: apiData.totalHires || 0,
      socials: apiData.socials || { linkedin: '', twitter: '' },
      portfolioUrl: apiData.portfolioUrl || '',
      linkedinUrl: apiData.linkedinUrl || '',
      githubUrl: apiData.githubUrl || '',
      preferences: apiData.preferences || { industries: [], jobTypes: [] },
      industriesString: apiData.preferences?.industries?.join(', ') || '',
      jobTypesString: apiData.preferences?.jobTypes?.join(', ') || '',
      resumeFileURL: apiData.resumeFileURL || apiData.resumeUrl || apiData.resume || '',
      profilePicture: apiData.profilePicture || '',
      createdAt: apiData.createdAt || ''
    }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (user && user.role) {
        setIsLoadingProfile(true);
        const result = await fetchProfile(user.role);
        if (result.success && result.data) {
          syncFormData(result.data);
        }
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user?.role, fetchProfile]);

  useEffect(() => {
    if (user && !isEditing) {
      syncFormData(user);
    }
  }, [user, isEditing]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        const numericValue = value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, [name]: numericValue }));
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedExp = [...formData.workExperience];
    updatedExp[index] = { ...updatedExp[index], [field]: value };
    setFormData(prev => ({ ...prev, workExperience: updatedExp }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '', currentlyWorking: false }]
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (level, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        [level]: {
          ...prev.education[level],
          [field]: value
        }
      }
    }));
  };

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));
  
  const saveProfile = async () => {
    setIsSaving(true);
    if (!user || (!user._id && !user.id)) {
      setSuccessMessage("Error: User ID missing.");
      setIsSaving(false);
      return;
    }

    try {
      const id = user._id || user.id;
      const res = await recruiterAPI.updateProfile(id, formData);
      updateProfile(formData);
      if (user?.role) await fetchProfile(user.role);
      setIsEditing(false);
      setSuccessMessage(res?.message || 'Profile saved successfully!');
    } catch (error) {
      setSuccessMessage(error.response?.data?.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) syncFormData(user);
  };

  const handleProfilePicUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePicture', file);
      setIsSaving(true);
      try {
        const res = await recruiterAPI.updateProfilePicture(formData);
        const picUrl = res.profilePicture || res.data?.profilePicture;
        if (picUrl) {
          updateProfile({ profilePicture: picUrl });
          setFormData(prev => ({ ...prev, profilePicture: picUrl }));
          setSuccessMessage('Profile picture updated!');
        }
      } catch (error) {
        setSuccessMessage('Failed to upload image.');
      } finally {
        setIsSaving(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleResumeUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('resume', file);
      
      
      setIsUploadingResume(true);
      
      try {
        const res = await recruiterAPI.updateResume(formData);
        // The backend returns { message: "...", resumeLink: "..." }
        const resumeUrl = res.resumeLink || res.resumeFileURL || res.resume || res.resumeUrl || res.url || res.data?.resume;
        
        if (resumeUrl) {
          setFormData(prev => ({ ...prev, resumeFileURL: resumeUrl }));
          setSuccessMessage('Resume uploaded successfully!');
        } else {
             // Fallback if URL isn't directly returned, fetch profile again
             if (user?.role) await fetchProfile(user.role);
             setSuccessMessage('Resume uploaded! Refreshing...');
        }
      } catch (error) {
        setSuccessMessage('Failed to upload resume.');
        console.error("Resume upload error:", error);
      } finally {
        setIsUploadingResume(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleFileSelection = (inputId) => {
    document.getElementById(inputId).click();
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Dec 2024';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  const steps = [
    { id: 1, label: "Personal Information", icon: User },
    { id: 2, label: "Education", icon: GraduationCap },
    { id: 3, label: "Professional Experience", icon: Briefcase },
    { id: 4, label: "Additional Info", icon: Globe },
  ];

  return (
    <AuthGuard allowedRoles={['recruiter']}>
      {isLoadingProfile ? (
        <div className="min-h-screen flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-mono text-gray-500 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      ) : (
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {successMessage && (
          <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right-5">
            <div className="bg-neo-green border-2 border-neo-black dark:border-white px-6 py-3 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff]">
              <p className="text-white font-bold">{successMessage}</p>
            </div>
          </div>
        )}
        
        <div className="md:w-1/3">
          <NeoCard className="sticky top-24 text-center border-4">
            <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-zinc-800 rounded-full mb-4 border-4 border-neo-black dark:border-white overflow-hidden relative group">
               <img 
                 src={user?.profilePicture || user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter"} 
                 alt="Profile" 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   e.target.onerror = null;
                   e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter";
                 }}
               />
               {isEditing && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleFileSelection('profile-pic-input')}>
                       <span className="text-white text-xs font-bold uppercase">Change</span>
                   </div>
               )}
               <input type="file" id="profile-pic-input" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
            </div>
            <h2 className="text-2xl font-black uppercase dark:text-white">{formData.fullName}</h2>
            <p className="font-mono text-gray-500 dark:text-gray-400 mb-2">{formData.currentRole || 'Recruiter'}</p>
            
            <div className="flex justify-center items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400 font-bold">
               <MapPin className="w-4 h-4"/> {formData.currentCity}, {formData.country}
            </div>

            <NeoBadge variant="pink"><span className="text-xs uppercase font-bold">RECRUITER</span></NeoBadge>

            <div className="mt-8 text-left">
              <h4 className="font-bold text-xs uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-widest">Key Skills</h4>
              <div className="flex flex-wrap gap-2">
                  {formData.skills?.slice(0, 4).map((skill, i) => (
                      <span key={i} className="text-xs border border-neo-black dark:border-white px-2 py-1 bg-white dark:bg-zinc-800 dark:text-white rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none">{skill}</span>
                  )) || <span className="text-xs text-gray-400">No skills added</span>}
              </div>
            </div>

            <div className="mt-8 border-t-2 border-gray-100 dark:border-zinc-700 pt-6 grid grid-cols-2 gap-4 text-left">
               <div>
                   <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Member Since</span>
                   <span className="font-bold dark:text-white uppercase">{formatMemberSince(formData.createdAt)}</span>
               </div>
               <div>
                   <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Hires</span>
                   <span className="font-bold dark:text-white">{formData.totalHires} Total</span>
               </div>
            </div>
          </NeoCard>
        </div>

        <div className="md:w-2/3">
          <div className="mb-6 flex justify-end gap-3">
            {!isEditing ? (
              <NeoButton onClick={() => setIsEditing(true)} className="bg-neo-yellow text-neo-black">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </NeoButton>
            ) : (
              <>
                <NeoButton onClick={cancelEdit} variant="secondary">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </NeoButton>
                <NeoButton onClick={saveProfile} className="bg-neo-green text-white" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </NeoButton>
              </>
            )}
          </div>

          <div className="mb-8">
            <div className="hidden md:flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-zinc-700 -z-10"></div>
                {steps.map((step) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;
                    return (
                        <button 
                            key={step.id}
                            onClick={() => setActiveStep(step.id)}
                            className="flex flex-col items-center group"
                        >
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-lg font-bold transition-all z-10 
                                ${isActive ? 'bg-neo-orange border-neo-black dark:border-white text-white scale-110' : 
                                  isCompleted ? 'bg-neo-green border-neo-black dark:border-white text-white' : 
                                  'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-400'}`}>
                                {isCompleted ? '✓' : step.id}
                            </div>
                            <span className={`mt-2 text-xs font-bold uppercase tracking-wide bg-white dark:bg-black px-1 
                                ${isActive ? 'text-neo-orange' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </button>
                    )
                })}
            </div>
          </div>

          <NeoCard className="min-h-[600px] flex flex-col border-4">
              <h3 className="text-2xl font-black uppercase mb-1 dark:text-white">{steps[activeStep-1].label}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-6 border-b-2 border-gray-100 dark:border-zinc-700 pb-4">
                {isEditing ? 'Fill in your recruiter details.' : 'Your recruitment profile.'}
              </p>
              
              <div className="flex-grow space-y-6">
                  {activeStep === 1 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                          <DisplayField isEditing={isEditing} label="Full Name" value={formData.fullName} name="fullName" onChange={handleInputChange} />
                          <DisplayField isEditing={isEditing} label="About You" value={formData.about} name="about" onChange={handleInputChange} isTextarea={true} placeholder="Recruiter bio..." />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DisplayField isEditing={isEditing} label="Phone Number" value={formData.phone} name="phone" onChange={handleInputChange} placeholder="10 Digit Number" />
                              <DisplayField isEditing={isEditing} label="Date of Birth" value={formData.dateOfBirth} name="dateOfBirth" type="date" onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <label className="block font-bold text-sm mb-1 dark:text-white">Gender</label>
                                 {isEditing ? (
                                   <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow h-[46px] dark:text-white">
                                       <option value="">Select...</option>
                                       <option value="Male">Male</option>
                                       <option value="Female">Female</option>
                                   </select>
                                 ) : (
                                   <span className="font-bold dark:text-white text-lg">{formData.gender || 'Not specified'}</span>
                                 )}
                               </div>
                          </div>
                          <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                               <label className="block font-bold text-sm mb-3 uppercase text-gray-400 dark:text-gray-500 tracking-widest font-mono">Location Details</label>
                               <div className="space-y-4">
                                  <DisplayField isEditing={isEditing} label="Area / Locality" value={formData.area} name="area" onChange={handleInputChange} />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <DisplayField isEditing={isEditing} label="City" value={formData.currentCity} name="currentCity" onChange={handleInputChange} />
                                      <DisplayField isEditing={isEditing} label="State" value={formData.state} name="state" onChange={handleInputChange} />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <DisplayField isEditing={isEditing} label="Country" value={formData.country} name="country" onChange={handleInputChange} />
                                      <DisplayField isEditing={isEditing} label="Zip Code" value={formData.zipCode} name="zipCode" onChange={handleInputChange} />
                                  </div>
                               </div>
                          </div>
                      </div>
                  )}

                  {activeStep === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                          <div className="space-y-4">
                              {['tenth', 'juniorCollege', 'graduation', 'postGraduation', 'phd'].map((level) => (
                                  <details key={level} className="group border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                                      <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white uppercase">
                                          {level.replace(/([A-Z])/g, ' $1').trim()} Education
                                          <span className="text-xl group-open:rotate-180 transition-transform">▼</span>
                                      </summary>
                                      <div className="p-4 border-t-2 border-neo-black dark:border-white grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="md:col-span-2">
                                              <label className="block font-bold text-xs mb-1 dark:text-white">{level.includes('tenth') ? 'School Name' : 'College/University Name'}</label>
                                              <NeoInput 
                                                value={formData.education[level]?.[level.includes('tenth') ? 'schoolName' : 'collegeName'] || ''} 
                                                onChange={(e) => handleEducationChange(level, level.includes('tenth') ? 'schoolName' : 'collegeName', e.target.value)}
                                                disabled={!isEditing} 
                                              />
                                          </div>
                                          {level.includes('tenth') || level.includes('juniorCollege') ? (
                                             <div>
                                               <label className="block font-bold text-xs mb-1 dark:text-white">Board</label>
                                               {isEditing ? (
                                                  <select 
                                                    value={formData.education[level]?.board || ''} 
                                                    onChange={(e) => handleEducationChange(level, 'board', e.target.value)}
                                                    className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-2 font-mono text-sm"
                                                  >
                                                      <option value="">Select...</option>
                                                      <option value="CBSE">CBSE</option>
                                                      <option value="ICSE">ICSE</option>
                                                      <option value="State Board">State Board</option>
                                                      <option value="Other">Other</option>
                                                  </select>
                                               ) : <NeoInput value={formData.education[level]?.board || ''} disabled />}
                                             </div>
                                          ) : (
                                            <div>
                                                <label className="block font-bold text-xs mb-1 dark:text-white">University</label>
                                                <NeoInput 
                                                  value={formData.education[level]?.university || ''} 
                                                  onChange={(e) => handleEducationChange(level, 'university', e.target.value)}
                                                  disabled={!isEditing} 
                                                />
                                            </div>
                                          )}
                                          
                                          {level === 'juniorCollege' && (
                                            <div>
                                                <label className="block font-bold text-xs mb-1 dark:text-white">Stream</label>
                                                {isEditing ? (
                                                  <select 
                                                    value={formData.education[level]?.stream || ''} 
                                                    onChange={(e) => handleEducationChange(level, 'stream', e.target.value)}
                                                    className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-2 font-mono text-sm"
                                                  >
                                                      <option value="">Select...</option>
                                                      <option value="Science">Science</option>
                                                      <option value="Commerce">Commerce</option>
                                                      <option value="Arts">Arts</option>
                                                      <option value="Other">Other</option>
                                                  </select>
                                                ) : <NeoInput value={formData.education[level]?.stream || ''} disabled />}
                                            </div>
                                          )}

                                          {['graduation', 'postGraduation'].includes(level) && (
                                              <>
                                                <div>
                                                    <label className="block font-bold text-xs mb-1 dark:text-white">Degree</label>
                                                    <NeoInput 
                                                      value={formData.education[level]?.degree || ''} 
                                                      onChange={(e) => handleEducationChange(level, 'degree', e.target.value)}
                                                      disabled={!isEditing} 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-bold text-xs mb-1 dark:text-white">Specialization</label>
                                                    <NeoInput 
                                                      value={formData.education[level]?.specialization || ''} 
                                                      onChange={(e) => handleEducationChange(level, 'specialization', e.target.value)}
                                                      disabled={!isEditing} 
                                                    />
                                                </div>
                                              </>
                                          )}

                                          {level === 'phd' && (
                                              <div>
                                                  <label className="block font-bold text-xs mb-1 dark:text-white">Thesis Title</label>
                                                  <NeoInput 
                                                    value={formData.education[level]?.thesisTitle || ''} 
                                                    onChange={(e) => handleEducationChange(level, 'thesisTitle', e.target.value)}
                                                    disabled={!isEditing} 
                                                  />
                                              </div>
                                          )}

                                          <div>
                                              <label className="block font-bold text-xs mb-1 dark:text-white">Percentage / CGPA</label>
                                              <NeoInput 
                                                value={formData.education[level]?.percentage || formData.education[level]?.cgpa || ''} 
                                                onChange={(e) => handleEducationChange(level, level === 'phd' ? 'percentage' : 'percentage', e.target.value)}
                                                disabled={!isEditing} 
                                              />
                                          </div>
                                          <div>
                                              <label className="block font-bold text-xs mb-1 dark:text-white">Year</label>
                                              <NeoInput 
                                                value={formData.education[level]?.passingYear || formData.education[level]?.year || ''} 
                                                onChange={(e) => handleEducationChange(level, level === 'phd' ? 'year' : 'passingYear', e.target.value)}
                                                disabled={!isEditing} 
                                              />
                                          </div>
                                      </div>
                                  </details>
                              ))}
                          </div>
                      </div>
                  )}

                  {activeStep === 3 && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                           <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 border-2 border-neo-black dark:border-white shadow-neo-sm mb-6">
                                {isEditing ? (
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-neo-black dark:accent-white cursor-pointer" 
                                    id="fresher-recruiter" 
                                    checked={formData.isFresher} 
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setFormData(p => ({
                                            ...p, 
                                            isFresher: checked,
                                            experienceYears: checked ? 0 : p.experienceYears
                                        }));
                                    }} 
                                  />
                                ) : (
                                  <div className={`w-3 h-3 rounded-full ${formData.isFresher ? 'bg-neo-green' : 'bg-neo-blue'}`}></div>
                                )}
                                 <label htmlFor="fresher-recruiter" className={`font-bold cursor-pointer uppercase text-sm tracking-tight ${formData.isFresher ? 'text-neo-green' : 'text-neo-blue dark:text-blue-400'}`}>
                                   {formData.isFresher ? 'I AM A FRESHER' : 'I HAVE WORK EXPERIENCE'}
                                 </label>
                           </div>

                           {!formData.isFresher && (
                             <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <DisplayField isEditing={isEditing} label="Experience Years" value={formData.experienceYears} name="experienceYears" type="number" onChange={handleInputChange} />
                                    <DisplayField isEditing={isEditing} label="Total Hires" value={formData.totalHires} name="totalHires" type="number" onChange={handleInputChange} />
                                    <DisplayField isEditing={isEditing} label="Current Role" value={formData.currentRole} name="currentRole" onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DisplayField isEditing={isEditing} label="Current Employer" value={formData.currentEmployer} name="currentEmployer" onChange={handleInputChange} />
                                    <DisplayField isEditing={isEditing} label="Company URL" value={formData.companyURL} name="companyURL" onChange={handleInputChange} />
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold uppercase text-sm dark:text-white font-mono">Detailed Work Experience</h4>
                                        {isEditing && (
                                            <NeoButton variant="secondary" className="text-xs py-1 px-3" onClick={addWorkExperience}>
                                                + Add Role
                                            </NeoButton>
                                        )}
                                    </div>
                                    
                                    {formData.workExperience?.length > 0 ? (
                                        formData.workExperience.map((exp, idx) => (
                                            <div key={idx} className="border-2 border-neo-black dark:border-white p-4 relative bg-white dark:bg-zinc-900 shadow-neo-sm mb-4">
                                                {isEditing && (
                                                    <button 
                                                        onClick={() => removeWorkExperience(idx)}
                                                        className="absolute top-2 right-2 text-red-500 font-bold text-xs hover:underline uppercase"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Job Title</label>
                                                        <NeoInput 
                                                            placeholder="e.g. Senior Recruiter" 
                                                            value={exp.jobTitle || ''} 
                                                            onChange={(e) => handleWorkExperienceChange(idx, 'jobTitle', e.target.value)}
                                                            disabled={!isEditing} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Company</label>
                                                        <NeoInput 
                                                            placeholder="Company Name" 
                                                            value={exp.company || ''} 
                                                            onChange={(e) => handleWorkExperienceChange(idx, 'company', e.target.value)}
                                                            disabled={!isEditing} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Start Date</label>
                                                        <NeoInput 
                                                            type="date" 
                                                            value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} 
                                                            onChange={(e) => handleWorkExperienceChange(idx, 'startDate', e.target.value)}
                                                            disabled={!isEditing} 
                                                        />
                                                    </div>
                                                    {!exp.currentlyWorking && (
                                                        <div>
                                                            <label className="block font-bold text-xs mb-1 dark:text-white uppercase">End Date</label>
                                                            <NeoInput 
                                                                type="date" 
                                                                value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''} 
                                                                onChange={(e) => handleWorkExperienceChange(idx, 'endDate', e.target.value)}
                                                                disabled={!isEditing} 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={exp.currentlyWorking} 
                                                        onChange={(e) => handleWorkExperienceChange(idx, 'currentlyWorking', e.target.checked)}
                                                        disabled={!isEditing}
                                                        id={`current-${idx}`}
                                                    />
                                                    <label htmlFor={`current-${idx}`} className="text-xs font-bold uppercase dark:text-gray-400">Current Job</label>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm font-mono italic">No detailed experience added.</p>
                                    )}
                                </div>
                             </>
                           )}

                           {/* Hide all professional fields for freshers */}
                           {formData.isFresher && (
                             <div className="text-center text-neo-green font-bold py-4">No professional experience required for freshers.</div>
                           )}
                       </div>
                  )}

                  {activeStep === 4 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                           <div className="space-y-4">
                             <h4 className="font-bold uppercase text-sm dark:text-white font-mono">Skills & Preferences</h4>
                             <div>
                                <label className="block font-bold text-sm mb-1 dark:text-white">Skills (comma separated)</label>
                                {isEditing ? (
                                  <NeoInput 
                                    name="skills" 
                                    value={formData.skillsString || formData.skills.join(', ')} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(p => ({
                                            ...p, 
                                            skillsString: val,
                                            skills: val.split(',').map(s=>s.trim())
                                        }));
                                    }} 
                                  />
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((s,i) => <NeoBadge key={i} variant="blue">{s}</NeoBadge>)}
                                  </div>
                                )}
                             </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                               <div className="space-y-4">
                                   <label className="block font-bold text-sm uppercase text-gray-400 font-mono">Web Presence</label>
                                   <DisplayField isEditing={isEditing} label="LinkedIn" value={formData.linkedinUrl || formData.socials.linkedin} name="linkedinUrl" onChange={handleInputChange} />
                                   <DisplayField isEditing={isEditing} label="Portfolio" value={formData.portfolioUrl} name="portfolioUrl" onChange={handleInputChange} />
                                   <DisplayField isEditing={isEditing} label="Github" value={formData.githubUrl} name="githubUrl" onChange={handleInputChange} />
                               </div>
                               <div className="space-y-4">
                                   <label className="block font-bold text-sm uppercase text-gray-400 font-mono">Recruitment Preferences</label>
                                   <DisplayField 
                                      isEditing={isEditing} 
                                      label="Industries" 
                                      value={formData.industriesString || formData.preferences?.industries?.join(', ')} 
                                      name="industriesString" 
                                      onChange={(e) => {
                                          const val = e.target.value;
                                          setFormData(p => ({
                                              ...p,
                                              industriesString: val,
                                              preferences: { ...p.preferences, industries: val.split(',').map(s=>s.trim()).filter(s=>s!=='') }
                                          }));
                                      }}
                                   />
                                   <DisplayField 
                                      isEditing={isEditing} 
                                      label="Job Types" 
                                      value={formData.jobTypesString || formData.preferences?.jobTypes?.join(', ')} 
                                      name="jobTypesString" 
                                      onChange={(e) => {
                                          const val = e.target.value;
                                          setFormData(p => ({
                                              ...p,
                                              jobTypesString: val,
                                              preferences: { ...p.preferences, jobTypes: val.split(',').map(s=>s.trim()).filter(s=>s!=='') }
                                          }));
                                      }}
                                   />
                               </div>
                           </div>
                           
                           <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                              <label className="block font-bold text-sm mb-1 dark:text-white">Resume / Profile Document</label>
                              <div 
                                className={`p-4 border-2 border-dashed ${formData.resumeFileURL ? 'border-neo-green bg-neo-green/10' : 'border-gray-300 dark:border-zinc-700'} flex items-center justify-between transition-colors rounded-lg ${isEditing && !isUploadingResume ? 'cursor-pointer hover:border-neo-black dark:hover:border-white' : ''}`}
                                onClick={() => isEditing && !isUploadingResume && handleFileSelection('resume-upload-input')}
                              >
                                  <div className="flex flex-col gap-1 w-full relative">
                                       {isUploadingResume ? (
                                           <div className="flex items-center gap-2 justify-center py-2">
                                               <div className="w-4 h-4 border-2 border-neo-black border-t-transparent rounded-full animate-spin"></div>
                                               <span className="font-bold text-gray-500">Uploading...</span>
                                           </div>
                                       ) : formData.resumeFileURL ? (
                                           <div className="flex flex-col items-center gap-3">
                                              <span className="font-bold text-neo-black dark:text-white block">Resume Uploaded Successfully!</span>
                                              
                                               <a 
                                                   href={formData.resumeFileURL} 
                                                   target="_blank" 
                                                   rel="noopener noreferrer"
                                                   className="px-4 py-2 bg-neo-black text-white text-xs font-bold uppercase border-2 border-transparent hover:border-neo-black hover:bg-white hover:text-neo-black transition-all z-20"
                                                   onClick={(e) => e.stopPropagation()}
                                               >
                                                   View Resume
                                               </a>
                
                                              {isEditing && <span className="text-xs text-gray-500 block mt-1 text-center">Click area to replace</span>}
                                            </div>
                                       ) : (
                                          <span className="font-bold text-gray-500 dark:text-gray-400 text-center block">
                                              {isEditing ? 'Click to upload resume' : 'No file uploaded'}
                                          </span>
                                       )}
                                  </div>
                                  <input type="file" id="resume-upload-input" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={isUploadingResume} />
                              </div>
                           </div>
                      </div>
                  )}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-zinc-700 flex justify-between">
                  {activeStep > 1 ? (
                      <NeoButton onClick={prevStep} variant="secondary">Previous</NeoButton>
                  ) : <div />}
                  {activeStep < 4 ? (
                      <NeoButton onClick={nextStep} className="bg-neo-black text-white">Next</NeoButton>
                  ) : <div />}
              </div>
          </NeoCard>
        </div>
      </div>
      )}
    </AuthGuard>
  );
}
