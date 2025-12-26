'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { NeoCard, NeoButton, NeoInput } from '@/components/ui/neo';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getMissingProfileFields } from '@/lib/utils';
import ProfileCompletionBanner from '@/components/shared/ProfileCompletionBanner';

export default function CreateJob() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addJob } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const missingFields = getMissingProfileFields(user);
  const isProfileIncomplete = missingFields.length > 0;

  const [formData, setFormData] = useState({
    title: '',
    company: user?.currentEmployer || '', 
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    requirements: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProfileIncomplete) return;
    setIsLoading(true);

    // Simulate API
    setTimeout(() => {
      addJob({
        ...formData,
        postedBy: user?._id || user?.id || 'recruiter_1',
        requirements: formData.requirements.split(',').map(r => r.trim())
      });
      setIsLoading(false);
      router.push('/recruiter/jobs');
    }, 1000);
  };

  return (
    <AuthGuard allowedRoles={['recruiter']}>
      <div className="min-h-screen bg-neo-bg dark:bg-zinc-950">
        <ProfileCompletionBanner />
        <div className="container mx-auto px-4 py-8">
          <Link href="/recruiter/jobs" className="flex items-center text-gray-500 hover:text-black dark:hover:text-white mb-6 font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
          </Link>

          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-black uppercase mb-8 text-center dark:text-white">Post a New Job</h1>

            {isProfileIncomplete ? (
              <NeoCard className="border-neo-orange bg-neo-orange/5 text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-neo-orange rounded-full flex items-center justify-center text-white">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black uppercase dark:text-white">Profile Incomplete</h2>
                  <p className="font-mono text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    You must complete your recruiter profile before you can post new jobs. Some required fields like current role or education are missing.
                  </p>
                  <Link href="/recruiter/profile">
                    <NeoButton className="bg-neo-orange text-white mt-4">Complete Profile Now</NeoButton>
                  </Link>
                </div>
              </NeoCard>
            ) : (
              <NeoCard>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <NeoInput
                    label="Job Title"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <NeoInput
                      label="Location"
                      placeholder="e.g. Remote / New York"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                    <NeoInput
                      label="Salary Range"
                      placeholder="e.g. $120k - $150k"
                      value={formData.salary}
                      onChange={e => setFormData({ ...formData, salary: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-neo-black mb-1.5 block">Job Type</label>
                    <select
                      className="w-full neo-border h-10 px-3 py-2 bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-neo-black mb-1.5 block">Description</label>
                    <textarea
                      className="w-full neo-border p-3 bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all h-32"
                      placeholder="Describe the role..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <NeoInput
                    label="Requirements (comma separated)"
                    placeholder="React, Node.js, TypeScript..."
                    value={formData.requirements}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                    required
                  />

                  <NeoButton type="submit" size="lg" className="mt-4" isLoading={isLoading}>Post Job</NeoButton>
                </form>
              </NeoCard>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
