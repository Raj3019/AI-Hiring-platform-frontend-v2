'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useDataStore } from '@/lib/store';
import { NeoButton, NeoCard, NeoBadge, NeoInput } from '@/components/ui/neo';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CandidateJobs() {
  const { jobs, fetchJobs } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedWorkType, setSelectedWorkType] = useState('All');

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const jobTypes = ['All', 'Full-time', 'Part-time', 'Internship', 'Contract'];
  const workTypes = ['All', 'Remote', 'Hybrid', 'On-site'];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const jobType = job.jobType || job.type;
    const workType = job.workType;
    
    const matchesType = selectedType === 'All' || jobType === selectedType;
    const matchesWorkType = selectedWorkType === 'All' || workType === selectedWorkType;

    return matchesSearch && matchesType && matchesWorkType;
  });

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

  return (
    <AuthGuard allowedRoles={['candidate']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black uppercase mb-8 dark:text-white">Available <span className="text-neo-green">Positions</span></h1>
        
        {/* Search and Filters */}
        <div className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <NeoInput
                placeholder="Search by job title, company or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                className="border-2"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="font-bold uppercase text-xs dark:text-gray-400 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filter by Type:
                </span>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "px-3 py-1 text-sm font-bold border-2 transition-all uppercase tracking-wider",
                        selectedType === type 
                          ? "bg-neo-blue text-white border-neo-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                          : "bg-white text-neo-black border-neo-black hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 border-l-0 md:border-l-2 border-neo-black dark:border-white pl-0 md:pl-6">
                <span className="font-bold uppercase text-xs dark:text-gray-400">Work Mode:</span>
                <div className="flex flex-wrap gap-2">
                  {workTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedWorkType(type)}
                      className={cn(
                        "px-3 py-1 text-sm font-bold border-2 transition-all uppercase tracking-wider",
                        selectedWorkType === type 
                          ? "bg-neo-pink text-white border-neo-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                          : "bg-white text-neo-black border-neo-black hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-neo-yellow px-4 py-1 border-2 border-neo-black font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {filteredJobs.length} Positions Found
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.length > 0 ? (
            [...filteredJobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((job) => (
              <NeoCard key={job._id || job.id} className="hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer">
                <Link href={`/candidate/jobs/${job._id || job.id}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-bold dark:text-white">{job.title}</h2>
                      <p className="text-lg font-mono text-gray-600 dark:text-gray-400 font-bold">{job.company} • {job.location}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <NeoBadge variant="blue">{job.type || 'Full-time'}</NeoBadge>
                        <NeoBadge variant="green">{formatSalary(job.salary)}</NeoBadge>
                        <NeoBadge variant="pink">{job.workType || 'Remote'}</NeoBadge>
                      </div>
                    </div>
                    <NeoButton className="whitespace-nowrap">View Details</NeoButton>
                  </div>
                </Link>
              </NeoCard>
            ))
          ) : (
            <div className="text-center py-20 border-4 border-dashed border-gray-300 dark:border-zinc-700">
              <h3 className="text-2xl font-black uppercase text-gray-400">No matching positions found</h3>
              <p className="text-gray-500 font-bold mt-2">Try adjusting your filters or search terms</p>
              <NeoButton 
                variant="secondary" 
                className="mt-6"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedWorkType('All');
                }}
              >
                Clear All Filters
              </NeoButton>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
