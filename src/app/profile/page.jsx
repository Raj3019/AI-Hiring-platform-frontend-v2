'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/lib/store';
import { employeeAPI } from '@/lib/api';
import { NeoCard, NeoButton, NeoInput, NeoBadge } from '@/components/ui/neo';
import { User, Briefcase, MapPin, GraduationCap, Globe, Edit2, Save, X } from 'lucide-react';

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

export default function ProfilePage() {
  const { user, updateProfile, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
     name: user?.name || '',
     title: user?.title || '',
     bio: user?.bio || '',
     phone: '',
     dob: '',
     gender: '',
     address: { locality: '', city: 'London', state: 'England', country: 'UK', zipCode: '' },
     skills: ['React', 'Node.js', 'TypeScript', 'Figma'],
     socialLinks: { portfolio: '', linkedin: '', github: '' },
     education: [],
     experience: [],
     isFresher: false,
     totalExperience: 3,
     resumeUrl: user?.resume || user?.resumeUrl || user?.resumeFileURL || '',
     createdAt: user?.createdAt || ''
  });

  // Function to sync formData with the latest user data from store/API
  const syncFormData = (apiData) => {
    if (!apiData) return;
    setFormData(prev => ({
      ...prev,
      name: apiData.fullName || apiData.name || '',
      title: apiData.currentJobTitle || apiData.title || apiData.role || '',
      bio: apiData.about || apiData.bio || '',
      phone: apiData.phone || '',
      dob: apiData.dob || '',
      gender: apiData.gender || '',
      address: {
        locality: apiData.area || apiData.address?.locality || '',
        city: apiData.currentCity || apiData.address?.city || '',
        state: apiData.state || apiData.address?.state || '',
        country: apiData.country || apiData.address?.country || '',
        zipCode: apiData.zipCode || apiData.address?.zipCode || '',
      },
      skills: apiData.skills || [],
      skillsString: apiData.skills?.join(', ') || '',
      socialLinks: {
        portfolio: apiData.portfolioUrl || apiData.socialLinks?.portfolio || '',
        linkedin: apiData.linkedinUrl || apiData.socialLinks?.linkedin || '',
        github: apiData.githubUrl || apiData.socialLinks?.github || '',
      },
      education: apiData.education || [],
      experience: apiData.workExperience || apiData.experience || [],
      isFresher: apiData.isFresher !== undefined ? apiData.isFresher : (apiData.experienceYears === 0 || (apiData.workExperience?.length === 0 && apiData.experience?.length === 0)),
      totalExperience: apiData.experienceYears || 0,
      resumeUrl: apiData.resume || apiData.resumeUrl || apiData.resumeFileURL || '',
      createdAt: apiData.createdAt || ''
    }));
  };

  // Load user data from backend on mount
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

  const handleExperienceChange = (index, field, value) => {
    const updatedExp = [...formData.experience];
    updatedExp[index] = { ...updatedExp[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: updatedExp }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddressChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          address: { ...prev.address, [name]: value }
      }));
  };

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));
  
  const saveProfile = async () => {
    setIsUploading(true);
    if (!user || !user._id) {
        setSuccessMessage("Error: User ID missing. Please refresh.");
        setIsUploading(false);
        return;
    }

    try {
        const profilePayload = {
            fullName: formData.name,
            name: formData.name,
            currentJobTitle: formData.title,
            title: formData.title,
            about: formData.bio,
            bio: formData.bio,
            phone: formData.phone,
            dob: formData.dob,
            gender: formData.gender,
            area: formData.address?.locality,
            currentCity: formData.address?.city,
            state: formData.address?.state,
            country: formData.address?.country,
            zipCode: formData.address?.zipCode,
            skills: formData.skills,
            portfolioUrl: formData.socialLinks?.portfolio,
            linkedinUrl: formData.socialLinks?.linkedin,
            githubUrl: formData.socialLinks?.github,
            education: formData.education,
            workExperience: formData.experience,
            experienceYears: formData.totalExperience,
            isFresher: formData.isFresher,
            resume: formData.resumeUrl
        };

        const res = await employeeAPI.updateProfile(user._id, profilePayload);
        updateProfile(profilePayload);
        if (user?.role) await fetchProfile(user.role);
        setIsEditing(false);
        setSuccessMessage(res?.message || 'Profile saved successfully!');
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to save profile.';
        setSuccessMessage(errorMsg); 
    } finally {
        setIsUploading(false);
        setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // Reset formData to current user data from store
    if (user) syncFormData(user);
  };

  const handleProfilePicUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePicture', file);
      setIsUploading(true);
      try {
        const res = await employeeAPI.updateProfilePicture(formData);
        if(res.profilePicture) {
             updateProfile({ profilePicture: res.profilePicture });
             setSuccessMessage('Profile picture updated!');
        }
      } catch (error) {
        setSuccessMessage('Failed to upload image.');
      } finally {
        setIsUploading(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleResumeUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       const fileData = new FormData();
       fileData.append('resume', file);
       setIsUploading(true);
       try {
           const res = await employeeAPI.updateResume(fileData);
           const resumeUrl = res.resume || res.resumeUrl || res.url || res.link || (res.data && res.data.resume);
           if(resumeUrl) {
               setFormData(prev => ({ ...prev, resumeUrl: resumeUrl }));
               setSuccessMessage('Resume uploaded successfully!');
           } else {
               await fetchProfile(user.role);
               setSuccessMessage('Resume uploaded! Refreshing...');
           }
       } catch (error) {
           setSuccessMessage('Failed to upload resume.');
       } finally {
           setIsUploading(false);
           setTimeout(() => setSuccessMessage(''), 3000);
       }
    }
  };
  
  const handleFileSelection = (inputId) => {
     document.getElementById(inputId).click();
  };

  const steps = [
    { id: 1, label: "Personal Information", icon: User },
    { id: 2, label: "Education & Skills", icon: GraduationCap },
    { id: 3, label: "Experience", icon: Briefcase },
    { id: 4, label: "Additional Info", icon: Globe },
  ];

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Jan 2024';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <AuthGuard allowedRoles={['candidate']}>
      {isLoadingProfile ? (
        <div className="min-h-screen flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neo-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
               <img src={user?.profilePicture || user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter"} alt="Profile" className="w-full h-full object-cover" />
               {isEditing && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleFileSelection('profile-pic-input')}>
                       <span className="text-white text-xs font-bold uppercase">Change</span>
                   </div>
               )}
               <input type="file" id="profile-pic-input" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
            </div>
            <h2 className="text-2xl font-black uppercase dark:text-white uppercase">{formData.name}</h2>
            <p className="font-mono text-gray-500 dark:text-gray-400 mb-2">{formData.title || 'Product Designer'}</p>
            
            <div className="flex justify-center items-center gap-2 mb-6">
               <span className="text-sm text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1">
                   <MapPin className="w-4 h-4"/> {formData.address?.city}, {formData.address?.country}
               </span>
            </div>

            <NeoBadge variant="blue"><span className="text-xs uppercase font-bold">PRO MEMBER</span></NeoBadge>

            <div className="mt-8 text-left">
              <h4 className="font-bold text-xs uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-widest">Skills</h4>
              <div className="flex flex-wrap gap-2">
                  {formData.skills?.slice(0, 4).map((skill, i) => (
                      <span key={i} className="text-xs border border-neo-black dark:border-white px-2 py-1 bg-white dark:bg-zinc-800 dark:text-white rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none">{skill}</span>
                  )) || <span className="text-xs text-gray-400">Add skills to see them here</span>}
              </div>
            </div>

            <div className="mt-8 border-t-2 border-gray-100 dark:border-zinc-700 pt-6 grid grid-cols-2 gap-4 text-left">
               <div>
                   <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Member Since</span>
                   <span className="font-bold dark:text-white uppercase">{formatMemberSince(formData.createdAt)}</span>
               </div>
               <div>
                   <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Experience</span>
                   <span className="font-bold dark:text-white">{!formData.isFresher ? `${formData.totalExperience} Years` : 'Fresher'}</span>
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
                <NeoButton onClick={saveProfile} className="bg-neo-green text-white" disabled={isUploading}>
                  <Save className="w-4 h-4 mr-2" /> {isUploading ? 'Saving...' : 'Save Changes'}
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
                                ${isActive ? 'bg-neo-yellow border-neo-black dark:border-white text-black scale-110' : 
                                  isCompleted ? 'bg-neo-green border-neo-black dark:border-white text-white' : 
                                  'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-400'}`}>
                                {isCompleted ? '✓' : step.id}
                            </div>
                            <span className={`mt-2 text-xs font-bold uppercase tracking-wide bg-white dark:bg-black px-1 
                                ${isActive ? 'text-neo-black dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                {step.label}
                            </span>
                        </button>
                    )
                })}
            </div>
             <div className="md:hidden flex justify-between items-center bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-4 shadow-neo-sm">
                <span className="font-black uppercase text-sm dark:text-white">Step {activeStep} of 4</span>
                <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">{steps[activeStep-1].label}</span>
            </div>
          </div>

          <NeoCard className="min-h-[600px] flex flex-col border-4">
              <h3 className="text-2xl font-black uppercase mb-1 dark:text-white">{steps[activeStep-1].label}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-6 border-b-2 border-gray-100 dark:border-zinc-700 pb-4">
                {isEditing ? 'Enter your details below to stand out.' : 'Your profile information.'}
              </p>
              
              <div className="flex-grow space-y-6">
                  {activeStep === 1 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                          <DisplayField isEditing={isEditing} label="Full Name" value={formData.name} name="name" onChange={handleInputChange} />
                          <DisplayField isEditing={isEditing} label="About" value={formData.bio} name="bio" onChange={handleInputChange} isTextarea={true} placeholder="Tell us about yourself..." />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DisplayField isEditing={isEditing} label="Phone Number" value={formData.phone} name="phone" onChange={handleInputChange} placeholder="10 Digit Number" />
                              <DisplayField isEditing={isEditing} label="Date of Birth" value={formData.dob} name="dob" type="date" onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <label className="block font-bold text-sm mb-1 dark:text-white">Gender</label>
                                 {isEditing ? (
                                   <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow h-[46px] dark:text-white">
                                       <option value="">Select...</option>
                                       <option value="Male">Male</option>
                                       <option value="Female">Female</option>
                                       <option value="Other">Other</option>
                                   </select>
                                 ) : (
                                   <span className="font-bold dark:text-white text-lg">{formData.gender || 'Not specified'}</span>
                                 )}
                               </div>
                          </div>
                          <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                               <label className="block font-bold text-sm mb-3 uppercase text-gray-400 dark:text-gray-500 tracking-widest">Address Details</label>
                               <div className="space-y-4">
                                  <DisplayField isEditing={isEditing} label="Area / Locality" value={formData.address?.locality} name="locality" onChange={handleAddressChange} placeholder="Borough" />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <DisplayField isEditing={isEditing} label="City" value={formData.address?.city} name="city" onChange={handleAddressChange} placeholder="London" />
                                      <DisplayField isEditing={isEditing} label="State" value={formData.address?.state} name="state" onChange={handleAddressChange} placeholder="England" />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <DisplayField isEditing={isEditing} label="Country" value={formData.address?.country} name="country" onChange={handleAddressChange} placeholder="United Kingdom" />
                                      <DisplayField isEditing={isEditing} label="Zip Code" value={formData.address?.zipCode} name="zipCode" onChange={handleAddressChange} placeholder="SE1 2BG" />
                                  </div>
                               </div>
                          </div>
                      </div>
                  )}

                  {activeStep === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                           <div>
                             <label className="block font-bold text-sm mb-1 dark:text-white">Skills</label>
                             {isEditing ? (
                                <NeoInput 
                                    name="skills" 
                                    value={formData.skillsString || formData.skills?.join(', ')} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({
                                            ...prev, 
                                            skillsString: val,
                                            skills: val.split(',').map(s => s.trim())
                                        }));
                                    }} 
                                    placeholder="React, Node.js, Design..." 
                                />
                             ) : (
                               <div className="flex flex-wrap gap-2 mt-2">
                                 {formData.skills?.map((skill, i) => (
                                   <NeoBadge key={i} variant="blue">{skill}</NeoBadge>
                                 )) || <span className="text-gray-400">No skills added</span>}
                               </div>
                             )}
                           </div>
                          <div className="space-y-4">
                              {['10th Standard', 'Junior College (12th)', 'Graduation', 'Post Graduation (Optional)'].map((level, idx) => (
                                  <details key={idx} className="group border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                                      <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white">
                                          {level}
                                          <span className="text-xl group-open:rotate-180 transition-transform">▼</span>
                                      </summary>
                                      <div className="p-4 border-t-2 border-neo-black dark:border-white grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="md:col-span-2">
                                              <label className="block font-bold text-xs mb-1 dark:text-white">Institution Name</label>
                                              <NeoInput placeholder="School / College Name" disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                          </div>
                                          <div>
                                              <label className="block font-bold text-xs mb-1 dark:text-white">{idx >= 2 ? 'University' : 'Board'}</label>
                                              <NeoInput placeholder="Board / University" disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                          </div>
                                          {idx >= 2 && (
                                              <div>
                                                  <label className="block font-bold text-xs mb-1 dark:text-white">Degree</label>
                                                  <NeoInput placeholder="e.g. B.Tech" disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                              </div>
                                          )}
                                          <div>
                                              <label className="block font-bold text-xs mb-1 dark:text-white">{idx === 1 ? 'Stream' : idx >= 2 ? 'Specialization' : 'Year'}</label>
                                              <NeoInput placeholder={idx === 1 ? "Science/Commerce" : "Year"} disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                          </div>
                                          <div>
                                              <label className="block font-bold text-xs mb-1 dark:text-white">Percentage / CGPA</label>
                                              <NeoInput placeholder="e.g. 85%" disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                          </div>
                                          <div>
                                              <label className="block font-bold text-xs mb-1 dark:text-white">Year of Passing</label>
                                              <NeoInput placeholder="2015" disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                          </div>
                                      </div>
                                  </details>
                              ))}
                          </div>
                      </div>
                  )}

                  {activeStep === 3 && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                           <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 border-2 border-neo-black dark:border-white shadow-neo-sm">
                                {isEditing ? (
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-neo-black dark:accent-white cursor-pointer" 
                                    id="fresher" 
                                    checked={formData.isFresher} 
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setFormData(p => ({
                                            ...p, 
                                            isFresher: checked,
                                            totalExperience: checked ? 0 : p.totalExperience
                                        }));
                                    }} 
                                  />
                                ) : (
                                  <div className={`w-3 h-3 rounded-full ${formData.isFresher ? 'bg-neo-green' : 'bg-neo-blue'}`}></div>
                                )}
                                 <label htmlFor="fresher" className={`font-bold cursor-pointer uppercase text-sm tracking-tight ${formData.isFresher ? 'text-neo-green' : 'text-neo-blue dark:text-blue-400'}`}>
                                   {formData.isFresher ? 'I AM A FRESHER' : 'I HAVE WORK EXPERIENCE'}
                                 </label>
                           </div>
                            {!formData.isFresher && (
                               <div className="space-y-4">
                                 <div className="space-y-1">
                                   <label className="block font-bold text-sm dark:text-white uppercase tracking-tight">Total Years of Experience</label>
                                   <NeoInput type="number" name="totalExperience" value={formData.totalExperience} onChange={handleInputChange} disabled={!isEditing} />
                                 </div>
                                 <div className="flex justify-between items-center pt-4">
                                   <h4 className="font-bold uppercase text-sm dark:text-white font-mono">Work Experience Details</h4>
                                   {isEditing && (
                                     <NeoButton variant="secondary" className="text-xs py-1 px-3" onClick={addExperience}>
                                       + Add Experience
                                     </NeoButton>
                                   )}
                                 </div>
                                 {formData.experience?.length > 0 ? (
                                   formData.experience.map((exp, idx) => (
                                     <div key={idx} className="border-2 border-neo-black dark:border-white p-4 relative bg-white dark:bg-zinc-900 shadow-neo-sm">
                                       {isEditing && (
                                         <button 
                                           onClick={() => removeExperience(idx)}
                                           className="absolute top-2 right-2 text-red-500 font-bold text-xs hover:underline uppercase"
                                         >
                                           Remove
                                         </button>
                                       )}
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                   <div>
                                                       <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Job Title</label>
                                                       <NeoInput 
                                                           placeholder="e.g. Product Designer" 
                                                           value={exp.jobTitle || ''} 
                                                           onChange={(e) => handleExperienceChange(idx, 'jobTitle', e.target.value)}
                                                           disabled={!isEditing} 
                                                       />
                                                   </div>
                                                   <div>
                                                       <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Company</label>
                                                       <NeoInput 
                                                           placeholder="Company Name" 
                                                           value={exp.company || ''} 
                                                           onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                                           disabled={!isEditing} 
                                                       />
                                                   </div>
                                               </div>
                                               <div className="mb-4">
                                                   <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Location</label>
                                                   <NeoInput 
                                                       placeholder="City, Country" 
                                                       value={exp.location || ''} 
                                                       onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                                                       disabled={!isEditing} 
                                                   />
                                               </div>
                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                   <div>
                                                       <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Start Date</label>
                                                       <NeoInput 
                                                           type="date" 
                                                           value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} 
                                                           onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                                                           disabled={!isEditing} 
                                                       />
                                                   </div>
                                                     {!exp.currentlyWorking && (
                                                       <div>
                                                         <label className="block font-bold text-xs mb-1 dark:text-white uppercase">End Date</label>
                                                         <NeoInput 
                                                           type="date" 
                                                           value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''} 
                                                           onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                                                           disabled={!isEditing} 
                                                         />
                                                       </div>
                                                     )}
                                               </div>
                                               <div className="mb-4">
                                                   <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Description</label>
                                                   <textarea 
                                                       value={exp.description || ''}
                                                       onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                                       disabled={!isEditing} 
                                                       className="w-full border-2 border-neo-black dark:border-white p-2 font-mono text-sm h-20 bg-white dark:bg-zinc-900 dark:text-white" 
                                                       placeholder="Roles and responsibilities..."
                                                   ></textarea>
                                               </div>
                                               <div className="flex items-center gap-2 mb-2 mt-2">
                                                   <input 
                                                       type="checkbox" 
                                                       checked={exp.currentlyWorking} 
                                                       onChange={(e) => handleExperienceChange(idx, 'currentlyWorking', e.target.checked)}
                                                       disabled={!isEditing}
                                                       id={`current-cand-${idx}`}
                                                   />
                                                   <label htmlFor={`current-cand-${idx}`} className="text-xs font-bold uppercase dark:text-gray-400">I currently work here</label>
                                               </div>
                                           </div>
                                       ))
                                   ) : (
                                       <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-zinc-700 font-mono text-sm text-gray-500 uppercase">
                                           No experience items added
                                       </div>
                                   )}
                               </div>
                          )}
                       </div>
                  )}

                  {activeStep === 4 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                           <div>
                             <label className="block font-bold text-sm mb-1 dark:text-white">Resume Upload</label>
                             <div 
                               className={`border-2 border-dashed ${formData.resumeUrl ? 'border-neo-green bg-neo-green/10' : 'border-gray-300 dark:border-zinc-600'} p-6 text-center rounded-lg bg-white dark:bg-zinc-900 transition-colors relative cursor-pointer`}
                               onClick={() => isEditing && handleFileSelection('resume-upload-input')}
                             >
                                 {formData.resumeUrl ? (
                                    <div className="flex flex-col items-center gap-3">
                                      <span className="font-bold text-neo-black dark:text-white block">Resume Uploaded Successfully!</span>
                                      
                                       <a 
                                           href={formData.resumeUrl} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="px-4 py-2 bg-neo-black text-white text-xs font-bold uppercase border-2 border-transparent hover:border-neo-black hover:bg-white hover:text-neo-black transition-all z-20"
                                           onClick={(e) => e.stopPropagation()}
                                       >
                                           View Resume
                                       </a>

                                      {isEditing && <span className="text-xs text-gray-500 block mt-1">Click area to replace</span>}
                                    </div>
                                 ) : (
                                    <span className="font-bold text-gray-500 dark:text-gray-400">{isUploading ? 'Uploading...' : 'Click to upload resume'}</span>
                                 )}
                                 <input type="file" id="resume-upload-input" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                             </div>
                           </div>
                           <div>
                             <label className="block font-bold text-sm mb-1 dark:text-white">Social Links</label>
                             <div className="space-y-4">
                               <NeoInput name="portfolio" value={formData.socialLinks?.portfolio} onChange={(e) => setFormData(p => ({...p, socialLinks: {...p.socialLinks, portfolio: e.target.value}}))} placeholder="Portfolio URL" disabled={!isEditing} />
                               <NeoInput name="linkedin" value={formData.socialLinks?.linkedin} onChange={(e) => setFormData(p => ({...p, socialLinks: {...p.socialLinks, linkedin: e.target.value}}))} placeholder="LinkedIn URL" disabled={!isEditing} />
                               <NeoInput name="github" value={formData.socialLinks?.github} onChange={(e) => setFormData(p => ({...p, socialLinks: {...p.socialLinks, github: e.target.value}}))} placeholder="GitHub URL" disabled={!isEditing} />
                             </div>
                           </div>
                      </div>
                  )}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-zinc-700 flex justify-between">
                  {activeStep > 1 ? (
                      <NeoButton onClick={prevStep} variant="secondary">Previous</NeoButton>
                  ) : <div></div>}
                  {activeStep < 4 && (
                      <NeoButton onClick={nextStep} className="bg-neo-black text-white">Next</NeoButton>
                  )}
              </div>
          </NeoCard>
        </div>
      </div>
      )}
    </AuthGuard>
  );
}
