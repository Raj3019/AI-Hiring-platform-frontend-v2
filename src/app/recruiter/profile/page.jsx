'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/lib/store';
import { NeoCard, NeoButton, NeoInput, NeoBadge } from '@/components/ui/neo';
import { User, Briefcase, MapPin, Edit2, Save, X } from 'lucide-react';

export default function RecruiterProfilePage() {
  const { user, updateProfile, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.about || user?.bio || '',
    gender: user?.gender || '',
    languages: user?.languages || [],
    preferences: user?.preferences || { industries: [], jobTypes: [] },
    skills: user?.skills || [],
  });

  const syncFormData = (apiData) => {
    if (!apiData) return;
    setFormData(prev => ({
      ...prev,
      name: apiData.fullName || apiData.name || prev.name,
      company: apiData.company || prev.company,
      email: apiData.email || prev.email,
      phone: apiData.phone || prev.phone,
      bio: apiData.about || apiData.bio || prev.bio,
      gender: apiData.gender || prev.gender,
      languages: apiData.languages || prev.languages,
      preferences: apiData.preferences || prev.preferences,
      skills: apiData.skills || prev.skills,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillAdd = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const saveProfile = () => {
    updateProfile(formData);
    setIsEditing(false);
    setSuccessMessage('Profile saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) syncFormData(user);
  };

  return (
    <AuthGuard allowedRoles={['recruiter']}>
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
              <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-zinc-800 rounded-full mb-4 border-4 border-neo-black dark:border-white overflow-hidden">
                <img src={user?.profilePicture || user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter'} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-black uppercase dark:text-white">{formData.name}</h2>
              <p className="font-mono text-gray-500 dark:text-gray-400 mb-2">{formData.company || 'Recruiter'}</p>
              <div className="flex justify-center items-center gap-2 mb-6">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                  {formData.email}
                </span>
              </div>
              <NeoBadge variant="blue"><span className="text-xs uppercase font-bold">RECRUITER</span></NeoBadge>
              
              {formData.skills && formData.skills.length > 0 && (
                <div className="mt-8 text-left">
                  <h4 className="font-bold text-xs uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-widest">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="text-xs border border-neo-black dark:border-white px-2 py-1 bg-white dark:bg-zinc-800 dark:text-white rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 border-t-2 border-gray-100 dark:border-zinc-700 pt-6 grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Gender</span>
                  <span className="font-bold dark:text-white">{formData.gender || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Phone</span>
                  <span className="font-bold dark:text-white">{formData.phone || 'Not specified'}</span>
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
                  <NeoButton onClick={saveProfile} className="bg-neo-green text-white">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </NeoButton>
                </>
              )}
            </div>

            <NeoCard className="p-6">
              <h2 className="text-xl font-bold mb-6 border-b-2 border-gray-200 dark:border-zinc-700 pb-2 dark:text-white">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-bold text-sm mb-1 dark:text-white">Full Name</label>
                  <NeoInput type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1 dark:text-white">Company</label>
                  <NeoInput type="text" name="company" value={formData.company} onChange={handleInputChange} disabled={!isEditing} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-bold text-sm mb-1 dark:text-white">Email</label>
                  <NeoInput type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1 dark:text-white">Phone</label>
                  <NeoInput type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-bold text-sm mb-1 dark:text-white">Gender</label>
                <NeoInput type="text" name="gender" value={formData.gender} onChange={handleInputChange} disabled={!isEditing} placeholder="Male / Female / Other" />
              </div>
              
              <div className="mb-6">
                <label className="block font-bold text-sm mb-1 dark:text-white">Bio</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleInputChange} 
                  disabled={!isEditing}
                  className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 focus:outline-none focus:ring-2 focus:ring-neo-yellow font-mono text-sm h-24 resize-none dark:text-white disabled:bg-gray-100 dark:disabled:bg-zinc-800"
                  placeholder="Tell us about yourself and your company..."
                />
              </div>
              
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 dark:border-zinc-700 pb-2 dark:text-white mt-8">Skills & Preferences</h2>
              
              <div className="mb-4">
                <label className="block font-bold text-sm mb-2 dark:text-white">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills && formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-neo-yellow text-black font-bold text-sm border-2 border-neo-black dark:border-white">
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No skills added yet</span>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="newSkill"
                      placeholder="Add a skill..."
                      className="flex-1 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-2 font-mono text-sm dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSkillAdd(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <NeoButton
                      onClick={() => {
                        const input = document.getElementById('newSkill');
                        handleSkillAdd(input.value);
                        input.value = '';
                      }}
                      className="bg-neo-green text-white"
                    >
                      Add
                    </NeoButton>
                  </div>
                )}
              </div>
            </NeoCard>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
