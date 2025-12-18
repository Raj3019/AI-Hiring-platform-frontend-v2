'use client';
import React, { useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { NeoCard, NeoBadge } from '@/components/ui/neo';

const MOCK_APPLICATIONS = [
  { id: '1', job: 'Frontend Engineer', company: 'TechCorp', status: 'Reviewing', date: '2023-10-12', match: 88 },
  { id: '2', job: 'Backend Developer', company: 'ServerSide', status: 'Rejected', date: '2023-10-01', match: 65 },
  { id: '3', job: 'Product Designer', company: 'CreativeBlock', status: 'Offer', date: '2023-09-28', match: 95 },
];

export default function CandidateApplications() {
  const { user, fetchProfile } = useAuthStore();
  const { applications } = useDataStore();

  useEffect(() => {
    if (user?.role) {
        fetchProfile(user.role);
    }
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
        case 'Offer': return 'green';
        case 'Rejected': return 'pink';
        default: return 'blue';
    }
  };

  // Use mock data if no real applications
  const displayApplications = applications.length > 0 
    ? applications.map(app => ({
        id: app.id,
        job: app.jobTitle || 'Unknown Position',
        company: app.company || 'Unknown Company',
        status: app.status || 'Reviewing',
        date: app.date ? new Date(app.date).toLocaleDateString() : 'N/A',
        match: app.score || 75
      }))
    : MOCK_APPLICATIONS;

  return (
    <AuthGuard allowedRoles={['candidate']}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black uppercase mb-8 dark:text-white">My <span className="text-neo-pink">Applications</span></h1>
        
        <div className="space-y-4">
          {(!user?.recentApplicationJob || user.recentApplicationJob.length === 0) ? (
             <div className="text-center py-12 bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white">
                <p className="font-bold text-gray-500 dark:text-gray-400 mb-4">No applications found.</p>
                <a href="/candidate/jobs" className="text-neo-blue font-black underline hover:text-blue-600">Browse Jobs</a>
             </div>
          ) : (
             ([...user.recentApplicationJob].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))).map((app) => {
                // Priority: Backend overallScore > Backend score > Calculated % from skills
                let matchScore = 0;
                
                if (app.aiMatchScore?.overallScore !== undefined) {
                    matchScore = app.aiMatchScore.overallScore;
                } else if (app.aiMatchScore?.score !== undefined) {
                    matchScore = app.aiMatchScore.score;
                } else {
                    const totalSkills = (app.aiMatchScore?.matchedSkills?.length || 0) + (app.aiMatchScore?.missingSkills?.length || 0);
                    matchScore = totalSkills > 0 ? Math.round(((app.aiMatchScore?.matchedSkills?.length || 0) / totalSkills) * 100) : 0;
                }

                return (
                    <NeoCard key={app._id} className="flex flex-col md:flex-row justify-between items-center gap-4 border-4 shadow-neo-lg p-6 hover:shadow-neo-xl transition-all">
                        <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-black uppercase dark:text-white mb-1">{app.job?.title || 'Job Unavailable'}</h3>
                            <p className="font-mono text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">
                                {app.job?.companyName || 'Unknown Company'} • Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {app.job?.location && (
                                    <span className="bg-white dark:bg-zinc-800 border-2 border-neo-black dark:border-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#fff]">
                                        {app.job.location}
                                    </span>
                                )}
                                <NeoBadge variant={getStatusColor(app.status)} className="rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs uppercase px-3 py-1">
                                    {app.status}
                                </NeoBadge>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className="block text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-0 leading-none">AI Match</span>
                                <span className="text-3xl font-black text-neo-black dark:text-white leading-none">{matchScore}%</span>
                            </div>
                            
                            <div className="h-10 w-px bg-gray-200 dark:bg-zinc-700 hidden md:block"></div>

                            <a href={`/candidate/jobs/${app.job?._id}`} className="flex items-center justify-center p-4 border-2 border-neo-black dark:border-white hover:bg-neo-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[50px] min-w-[50px]">
                                <span className="font-black text-xs uppercase">View</span>
                            </a>
                        </div>
                    </NeoCard>
                );
             })
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
