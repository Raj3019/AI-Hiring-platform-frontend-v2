'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { NeoCard, NeoButton, NeoInput } from '@/components/ui/neo';
import { recruiterAPI } from '@/lib/api';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchCandidates = async () => {
        try {
            const response = await recruiterAPI.getTalents();
            let allCandidates = [];
            
            if (Array.isArray(response.data)) {
                // Check if items in data array contain nested applicants arrays
                if (response.data.length > 0 && response.data[0].applicants) {
                    allCandidates = response.data.flatMap(item => item.applicants || []);
                } else {
                    // Otherwise assume response.data is the list of candidates
                    allCandidates = response.data;
                }
            } else if (response.data && response.data.applicants) {
                // Case where data is a single object containing applicants
                allCandidates = response.data.applicants;
            }
            
            setCandidates(allCandidates);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.currentJobTitle && c.currentJobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.skills && c.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Pagination logic
  const totalCandidates = filteredCandidates.length;
  const totalPages = Math.ceil(totalCandidates / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthGuard allowedRoles={['recruiter']}>
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 pb-4 gap-4">
        <div>
           <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-2 dark:text-white">TALENTS</h1>
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

       {loading ? (
         <div className="flex justify-center items-center h-64">
           <div className="text-2xl font-black animate-pulse">LOADING TALENTS...</div>
         </div>
       ) : (
         /* Candidates Grid */
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
             {paginatedCandidates.map((c, idx) => (
               <NeoCard key={idx} className="p-6 relative group flex flex-col justify-between h-full border-4 hover:shadow-neo transition-all">
                   
                   {/* Header Row */}
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                           {c.profilePicture ? (
                             <div className="w-12 h-12 border-2 border-neo-black dark:border-white rounded-full overflow-hidden relative">
                               <Image 
                                 src={c.profilePicture} 
                                 alt={c.fullName}
                                 fill
                                 className="object-cover"
                               />
                             </div>
                           ) : (
                             <div className="w-12 h-12 bg-neo-yellow border-2 border-neo-black dark:border-white rounded-full flex items-center justify-center font-black text-xl text-black">
                                {c.fullName.charAt(0)}
                             </div>
                           )}
                           <div>
                               <h4 className="font-bold text-lg leading-tight text-neo-black dark:text-white">{c.fullName}</h4>
                               <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{c.currentJobTitle || 'Professional'}</p>
                           </div>
                      </div>
                      {/* Score is not in the provided API response, but let's keep a placeholder or hide if not exists */}
                      <div className="bg-neo-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase px-2 py-1 border border-neo-black dark:border-white">
                           {c.score || 0}% Match
                      </div>
                   </div>

                   {/* Tags */}
                   <div className="flex flex-wrap gap-2 mb-6">
                       {c.skills && c.skills.length > 0 ? (
                         c.skills.slice(0, 3).map((skill, sIdx) => (
                           <span key={sIdx} className="bg-neo-black text-white dark:bg-white dark:text-black text-[10px] uppercase font-bold px-2 py-1">
                             {skill}
                           </span>
                         ))
                       ) : (
                         <span className="text-[10px] italic text-gray-500">No skills listed</span>
                       )}
                   </div>

                   {/* Input Boxes */ }
                   <div className="mt-auto grid grid-cols-3 gap-2">
                       <div className="col-span-2 border-2 border-neo-black dark:border-white h-10 bg-transparent flex items-center px-3 text-xs font-mono overflow-hidden whitespace-nowrap">
                         {c.email}
                       </div>
                       <NeoButton className="bg-neo-yellow text-black border-2 border-neo-black h-10 hover:bg-yellow-400 font-bold w-full shadow-none">Contact</NeoButton>
                   </div>
                   
               </NeoCard>
             ))}
             {filteredCandidates.length === 0 && (
               <div className="col-span-full text-center py-20">
                 <p className="text-xl font-bold">No candidates found matching "{searchTerm}"</p>
               </div>
             )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="col-span-full flex flex-wrap justify-center items-center gap-3 mt-12 py-6 border-t-2 border-gray-100 dark:border-zinc-800">
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
          </div>
       )}
    </div>
    </AuthGuard>
  );
}
