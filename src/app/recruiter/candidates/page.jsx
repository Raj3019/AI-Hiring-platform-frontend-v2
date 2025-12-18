'use client';
import React, { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { NeoCard, NeoButton, NeoInput } from '@/components/ui/neo';

const MOCK_CANDIDATES = [
    { id: 101, name: "Elena Rodriguez", score: 98, summary: "Exceptional match. 7 years React exp + Open Source contributor. Previous role at BigTech fits perfectly with our stack requirements.", status: "New", title: "Senior Frontend Engineer" },
    { id: 102, name: "James \"Kore\" Smith", score: 85, summary: "Solid technical skills. Lacks some leadership experience required for the Senior role, but technical test was 100%.", status: "Reviewed", title: "React Developer" },
    { id: 103, name: "Sarah Connor", score: 92, summary: "Highly reliable history. Previous role matches stack perfectly. Strong recommendation for leadership potential.", status: "Interview", title: "Tech Lead" },
    { id: 104, name: "Mike Wazowski", score: 45, summary: "Resume parsing failed or irrelevant experience. Skills do not match job description keywords.", status: "Rejected", title: "Comedian" },
    { id: 105, name: "John Doe", score: 12, summary: "No relevant experience.", status: "New", title: "Junior Dev" },
    { id: 106, name: "Jane Doe", score: 65, summary: "Good soft skills but lacks React experience.", status: "Reviewed", title: "Frontend Dev" },
];

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = MOCK_CANDIDATES.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 pb-4 gap-4">
        <div>
           <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-2 dark:text-white">CANDIDATES</h1>
        </div>
      </div>

       {/* Search Bar */}
       <div className="flex items-center gap-2 mb-8">
           <NeoInput 
             placeholder="Search candidates by name or skill..." 
             className="border-2 text-lg h-12" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <NeoButton className="bg-neo-black text-white px-8 h-12 dark:border-white">Filter</NeoButton>
       </div>

       {/* Candidates Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           {filteredCandidates.map((c) => (
             <NeoCard key={c.id} className="p-6 relative group flex flex-col justify-between h-full border-4 hover:shadow-neo transition-all">
                 
                 {/* Header Row */}
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-neo-yellow border-2 border-neo-black dark:border-white rounded-full flex items-center justify-center font-black text-xl text-black">
                            {c.name.charAt(0)}
                         </div>
                         <div>
                             <h4 className="font-bold text-lg leading-tight text-neo-black dark:text-white">{c.name}</h4>
                             <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{c.title}</p>
                         </div>
                    </div>
                    <div className="bg-neo-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase px-2 py-1 border border-neo-black dark:border-white">
                         {c.score}% Match
                    </div>
                 </div>

                 {/* Tags */}
                 <div className="flex gap-2 mb-6">
                     <span className="bg-neo-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold px-2 py-1">React</span>
                     <span className="bg-neo-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold px-2 py-1">Node.js</span>
                     <span className="bg-neo-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold px-2 py-1">Tailwind</span>
                 </div>

                 {/* Input Boxes */ }
                 <div className="mt-auto grid grid-cols-3 gap-2">
                     <div className="col-span-2 border-2 border-neo-black dark:border-white h-10 bg-transparent"></div>
                     <NeoButton className="bg-neo-yellow text-black border-2 border-neo-black h-10 hover:bg-yellow-400 font-bold w-full shadow-none">Contact</NeoButton>
                 </div>
                 
             </NeoCard>
           ))}
       </div>
    </div>
  );
}
