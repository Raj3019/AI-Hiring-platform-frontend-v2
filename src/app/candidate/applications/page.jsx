'use client';
import React, { useEffect, useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { NeoCard, NeoBadge, NeoButton } from '@/components/ui/neo';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CandidateApplications() {
  const { user, fetchProfile } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (user?.role) {
        fetchProfile(user.role);
    }
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
        case 'Offer': return 'green';
        case 'Rejected': return 'pink';
        case 'Shortlisted': return 'yellow';
        default: return 'blue';
    }
  };

  const applications = user?.recentApplicationJob || [];
  const sortedApplications = [...applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  
  // Pagination logic
  const totalApplications = sortedApplications.length;
  const totalPages = Math.ceil(totalApplications / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedApps = sortedApplications.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthGuard allowedRoles={['candidate']}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black uppercase mb-8 dark:text-white">My <span className="text-neo-pink">Applications</span></h1>
        
        <div className="space-y-4">
          {totalApplications === 0 ? (
             <div className="text-center py-12 bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white shadow-neo">
                <p className="font-bold text-gray-500 dark:text-gray-400 mb-4">No applications found.</p>
                <Link href="/candidate/jobs" className="text-neo-blue font-black underline hover:text-blue-600">Browse Jobs</Link>
             </div>
          ) : (
             <>
               {paginatedApps.map((app) => {
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

                              <Link href={`/candidate/jobs/${app.job?._id || app.job?.id}`} className="flex items-center justify-center p-4 border-2 border-neo-black dark:border-white hover:bg-neo-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[50px] min-w-[50px]">
                                  <span className="font-black text-xs uppercase">View</span>
                              </Link>
                          </div>
                      </NeoCard>
                  );
               })}

               {/* Pagination Controls */}
               {totalPages > 1 && (
                 <div className="flex flex-wrap justify-center items-center gap-3 mt-12 py-6">
                   <button 
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="p-2 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neo-yellow dark:hover:bg-neo-yellow dark:hover:text-black transition-colors"
                   >
                     <ChevronLeft className="w-5 h-5" />
                   </button>
                   
                   <div className="flex gap-2">
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                       <button
                         key={page}
                         onClick={() => handlePageChange(page)}
                         className={`w-10 h-10 flex items-center justify-center border-2 font-black text-sm transition-all ${
                           currentPage === page 
                           ? "bg-neo-blue text-white border-neo-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]" 
                           : "bg-white dark:bg-zinc-800 text-neo-black dark:text-white border-neo-black dark:border-white hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                         }`}
                       >
                         {page}
                       </button>
                     ))}
                   </div>

                   <button 
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="p-2 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neo-yellow dark:hover:bg-neo-yellow dark:hover:text-black transition-colors"
                   >
                     <ChevronRight className="w-5 h-5" />
                   </button>
                 </div>
               )}
             </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
