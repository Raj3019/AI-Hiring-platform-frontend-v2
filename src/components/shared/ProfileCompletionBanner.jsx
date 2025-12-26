'use client';
import React from 'react';
import { useAuthStore } from '@/lib/store';
import { getMissingProfileFields } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { NeoButton } from '@/components/ui/neo';

const ProfileCompletionBanner = () => {
    const { user } = useAuthStore();
    const pathname = usePathname();
    
    if (!user) return null;
    
    // Support both Employee (candidate) and Recurter (recruiter) roles
    const isCandidate = user.role === 'Employee' || user.role === 'candidate';
    const isRecruiter = user.role === 'Recuter' || user.role === 'recruiter';

    if (!isCandidate && !isRecruiter) return null;
    
    const missingFields = getMissingProfileFields(user);
    const totalRequired = isCandidate ? 15 : 12; // Different counts for different roles
    const completedCount = Math.max(0, totalRequired - missingFields.length);
    const percentage = Math.round((completedCount / totalRequired) * 100);
    
    if (missingFields.length === 0) return null;

    // Show only the first 3 missing fields as examples
    const displayFields = missingFields.slice(0, 3);
    const profileLink = isRecruiter ? '/recruiter/profile' : '/profile';
    const requirementText = isRecruiter ? 'Required for job postings.' : 'Required for job applications.';

    return (
        <div className="bg-[#FFF4F2] dark:bg-neo-red/5 border-b-4 border-neo-black dark:border-white py-3 px-4 w-full relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-neo-red"></div>
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-neo-red/10 p-2 hidden sm:block border border-neo-red/20">
                        <AlertCircle className="w-5 h-5 text-neo-red" />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-3 mb-0.5">
                            <h3 className="font-black uppercase tracking-tight text-neo-black dark:text-white text-sm md:text-base leading-none">
                                Profile <span className="text-neo-red">Incomplete</span>
                            </h3>
                            <div className={`px-2 py-0.5 border-2 border-neo-black dark:border-white text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-colors ${
                                percentage < 30 ? 'bg-neo-red text-white' : 
                                percentage < 70 ? 'bg-neo-yellow text-black' : 
                                'bg-neo-green text-white'
                            }`}>
                                {percentage}% DONE
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono">
                            {requirementText} Please finish your profile to proceed.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Compact Modern Progress Bar */}
                    <div className="flex-1 lg:min-w-[200px] w-full sm:w-auto">
                        <div className="h-4 bg-gray-100 dark:bg-zinc-800 border-2 border-neo-black dark:border-white relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                            <div 
                                className={`h-full transition-all duration-1000 ${
                                    percentage < 30 ? 'bg-neo-red' : 
                                    percentage < 70 ? 'bg-neo-yellow' : 
                                    'bg-neo-green'
                                }`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                         {displayFields.map(f => {
                            let label;
                            if (f === 'resumeFileURL') label = 'RESUME';
                            else if (f === 'profilePicture') label = 'PROFILE PICTURE';
                            else label = f.split('.').pop().replace(/([A-Z])/g, ' $1').toUpperCase();

                            return (
                                <span key={f} className="text-[9px] font-black uppercase bg-white dark:bg-zinc-800 px-2 py-0.5 border border-neo-red/20 dark:border-zinc-700 text-neo-red/70 dark:text-neo-red/50 font-mono">
                                    • {label}
                                </span>
                            );
                        })}
                    </div>

                    {pathname !== profileLink && (
                        <Link href={profileLink} className="w-full sm:w-auto">
                            <NeoButton 
                                className="bg-neo-black text-white dark:bg-white dark:text-neo-black w-full min-w-[140px] h-10 flex items-center justify-center gap-2 hover:bg-neo-red hover:text-white transition-all shadow-neo-sm"
                            >
                                <span className="font-black uppercase tracking-widest text-[10px]">Finish Profile</span>
                                <ArrowRight className="w-4 h-4" />
                            </NeoButton>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionBanner;
