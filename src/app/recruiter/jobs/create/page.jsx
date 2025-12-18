'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { NeoCard, NeoButton, NeoInput } from '@/components/ui/neo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateJob() {
  const router = useRouter();
  const { addJob } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: 'My Company', // Default for now
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    requirements: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API
    setTimeout(() => {
      addJob({
        ...formData,
        postedBy: 'recruiter_1',
        requirements: formData.requirements.split(',').map(r => r.trim())
      });
      setIsLoading(false);
      router.push('/recruiter/jobs');
    }, 1000);
  };

  return (
    <AuthGuard allowedRoles={['recruiter']}>
      <div className="container mx-auto px-4 py-8">
        <Link href="/recruiter/jobs" className="flex items-center text-gray-500 hover:text-black mb-6 font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black uppercase mb-8 text-center">Post a New Job</h1>

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
        </div>
      </div>
    </AuthGuard>
  );
}
