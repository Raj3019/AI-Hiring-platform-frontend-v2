'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDataStore, useAuthStore } from '@/lib/store';
import { NeoButton, NeoCard, NeoBadge } from '@/components/ui/neo';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';
import ProfileCompletionBanner from '@/components/shared/ProfileCompletionBanner';


export default function JobsPage() {
  const { jobs, fetchJobs } = useDataStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="min-h-screen bg-neo-bg dark:bg-zinc-950/50">
      <ProfileCompletionBanner />
      <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase mb-2">Open Positions</h1>
          <p className="font-bold text-gray-600">Jobs that don't suck. Apply now.</p>
        </div>
        {!isAuthenticated && (
          <Link href="/register">
            <NeoButton variant="primary">Join to Apply</NeoButton>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <NeoCard key={job._id} className="hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-black">{job.title}</h3>
                <NeoBadge>{job.jobType}</NeoBadge>
              </div>
              <p className="text-lg font-bold text-gray-700 mb-2">{job.companyName}</p>
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-500 mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary?.min} - {job.salary?.max} {job.salary?.currency}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {job.skillsRequired?.map((req) => (
                  <span key={req} className="bg-gray-200 px-2 py-1 text-xs font-bold border border-neo-black">{req}</span>
                ))}
              </div>
            </div>
            <div>
              <Link href={isAuthenticated ? (user?.role === 'candidate' ? `/candidate/jobs/${job._id}` : '#') : '/login?redirect=/jobs'}>
                <NeoButton size="lg" variant={isAuthenticated ? 'default' : 'outline'}>
                  {isAuthenticated ? 'View & Apply' : 'Login to Apply'}
                </NeoButton>
              </Link>
            </div>
          </NeoCard>
        ))}
      </div>
      </div>
    </div>
  );
}
