'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/lib/store';
import { getMissingProfileFields } from '@/lib/utils';
import { employeeAPI } from '@/lib/api';
import { NeoCard, NeoButton, NeoInput, NeoBadge, NeoDatePicker, NeoCheckbox } from '@/components/ui/neo';
import { User, Briefcase, MapPin, GraduationCap, Globe, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

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
    if (type === 'date') {
      return (
        <NeoDatePicker label={label} name={name} value={value || ''} onChange={onChange} {...props} />
      );
    }
    return (
      <NeoInput label={label} type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} {...props} />
    );
  }
  return (
    <div>
      <label className="block font-bold text-xs mb-1 text-gray-400 dark:text-gray-500 uppercase">{label}</label>
      <span className="font-bold dark:text-white text-lg block break-words">{value || 'Not specified'}</span>
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
     fullName: '',
     currentJobTitle: '',
     currentCompany: '',
     about: '',
     phone: '',
     dateOfBirth: '',
     gender: '',
     
     // Address
     area: '',
     currentCity: '',
     state: '',
     country: '',
     zipCode: '',
     
     skills: [],
     skillsString: '',

     // Education Object (Matching Mongoose Schema)
     education: {
        tenth: { schoolName: '', board: '', percentage: '', year: '', city: '', state: '', grade: '' },
        juniorCollege: { collegeName: '', board: '', stream: '', percentage: '', year: '', city: '', state: '', grade: '' },
        graduation: { collegeName: '', university: '', degree: '', specialization: '', percentage: '', cgpa: '', year: '', city: '', state: '', grade: '' },
        postGraduation: { collegeName: '', university: '', degree: '', specialization: '', percentage: '', cgpa: '', year: '', city: '', state: '', grade: '' },
        phd: { university: '', fieldOfStudy: '', thesisTitle: '', year: '' }
     },

     workExperience: [],
     isFresher: false,
     experienceYears: 0,
     
     // New Fields
     languages: [],
     certifications: [],
     jobPreferences: {
        jobType: [], 
        workMode: [], 
        preferredLocations: [],
        willingToRelocate: false
     },
     preferredLocationsString: '',
     expectedSalary: { min: '', max: '', currency: 'INR' },

     resumeFileURL: '',
     portfolioUrl: '',
     linkedinUrl: '',
     githubUrl: '',
     createdAt: ''
  });

  const syncFormData = (apiData) => {
    if (!apiData) return;
    
    // Safely extract nested objects
    const edu = apiData.education || {};
    const jp = apiData.jobPreferences || {};
    const es = apiData.expectedSalary || {};

    setFormData(prev => ({
      ...prev,
      fullName: apiData.fullName || apiData.name || '',
      currentJobTitle: apiData.currentJobTitle || apiData.title || apiData.role || '',
      currentCompany: apiData.currentCompany || '',
      about: apiData.about || apiData.bio || '',
      phone: apiData.phone || '',
      dateOfBirth: apiData.dateOfBirth || apiData.dob ? new Date(apiData.dateOfBirth || apiData.dob).toISOString().split('T')[0] : '',
      gender: apiData.gender || '',
      
      // Address (Support both flat and nested for read)
      area: apiData.area || apiData.address?.locality || '',
      currentCity: apiData.currentCity || apiData.address?.city || '',
      state: apiData.state || apiData.address?.state || '',
      country: apiData.country || apiData.address?.country || '',
      zipCode: apiData.zipCode || apiData.address?.zipCode || '',

      skills: apiData.skills || [],
      skillsString: apiData.skills?.join(', ') || '',
      
      // Socials
      portfolioUrl: apiData.portfolioUrl || apiData.socialLinks?.portfolio || '',
      linkedinUrl: apiData.linkedinUrl || apiData.socialLinks?.linkedin || '',
      githubUrl: apiData.githubUrl || apiData.socialLinks?.github || '',

      // Education
      education: {
        tenth: { 
            schoolName: edu.tenth?.schoolName || '', 
            board: edu.tenth?.board || '', 
            percentage: edu.tenth?.percentage || '', 
            year: edu.tenth?.passingYear || edu.tenth?.year || '',
            city: edu.tenth?.city || '',
            state: edu.tenth?.state || '',
            grade: edu.tenth?.grade || ''
        },
        juniorCollege: { 
            collegeName: edu.juniorCollege?.collegeName || '', 
            board: edu.juniorCollege?.board || '', 
            stream: edu.juniorCollege?.stream || '', 
            percentage: edu.juniorCollege?.percentage || '', 
            year: edu.juniorCollege?.passingYear || edu.juniorCollege?.year || '',
            city: edu.juniorCollege?.city || '',
            state: edu.juniorCollege?.state || '',
            grade: edu.juniorCollege?.grade || ''
        },
        graduation: { 
            collegeName: edu.graduation?.collegeName || '', 
            university: edu.graduation?.university || '', 
            degree: edu.graduation?.degree || '', 
            specialization: edu.graduation?.specialization || '', 
            percentage: edu.graduation?.percentage || '', 
            cgpa: edu.graduation?.cgpa || '', 
            year: edu.graduation?.passingYear || edu.graduation?.year || '',
            city: edu.graduation?.city || '',
            state: edu.graduation?.state || '',
            grade: edu.graduation?.grade || ''
        },
        postGraduation: { 
            collegeName: edu.postGraduation?.collegeName || '', 
            university: edu.postGraduation?.university || '', 
            degree: edu.postGraduation?.degree || '', 
            specialization: edu.postGraduation?.specialization || '', 
            percentage: edu.postGraduation?.percentage || '', 
            cgpa: edu.postGraduation?.cgpa || '', 
            year: edu.postGraduation?.passingYear || edu.postGraduation?.year || '',
            city: edu.postGraduation?.city || '',
            state: edu.postGraduation?.state || '',
            grade: edu.postGraduation?.grade || ''
        },
        phd: {
            university: edu.phd?.university || '',
            fieldOfStudy: edu.phd?.fieldOfStudy || '',
            thesisTitle: edu.phd?.thesisTitle || '',
            year: edu.phd?.year || ''
        }
      },

      workExperience: apiData.workExperience || apiData.experience || [],
      isFresher: apiData.isFresher !== undefined ? apiData.isFresher : (apiData.experienceYears === 0),
      experienceYears: apiData.experienceYears || 0,
      
      languages: apiData.languages || [],
      certifications: apiData.certifications || [],
      
      jobPreferences: {
          jobType: jp.jobType || [],
          workMode: jp.workMode || [],
          preferredLocations: jp.preferredLocations || [],
          willingToRelocate: jp.willingToRelocate || false
      },
      preferredLocationsString: jp.preferredLocations?.join(', ') || '',
      
      expectedSalary: {
          min: es.min || '',
          max: es.max || '',
          currency: es.currency || 'INR'
      },

      resumeFileURL: apiData.resumeFileURL || apiData.resume || apiData.resumeUrl || '',
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
    if (user && !isEditing) syncFormData(user);
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

  // List Handlers
  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, workExperience: updated }));
  };
  const addExperience = () => setFormData(prev => ({ ...prev, workExperience: [...prev.workExperience, { jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' }] }));
  const removeExperience = (index) => setFormData(prev => ({ ...prev, workExperience: prev.workExperience.filter((_, i) => i !== index) }));

  const handleLanguageChange = (index, field, value) => {
    const updated = [...formData.languages];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, languages: updated }));
  };
  const addLanguage = () => setFormData(prev => ({ ...prev, languages: [...prev.languages, { language: '', proficiency: 'Beginner' }] }));
  const removeLanguage = (index) => setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));

  const handleCertificationChange = (index, field, value) => {
    const updated = [...formData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, certifications: updated }));
  };
  const addCertification = () => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialURL: '' }] }));
  const removeCertification = (index) => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));

  const toggleSelection = (category, item) => {
      setFormData(prev => {
          const list = prev.jobPreferences[category];
          const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
          return { ...prev, jobPreferences: { ...prev.jobPreferences, [category]: newList } };
      });
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
            fullName: formData.fullName,
            about: formData.about,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            
            // Address (Flat + Nested)
            area: formData.area,
            currentCity: formData.currentCity,
            state: formData.state,
            country: formData.country,
            zipCode: formData.zipCode,
            address: { locality: formData.area, city: formData.currentCity, state: formData.state, country: formData.country, zipCode: formData.zipCode },

            currentJobTitle: formData.currentJobTitle,
            currentCompany: formData.currentCompany,
            skills: formData.skills,

            // Socials (Flat + Nested)
            portfolioUrl: formData.portfolioUrl,
            linkedinUrl: formData.linkedinUrl,
            githubUrl: formData.githubUrl,
            socialLinks: { portfolio: formData.portfolioUrl, linkedin: formData.linkedinUrl, github: formData.githubUrl },

            // Education Object
            education: {
                tenth: { 
                    ...formData.education.tenth, 
                    passingYear: Number(formData.education.tenth.year) || null,
                    percentage: Number(formData.education.tenth.percentage) || null
                },
                juniorCollege: { 
                    ...formData.education.juniorCollege, 
                    passingYear: Number(formData.education.juniorCollege.year) || null,
                    percentage: Number(formData.education.juniorCollege.percentage) || null
                },
                graduation: { 
                    ...formData.education.graduation, 
                    passingYear: Number(formData.education.graduation.year) || null,
                    percentage: Number(formData.education.graduation.percentage) || null,
                    cgpa: Number(formData.education.graduation.cgpa) || null
                },
                postGraduation: { 
                    ...formData.education.postGraduation, 
                    passingYear: Number(formData.education.postGraduation.year) || null,
                    percentage: Number(formData.education.postGraduation.percentage) || null,
                    cgpa: Number(formData.education.postGraduation.cgpa) || null
                },
                phd: {
                    ...formData.education.phd,
                    year: Number(formData.education.phd.year) || null
                }
            },
            
            workExperience: formData.workExperience,
            experienceYears: Number(formData.experienceYears) || 0,
            isFresher: formData.isFresher,
            languages: formData.languages,
            certifications: formData.certifications,
            jobPreferences: {
                ...formData.jobPreferences,
                 preferredLocations: formData.jobPreferences.preferredLocations
            },
            expectedSalary: {
                 min: Number(formData.expectedSalary.min) || 0,
                 max: Number(formData.expectedSalary.max) || 0,
                 currency: formData.expectedSalary.currency
            },
            resumeFileURL: formData.resumeFileURL
        };

        const res = await employeeAPI.updateProfile(user._id, profilePayload);
        updateProfile(profilePayload);
        if (user?.role) await fetchProfile(user.role);
        setIsEditing(false);
        setSuccessMessage(res?.message || 'Profile saved successfully!');
    } catch (error) {
        setSuccessMessage(error.response?.data?.message || error.message || 'Failed to save profile.'); 
    } finally {
        setIsUploading(false);
        setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleProfilePicUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePicture', file);
      setIsUploading(true);
      try {
        const res = await employeeAPI.updateProfilePicture(formData);
        if(res.profilePicture) updateProfile({ profilePicture: res.profilePicture });
      } catch (error) {} 
      finally { setIsUploading(false); }
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
           const resumeUrl = res.resume || res.resumeUrl || res.url || res.data?.resume || res.resumeFileURL;
           if(resumeUrl) setFormData(prev => ({ ...prev, resumeFileURL: resumeUrl }));
       } catch (error) {} 
       finally { setIsUploading(false); }
    }
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
          <div className="text-center"><div className="w-16 h-16 border-4 border-neo-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div></div>
        </div>
      ) : (
      <div className="min-h-screen bg-neo-bg dark:bg-zinc-950">
        {/* Missing Fields Top Bar */}
        {user && getMissingProfileFields(user).length > 0 && (
            <div className="bg-neo-red text-white border-b-4 border-neo-black p-3 shadow-md">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl animate-pulse">⚠️</span>
                        <span className="font-black uppercase tracking-wider text-sm md:text-base">Profile Incomplete:</span>
                        <span className="hidden md:inline font-bold text-sm opacity-90">Required for job applications</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                         {getMissingProfileFields(user).map(f => (
                            <span key={f} className="bg-white text-neo-red px-2 py-0.5 text-[10px] font-black uppercase border-2 border-neo-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {formatFieldName(f)}
                            </span>
                         ))}
                    </div>
                </div>
            </div>
        )}
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {successMessage && <div className="fixed top-24 right-4 z-50 bg-neo-green border-2 border-black p-4 text-white font-bold shadow-neo">{successMessage}</div>}
        

        <div className="md:w-1/3">
          <NeoCard className="sticky top-24 text-center border-4">
            <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-zinc-800 rounded-full mb-4 border-4 border-neo-black dark:border-white overflow-hidden relative group">
               <img src={user?.profilePicture || user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter"} alt="Profile" className="w-full h-full object-cover" />
               {isEditing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => document.getElementById('pic').click()}><span className="text-white text-xs font-bold">CHANGE</span></div>}
               <input type="file" id="pic" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
            </div>
            <h2 className="text-2xl font-black uppercase dark:text-white">{formData.fullName}</h2>
            <p className="font-mono text-gray-500 mb-2">{formData.currentJobTitle || 'Employee'}</p>
            <div className="flex justify-center items-center gap-2 mb-6 text-sm font-bold opacity-60"><MapPin className="w-4 h-4"/> {formData.currentCity}, {formData.country}</div>
            <NeoBadge variant="blue">PRO MEMBER</NeoBadge>

            {/* Restored Skills Section */}
            <div className="mt-8 text-left">
              <h4 className="font-bold text-xs uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-widest">Skills</h4>
              <div className="flex flex-wrap gap-2">
                  {formData.skills?.slice(0, 4).map((skill, i) => (
                      <span key={i} className="text-xs border border-neo-black dark:border-white px-2 py-1 bg-white dark:bg-zinc-800 dark:text-white rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none">{skill}</span>
                  )) || <span className="text-xs text-gray-400">Add skills to see them here</span>}
              </div>
            </div>

            {/* Restored Footer Section */}
            <div className="mt-8 border-t-2 border-gray-100 dark:border-zinc-700 pt-6 grid grid-cols-2 gap-4 text-left">
               <div>
                   <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Member Since</span>
                   <span className="font-bold dark:text-white uppercase">{formatMemberSince(formData.createdAt)}</span>
               </div>
               <div>
                   <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Experience</span>
                   <span className="font-bold dark:text-white">{!formData.isFresher ? `${formData.experienceYears} Years` : 'Fresher'}</span>
               </div>
            </div>
          </NeoCard>
        </div>

        <div className="md:w-2/3">
          <div className="mb-6 flex justify-end gap-3">
            {!isEditing ? (
              <NeoButton onClick={() => setIsEditing(true)} className="bg-neo-yellow text-neo-black"><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</NeoButton>
            ) : (
              <>
                <NeoButton onClick={() => { setIsEditing(false); syncFormData(user); }} variant="secondary"><X className="w-4 h-4 mr-2" /> Cancel</NeoButton>
                <NeoButton onClick={saveProfile} className="bg-neo-green text-white" disabled={isUploading}><Save className="w-4 h-4 mr-2" /> Save</NeoButton>
              </>
            )}
          </div>

          <div className="mb-8">
            <div className="hidden md:flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-zinc-700 -z-10"></div>
                {steps.map((step) => (
                    <button key={step.id} onClick={() => setActiveStep(step.id)} className="flex flex-col items-center group">
                        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-lg font-bold transition-all z-10 ${activeStep === step.id ? 'bg-neo-yellow border-black scale-110' : activeStep > step.id ? 'bg-neo-green border-black text-white' : 'bg-white border-gray-300 text-gray-400'}`}>{activeStep > step.id ? '✓' : step.id}</div>
                        <span className="mt-2 text-xs font-bold uppercase tracking-wide bg-white dark:bg-black px-1 dark:text-gray-300">{step.label}</span>
                    </button>
                ))}
            </div>
          </div>

          <NeoCard className="min-h-[600px] flex flex-col border-4">
              <h3 className="text-2xl font-black uppercase mb-1 dark:text-white">{steps[activeStep-1].label}</h3>
              <div className="h-1 w-20 bg-neo-yellow mb-6"></div>
              
              <div className="flex-grow space-y-6">
                  {activeStep === 1 && (
                      <div className="space-y-6">
                          <DisplayField isEditing={isEditing} label="Full Name" value={formData.fullName} name="fullName" onChange={handleInputChange} />
                          <DisplayField isEditing={isEditing} label="About" value={formData.about} name="about" onChange={handleInputChange} isTextarea placeholder="Tell us about yourself..." />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DisplayField isEditing={isEditing} label="Phone Number" value={formData.phone} name="phone" onChange={handleInputChange} />
                              <DisplayField isEditing={isEditing} label="Date of Birth" value={formData.dateOfBirth} name="dateOfBirth" type="date" onChange={handleInputChange} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <label className="block font-bold text-sm mb-1 dark:text-white">Gender</label>
                                 {isEditing ? (
                                   <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-900 border-2 border-black p-3 font-mono text-sm dark:text-white"><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                                 ) : <span className="font-bold text-lg dark:text-white">{formData.gender || 'Not specified'}</span>}
                               </div>
                               <DisplayField isEditing={isEditing} label="Current Company" value={formData.currentCompany} name="currentCompany" onChange={handleInputChange} />
                          </div>
                          <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                               <label className="block font-bold text-sm mb-3 uppercase text-gray-400">Address Details</label>
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
                      <div className="space-y-6">
                           <div>
                             <label className="block font-bold text-sm mb-1 dark:text-white">Skills</label>
                             {isEditing ? (
                                <NeoInput name="skills" value={formData.skillsString || formData.skills?.join(', ')} onChange={(e) => setFormData(p => ({...p, skillsString: e.target.value, skills: e.target.value.split(',').map(s=>s.trim())}))} placeholder="React, Node.js..." />
                             ) : (
                               <div className="flex flex-wrap gap-2 mt-2">{formData.skills?.map((s,i) => <NeoBadge key={i} variant="blue">{s}</NeoBadge>) || <span className="text-gray-400">No skills</span>}</div>
                             )}
                           </div>

                           {/* Education Accordions with Extra Fields */}
                           <details className="group border-2 border-black bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                                <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white">10th Standard<span className="text-xl group-open:rotate-180 transition-transform">▼</span></summary>
                                <div className="p-4 border-t-2 border-black grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block font-bold text-xs mb-1">School Name</label><NeoInput value={formData.education.tenth?.schoolName} onChange={(e) => handleEducationChange('tenth', 'schoolName', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Board</label><NeoInput value={formData.education.tenth?.board} onChange={(e) => handleEducationChange('tenth', 'board', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Percentage%</label><NeoInput type="number" value={formData.education.tenth?.percentage} onChange={(e) => handleEducationChange('tenth', 'percentage', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Year</label><NeoInput type="number" value={formData.education.tenth?.year} onChange={(e) => handleEducationChange('tenth', 'year', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">City</label><NeoInput value={formData.education.tenth?.city} onChange={(e) => handleEducationChange('tenth', 'city', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">State</label><NeoInput value={formData.education.tenth?.state} onChange={(e) => handleEducationChange('tenth', 'state', e.target.value)} disabled={!isEditing} /></div>
                                </div>
                           </details>

                           <details className="group border-2 border-black bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                                <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white">12th / Junior College<span className="text-xl group-open:rotate-180 transition-transform">▼</span></summary>
                                <div className="p-4 border-t-2 border-black grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block font-bold text-xs mb-1">College Name</label><NeoInput value={formData.education.juniorCollege?.collegeName} onChange={(e) => handleEducationChange('juniorCollege', 'collegeName', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Board</label><NeoInput value={formData.education.juniorCollege?.board} onChange={(e) => handleEducationChange('juniorCollege', 'board', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Stream</label><NeoInput value={formData.education.juniorCollege?.stream} onChange={(e) => handleEducationChange('juniorCollege', 'stream', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Percentage%</label><NeoInput type="number" value={formData.education.juniorCollege?.percentage} onChange={(e) => handleEducationChange('juniorCollege', 'percentage', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Year</label><NeoInput type="number" value={formData.education.juniorCollege?.year} onChange={(e) => handleEducationChange('juniorCollege', 'year', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">City</label><NeoInput value={formData.education.juniorCollege?.city} onChange={(e) => handleEducationChange('juniorCollege', 'city', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">State</label><NeoInput value={formData.education.juniorCollege?.state} onChange={(e) => handleEducationChange('juniorCollege', 'state', e.target.value)} disabled={!isEditing} /></div>
                                </div>
                           </details>

                           <details className="group border-2 border-black bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                                <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white">Graduation<span className="text-xl group-open:rotate-180 transition-transform">▼</span></summary>
                                <div className="p-4 border-t-2 border-black grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block font-bold text-xs mb-1">College Name</label><NeoInput value={formData.education.graduation?.collegeName} onChange={(e) => handleEducationChange('graduation', 'collegeName', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">University</label><NeoInput value={formData.education.graduation?.university} onChange={(e) => handleEducationChange('graduation', 'university', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Degree</label><NeoInput value={formData.education.graduation?.degree} onChange={(e) => handleEducationChange('graduation', 'degree', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Percentage/CGPA</label><NeoInput type="number" value={formData.education.graduation?.percentage} onChange={(e) => handleEducationChange('graduation', 'percentage', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Year</label><NeoInput type="number" value={formData.education.graduation?.year} onChange={(e) => handleEducationChange('graduation', 'year', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">City</label><NeoInput value={formData.education.graduation?.city} onChange={(e) => handleEducationChange('graduation', 'city', e.target.value)} disabled={!isEditing} /></div>
                                </div>
                           </details>

                           <details className="group border-2 border-black bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                                <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white">Post Graduation<span className="text-xl group-open:rotate-180 transition-transform">▼</span></summary>
                                <div className="p-4 border-t-2 border-black grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block font-bold text-xs mb-1">College Name</label><NeoInput value={formData.education.postGraduation?.collegeName} onChange={(e) => handleEducationChange('postGraduation', 'collegeName', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">University</label><NeoInput value={formData.education.postGraduation?.university} onChange={(e) => handleEducationChange('postGraduation', 'university', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Degree</label><NeoInput value={formData.education.postGraduation?.degree} onChange={(e) => handleEducationChange('postGraduation', 'degree', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Percentage/CGPA</label><NeoInput type="number" value={formData.education.postGraduation?.percentage} onChange={(e) => handleEducationChange('postGraduation', 'percentage', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Year</label><NeoInput type="number" value={formData.education.postGraduation?.year} onChange={(e) => handleEducationChange('postGraduation', 'year', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">City</label><NeoInput value={formData.education.postGraduation?.city} onChange={(e) => handleEducationChange('postGraduation', 'city', e.target.value)} disabled={!isEditing} /></div>
                                </div>
                           </details>

                           {/* PH.D Added with same style */}
                           <details className="group border-2 border-black bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                                <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white">Ph.D (Optional)<span className="text-xl group-open:rotate-180 transition-transform">▼</span></summary>
                                <div className="p-4 border-t-2 border-black grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2"><label className="block font-bold text-xs mb-1">University</label><NeoInput value={formData.education.phd?.university} onChange={(e) => handleEducationChange('phd', 'university', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Field of Study</label><NeoInput value={formData.education.phd?.fieldOfStudy} onChange={(e) => handleEducationChange('phd', 'fieldOfStudy', e.target.value)} disabled={!isEditing} /></div>
                                    <div><label className="block font-bold text-xs mb-1">Year</label><NeoInput type="number" value={formData.education.phd?.year} onChange={(e) => handleEducationChange('phd', 'year', e.target.value)} disabled={!isEditing} /></div>
                                    <div className="md:col-span-2"><label className="block font-bold text-xs mb-1">Thesis Title</label><NeoInput value={formData.education.phd?.thesisTitle} onChange={(e) => handleEducationChange('phd', 'thesisTitle', e.target.value)} disabled={!isEditing} /></div>
                                </div>
                           </details>

                           {/* Lanugages & Certifications */}
                           <div className="pt-6 border-t mt-6">
                               <div className="flex justify-between items-center mb-4">
                                   <label className="font-black text-sm uppercase dark:text-white">Languages Known</label>
                                   {isEditing && (
                                       <NeoButton size="sm" onClick={addLanguage} variant="secondary" className="h-8 text-xs">
                                           <Plus className="w-3 h-3 mr-1"/> Add Language
                                       </NeoButton>
                                   )}
                               </div>
                               
                               {formData.languages.length === 0 ? (
                                   <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 rounded-sm">
                                       <span className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase">No languages added</span>
                                   </div>
                               ) : (
                                   <div className="grid grid-cols-1 gap-3">
                                       {formData.languages.map((l, i) => (
                                         <div key={i} className="flex gap-2 items-center bg-gray-50 dark:bg-zinc-900 border-2 border-black dark:border-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                             <NeoInput 
                                                placeholder="Language (e.g. English)" 
                                                value={l.language} 
                                                onChange={(e) => handleLanguageChange(i, 'language', e.target.value)} 
                                                disabled={!isEditing} 
                                                className="flex-grow border-0 focus:ring-0 bg-transparent"
                                             />
                                             <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                             <select 
                                                className="bg-transparent font-bold text-sm focus:outline-none dark:text-white cursor-pointer" 
                                                value={l.proficiency} 
                                                onChange={(e) => handleLanguageChange(i, 'proficiency', e.target.value)} 
                                                disabled={!isEditing}
                                             >
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Native">Native</option>
                                             </select>
                                             {isEditing && (
                                                 <button onClick={() => removeLanguage(i)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-colors">
                                                     <Trash2 className="w-4 h-4"/>
                                                 </button>
                                             )}
                                         </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                           
                           <div className="pt-6 border-t mt-6">
                               <div className="flex justify-between items-center mb-4">
                                   <label className="font-black text-sm uppercase dark:text-white">Certifications</label>
                                   {isEditing && (
                                       <NeoButton size="sm" onClick={addCertification} variant="secondary" className="h-8 text-xs">
                                           <Plus className="w-3 h-3 mr-1"/> Add Certificate
                                       </NeoButton>
                                   )}
                               </div>

                               {formData.certifications.length === 0 ? (
                                   <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 rounded-sm">
                                       <span className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase">No certifications added</span>
                                   </div>
                               ) : (
                                   <div className="space-y-4">
                                       {formData.certifications.map((c, i) => (
                                         <div key={i} className="border-2 border-black dark:border-white p-4 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative">
                                             {isEditing && (
                                                 <button 
                                                    onClick={() => removeCertification(i)} 
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-600 p-1"
                                                 >
                                                     <Trash2 className="w-4 h-4"/>
                                                 </button>
                                             )}
                                             <span className="absolute -top-3 left-3 bg-neo-yellow px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black">Certificate #{i+1}</span>
                                             
                                             <div className="grid md:grid-cols-2 gap-3 mt-1">
                                                  <div>
                                                      <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Name</label>
                                                      <NeoInput placeholder="ex. AWS Solutions Architect" value={c.name} onChange={(e) => handleCertificationChange(i, 'name', e.target.value)} disabled={!isEditing} />
                                                  </div>
                                                  <div>
                                                      <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Issuing Org</label>
                                                      <NeoInput placeholder="ex. Amazon Web Services" value={c.issuingOrganization} onChange={(e) => handleCertificationChange(i, 'issuingOrganization', e.target.value)} disabled={!isEditing} />
                                                  </div>
                                                  <div>
                                                      <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Issue Date</label>
                                                      <NeoInput type="date" value={c.issueDate ? new Date(c.issueDate).toISOString().split('T')[0] : ''} onChange={(e) => handleCertificationChange(i, 'issueDate', e.target.value)} disabled={!isEditing} />
                                                  </div>
                                                  <div>
                                                      <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Credential URL</label>
                                                      <NeoInput placeholder="https://..." value={c.credentialURL} onChange={(e) => handleCertificationChange(i, 'credentialURL', e.target.value)} disabled={!isEditing} />
                                                  </div>
                                             </div>
                                         </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                      </div>
                  )}

                  {activeStep === 3 && (
                       <div className="space-y-6">
                           <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 border-2 border-black shadow-neo-sm">
                                {isEditing ? (
                                  <NeoCheckbox 
                                    id="fresher" 
                                    checked={formData.isFresher} 
                                    onCheckedChange={(checked) => setFormData(p => ({...p, isFresher: checked, experienceYears: checked ? 0 : p.experienceYears}))}
                                    label={formData.isFresher ? 'I AM A FRESHER' : 'I HAVE WORK EXPERIENCE'}
                                  />
                                ) : (
                                  <>
                                    <div className={`w-3 h-3 rounded-full ${formData.isFresher ? 'bg-neo-green' : 'bg-neo-blue'}`}></div>
                                    <span className="font-bold uppercase text-sm">{formData.isFresher ? 'I AM A FRESHER' : 'I HAVE WORK EXPERIENCE'}</span>
                                  </>
                                )}
                           </div>
                            {!formData.isFresher && (
                               <div className="space-y-4">
                                 <div><label className="block font-bold text-sm uppercase">Total Years</label><NeoInput type="number" value={formData.experienceYears} onChange={handleInputChange} name="experienceYears" disabled={!isEditing} /></div>
                                 <div className="flex justify-between items-center pt-4"><h4 className="font-bold uppercase text-sm">Work Experience</h4>{isEditing && <NeoButton variant="secondary" className="text-xs py-1 px-3" onClick={addExperience}>+ Add</NeoButton>}</div>
                                 {formData.workExperience?.map((exp, idx) => (
                                     <div key={idx} className="border-2 border-black p-4 relative bg-white dark:bg-zinc-900 shadow-neo-sm">
                                       {isEditing && <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-red-500 font-bold text-xs uppercase hover:underline">Remove</button>}
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                           <div><label className="block font-bold text-xs mb-1 uppercase">Job Title</label><NeoInput value={exp.jobTitle} onChange={(e) => handleExperienceChange(idx, 'jobTitle', e.target.value)} disabled={!isEditing} /></div>
                                           <div><label className="block font-bold text-xs mb-1 uppercase">Company</label><NeoInput value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} disabled={!isEditing} /></div>
                                       </div>
                                       <div className="mb-4"><label className="block font-bold text-xs mb-1 uppercase">Location</label><NeoInput value={exp.location} onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)} disabled={!isEditing} /></div>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                           <div><label className="block font-bold text-xs mb-1 uppercase">Start Date</label><NeoInput type="date" value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)} disabled={!isEditing} /></div>
                                           {!exp.currentlyWorking && <div><label className="block font-bold text-xs mb-1 uppercase">End Date</label><NeoInput type="date" value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''} onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)} disabled={!isEditing} /></div>}
                                       </div>
                                       <div className="mb-2"><textarea value={exp.description} onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)} disabled={!isEditing} className="w-full border-2 border-black p-2 font-mono text-sm h-20 dark:bg-zinc-800 dark:text-white" placeholder="Roles..."></textarea></div>
                                       <div className="flex items-center gap-2">
                                          <NeoCheckbox 
                                            checked={exp.currentlyWorking} 
                                            onCheckedChange={(checked) => handleExperienceChange(idx, 'currentlyWorking', checked)} 
                                            disabled={!isEditing} 
                                            label="I currently work here"
                                          />
                                       </div>
                                     </div>
                                 ))}
                               </div>
                          )}
                       </div>
                  )}

                  {activeStep === 4 && (
                      <div className="space-y-6">
                           <div>
                             <label className="block font-bold text-sm mb-1 dark:text-white">Resume</label>
                             <div className={`border-2 border-dashed ${formData.resumeFileURL ? 'border-neo-green bg-green-50' : 'border-gray-300'} p-6 text-center rounded-lg cursor-pointer`} onClick={() => document.getElementById('resume-upl').click()}>
                                 {formData.resumeFileURL ? <div className="flex flex-col items-center gap-3"><span className="font-bold text-neo-black block">Resume Uploaded!</span><a href={formData.resumeFileURL} target="_blank" className="px-4 py-2 bg-neo-black text-white text-xs font-bold uppercase" onClick={(e) => e.stopPropagation()}>View Resume</a></div> : <span className="font-bold text-gray-500">Upload Resume</span>}
                                 <input type="file" id="resume-upl" className="hidden" accept=".pdf,.doc" onChange={handleResumeUpload} />
                             </div>
                           </div>

                           {/* Job Preferences & Salary */}
                           <div className="border-t pt-4">
                               <h4 className="font-bold uppercase mb-4">Job Preferences</h4>
                               <div className="space-y-4">
                                   <div><label className="text-xs font-bold block mb-1">Job Type</label><div className="flex flex-wrap gap-2">{["Full-time", "Part-time", "Internship", "Freelance"].map(t => <button key={t} onClick={() => isEditing && toggleSelection('jobType', t)} className={`px-2 py-1 text-xs border-2 border-black ${formData.jobPreferences.jobType.includes(t) ? 'bg-black text-white' : 'bg-white'}`}>{t}</button>)}</div></div>
                                   <div><label className="text-xs font-bold block mb-1">Work Mode</label><div className="flex flex-wrap gap-2">{["Remote", "On-site", "Hybrid"].map(m => <button key={m} onClick={() => isEditing && toggleSelection('workMode', m)} className={`px-2 py-1 text-xs border-2 border-black ${formData.jobPreferences.workMode.includes(m) ? 'bg-black text-white' : 'bg-white'}`}>{m}</button>)}</div></div>
                                   <div><label className="text-xs font-bold block mb-1">Preferred Locations</label>
                                     {isEditing? <NeoInput value={formData.preferredLocationsString} onChange={(e) => setFormData(p => ({...p, preferredLocationsString: e.target.value, jobPreferences: {...p.jobPreferences, preferredLocations: e.target.value.split(',').map(s=>s.trim())}}))} /> 
                                     : <div className="flex gap-2">{formData.jobPreferences.preferredLocations.map(l=><NeoBadge key={l}>{l}</NeoBadge>)}</div>}
                                   </div>
                               </div>
                           </div>

                            <div className="border-t pt-4">
                               <h4 className="font-bold uppercase mb-4">Expected Salary</h4>
                               <div className="flex gap-4">
                                   <NeoInput placeholder="Min" type="number" value={formData.expectedSalary.min} onChange={(e) => setFormData(p => ({...p, expectedSalary: {...p.expectedSalary, min: e.target.value}}))} disabled={!isEditing} />
                                   <NeoInput placeholder="Max" type="number" value={formData.expectedSalary.max} onChange={(e) => setFormData(p => ({...p, expectedSalary: {...p.expectedSalary, max: e.target.value}}))} disabled={!isEditing} />
                               </div>
                           </div>

                           <div>
                             <label className="block font-bold text-sm mb-1 dark:text-white">Social Links</label>
                             <div className="space-y-4">
                               <NeoInput name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} placeholder="Portfolio URL" disabled={!isEditing} />
                               <NeoInput name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="LinkedIn URL" disabled={!isEditing} />
                               <NeoInput name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="GitHub URL" disabled={!isEditing} />
                             </div>
                           </div>
                      </div>
                  )}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-zinc-700 flex justify-between">
                  {activeStep > 1 ? <NeoButton onClick={prevStep} variant="secondary">Previous</NeoButton> : <div></div>}
                  {activeStep < 4 && <NeoButton onClick={nextStep} className="bg-neo-black text-white">Next</NeoButton>}
              </div>
          </NeoCard>
        </div>
      </div>
      </div>
      )}
    </AuthGuard>
  );
}
