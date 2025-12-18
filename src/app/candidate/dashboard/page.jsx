'use client';
import React from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore, useDataStore } from '@/lib/store';
import { NeoCard, NeoButton } from '@/components/ui/neo';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CandidateDashboard() {
  const { user } = useAuthStore();
  const { applications } = useDataStore();

  const data = [
    { name: 'Applied', value: 12 },
    { name: 'Reviewed', value: 5 },
    { name: 'Interview', value: 2 },
    { name: 'Offers', value: 1 },
  ];

  const colors = ['#1E1E1E', '#54A0FF', '#FFD026', '#2ECC71'];

  return (
    <AuthGuard allowedRoles={['candidate']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black uppercase mb-8 dark:text-white">Candidate <span className="text-neo-blue">Dashboard</span></h1>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <NeoCard className="bg-neo-blue text-white dark:border-white">
              <h3 className="font-mono text-sm opacity-80">Total Applications</h3>
              <p className="text-5xl font-black mt-2">{(user?.appliedJobs?.length || user?.recentApplicationJob?.length || applications.length) || 0}</p>
          </NeoCard>
          <NeoCard className="bg-neo-yellow text-black dark:border-white">
              <h3 className="font-mono text-sm opacity-80">Avg Resume Score</h3>
              <p className="text-5xl font-black mt-2">78%</p>
          </NeoCard>
          <NeoCard className="bg-white dark:bg-zinc-800 dark:border-white">
              <h3 className="font-mono text-sm opacity-80 dark:text-gray-300">Interviews Pending</h3>
              <p className="text-5xl font-black mt-2 dark:text-white">2</p>
          </NeoCard>
          <NeoCard className="bg-neo-pink text-white dark:border-white">
              <h3 className="font-mono text-sm opacity-80">Profile Views</h3>
              <p className="text-5xl font-black mt-2">45</p>
          </NeoCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2">
              <NeoCard className="h-96">
                  <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 dark:border-zinc-700 pb-2 dark:text-white">Application Status</h2>
                  <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={data}>
                          <XAxis dataKey="name" tick={{fontFamily: 'Space Mono', fill: '#888'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontFamily: 'Space Mono', fill: '#888'}} axisLine={false} tickLine={false} />
                          <Tooltip 
                              contentStyle={{border: '2px solid black', boxShadow: '4px 4px 0px 0px black', borderRadius: '0px', background: '#fff'}}
                              cursor={{fill: '#f3f4f6'}}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="black" strokeWidth={0} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </NeoCard>
          </div>

          {/* Recommended Jobs */}
          <div className="lg:col-span-1">
              <NeoCard className="h-96 flex flex-col">
                  <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 dark:border-zinc-700 pb-2 dark:text-white">Recommended For You</h2>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {[1, 2, 3].map((i) => (
                          <div key={i} className="p-3 border-2 border-gray-200 dark:border-zinc-700 hover:border-neo-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                              <h4 className="font-bold dark:text-white">Frontend Engineer</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">TechCorp Inc.</p>
                              <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs bg-neo-green text-white px-1 font-bold">92% Match</span>
                                  <span className="text-xs font-bold dark:text-white">&rarr;</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  <Link href="/candidate/jobs">
                    <NeoButton variant="secondary" className="w-full mt-4 text-sm">View All Jobs</NeoButton>
                  </Link>
              </NeoCard>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
