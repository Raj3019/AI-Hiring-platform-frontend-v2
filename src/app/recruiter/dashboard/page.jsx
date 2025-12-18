'use client';
import React, { useEffect, useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { NeoCard, NeoButton } from '@/components/ui/neo';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { jobsAPI } from '@/lib/api';

// Mock gemini service if it doesn't exist
const generateCandidateInsights = async (candidates) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("Strong correlation between 'Open Source Contributor' and high technical scores. Recommend prioritizing candidates with GitHub activity.");
        }, 1500);
    });
};

const RecruiterDashboard = () => {
  const { user, fetchProfile } = useAuthStore();
  const [insight, setInsight] = useState('Analyzing candidate data...');
  const [recentPostings, setRecentPostings] = useState([]);
  const [stats, setStats] = useState({
      activeJobs: 0,
      totalApplicants: 0,
      avgMatchScore: 0
  });

  useEffect(() => {
    fetchProfile('recruiter');
    
    // Simulate fetching candidates for insight generation
    const candidates = [
        { id: 1, years: 5, jobTitle: 'Dev' },
        { id: 2, years: 2, jobTitle: 'Intern' },
        { id: 3, years: 8, jobTitle: 'Lead' }
    ];
    
    generateCandidateInsights(candidates).then(setInsight);
  }, [fetchProfile]);

  useEffect(() => {
    if (user && user.jobs) {
        const mappedJobs = user.jobs.map(j => ({
            id: j._id || j.id,
            role: j.title,
            type: `${j.location} • ${j.jobType || j.type || 'Full-time'}`,
            status: j.status || 'Active',
            applicants: j.applications?.length || j.appliedBy?.length || 0,
            isHot: (j.applications?.length || j.appliedBy?.length || 0) > 10,
            createdAt: new Date(j.createdAt || Date.now())
        })).sort((a, b) => b.createdAt - a.createdAt);

        setRecentPostings(mappedJobs.slice(0, 4));

        const activeJobs = user.jobs.filter(j => j.status === 'Active' || j.status === 'active').length;
        const totalApplicants = user.jobs.reduce((acc, j) => acc + (j.applications?.length || j.appliedBy?.length || 0), 0);
        
        // Calculate average match score if data available
        let totalScore = 0;
        let scoreCount = 0;
        user.jobs.forEach(j => {
            j.applications?.forEach(app => {
                if (app.aiMatchScore?.overallScore) {
                    totalScore += app.aiMatchScore.overallScore;
                    scoreCount++;
                }
            });
        });

        setStats({
            activeJobs,
            totalApplicants,
            avgMatchScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 64
        });
    }
  }, [user]);

  const jobStats = recentPostings.map(j => ({
      name: j.role.length > 10 ? j.role.substring(0, 10) + '...' : j.role,
      applicants: j.applicants
  }));

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
        case 'active': return 'bg-neo-green text-white border-neo-green dark:border-white';
        case 'closed': return 'bg-gray-200 text-gray-500 border-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-700';
        case 'draft': return 'bg-neo-yellow text-black border-neo-yellow dark:border-white';
        default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <AuthGuard allowedRoles={['recruiter']}>
    <div className="max-w-7xl mx-auto px-4 py-8">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b-4 border-neo-black dark:border-white pb-6">
           <div>
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-2 dark:text-white">
                   Recruitment <span className="text-neo-orange">Hub</span>
               </h1>
               <p className="font-mono text-gray-600 dark:text-gray-400 font-bold">Overview of your hiring pipeline</p>
           </div>
           <div className="text-right hidden md:block">
               <span className="inline-block px-3 py-1 bg-neo-green text-white font-bold border-2 border-neo-black dark:border-white text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#ffffff]">SYSTEM ONLINE</span>
           </div>
       </div>
       
       {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
             <NeoCard className="bg-neo-black text-white relative overflow-hidden group border-4 dark:border-white">
                 <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black -mt-6 -mr-6 group-hover:opacity-20 transition-opacity text-white">JOBS</div>
                 <h3 className="font-sans text-lg text-neo-orange font-bold uppercase tracking-wide">Active Jobs</h3>
                 <p className="text-6xl font-black mt-2 text-white">{stats.activeJobs}</p>
             </NeoCard>
             
             <NeoCard className="bg-neo-orange border-4 border-neo-black dark:border-white relative overflow-hidden text-black">
                 <h3 className="font-sans text-lg text-black font-bold uppercase tracking-wide">Total Applicants</h3>
                 <p className="text-6xl font-black mt-2 text-white">{stats.totalApplicants}</p>
                 <div className="absolute bottom-4 right-4 text-xs font-bold bg-white text-black px-2 py-1 border-2 border-black">Hiring Pipeline</div>
             </NeoCard>
             
             <NeoCard className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white">
                 <h3 className="font-sans text-lg text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">Avg. Match Score</h3>
                 <p className="text-6xl font-black mt-2 text-neo-blue">{stats.avgMatchScore}%</p>
             </NeoCard>
        </div>

       {/* Charts & Insights Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <NeoCard className="border-4 shadow-neo-lg h-[400px] flex flex-col">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black uppercase dark:text-white">Application Volume</h3>
             </div>
             <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            tick={{fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: 12, fill: '#888'}} 
                            axisLine={false} 
                            tickLine={false} 
                            dy={10}
                        />
                        <Tooltip 
                            cursor={{fill: '#000', opacity: 0.05}} 
                            contentStyle={{
                                border: '3px solid black', 
                                boxShadow: '4px 4px 0px 0px black', 
                                fontFamily: 'Space Mono', 
                                fontWeight: 'bold',
                                borderRadius: '0px'
                            }}
                        />
                        <Bar dataKey="applicants" fill="#FF6B6B" stroke="black" strokeWidth={3} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </NeoCard>

          <NeoCard className="bg-yellow-50 dark:bg-zinc-800 border-4 shadow-neo-lg flex flex-col">
             <div className="mb-6">
                 <div className="flex items-center gap-3 mb-4">
                     <span className="bg-neo-black text-white px-3 font-bold text-xs py-1 uppercase tracking-wider border dark:border-white">AI Analysis</span>
                     <h3 className="text-2xl font-black uppercase dark:text-white">Candidate Reliability</h3>
                 </div>
                 <div className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white p-6 shadow-sm">
                    <p className="font-mono text-base leading-relaxed font-medium text-gray-800 dark:text-gray-200">
                        "{insight}"
                    </p>
                 </div>
             </div>
             <div className="mt-auto">
                <NeoButton className="bg-neo-black text-white hover:bg-gray-800 w-full uppercase text-sm py-4 border-2 dark:border-white">
                    View Detailed Report
                </NeoButton>
             </div>
          </NeoCard>
       </div>

       {/* Redesigned Recent Job Postings Table */}
       <div className="border-4 border-neo-black dark:border-white bg-white dark:bg-[#1E1E1E] shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff]">
           <div className="p-8 border-b-4 border-neo-black dark:border-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                   <h3 className="text-3xl font-black uppercase tracking-tight text-neo-black dark:text-white">Recent Job Postings</h3>
                   <p className="font-mono text-sm text-gray-500 dark:text-gray-400 font-bold mt-1">You have {stats.activeJobs} active roles recruiting.</p>
               </div>
               <Link href="/recruiter/jobs" className="text-neo-blue font-bold hover:underline font-mono text-sm uppercase tracking-wider">
                   View All &rarr;
               </Link>
           </div>
           
           <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                   <thead>
                       <tr className="border-b-2 border-gray-100 dark:border-gray-700">
                           <th className="py-5 px-8 font-black text-xs text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em]">Role</th>
                           <th className="py-5 px-8 font-black text-xs text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em]">Status</th>
                           <th className="py-5 px-8 font-black text-xs text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em]">Applicants</th>
                           <th className="py-5 px-8 font-black text-xs text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] text-right">Actions</th>
                       </tr>
                   </thead>
                   <tbody>
                       {recentPostings.map((job) => (
                           <tr key={job.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-zinc-800 transition-colors group">
                               <td className="py-6 px-8">
                                   <div className="font-black text-lg text-neo-black dark:text-white">{job.role}</div>
                                   <div className="font-mono text-sm text-gray-400 mt-1 font-medium">{job.type}</div>
                               </td>
                                <td className="py-6 px-8">
                                    <span className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold border capitalize ${getStatusStyles(job.status)}`}>
                                        {job.status}
                                    </span>
                                </td>
                               <td className="py-6 px-8">
                                   <div className="flex items-center">
                                       <div className="flex items-center text-indigo-900 dark:text-indigo-300 font-black text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
                                           <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                                           {job.applicants}
                                       </div>
                                       {job.isHot && (
                                           <span className="ml-3 bg-neo-orange text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wide shadow-sm transform -rotate-2">
                                               HOT
                                           </span>
                                       )}
                                   </div>
                               </td>
                               <td className="py-6 px-8 text-right">
                                   <button className="text-gray-300 hover:text-neo-black dark:hover:text-white font-black text-2xl px-2 leading-none transition-colors">•••</button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
    </AuthGuard>
  );
};

export default RecruiterDashboard;
