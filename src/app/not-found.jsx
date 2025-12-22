'use client';
import React from 'react';
import Link from 'next/link';
import { NeoButton, NeoCard } from '@/components/ui/neo';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-grid-pattern overflow-hidden">
      <div className="max-w-2xl w-full text-center space-y-8 animate-slide-up">
        <div className="relative">
          <h1 className="text-[120px] md:text-[200px] font-black leading-none tracking-tighter text-neo-black dark:text-white select-none">
            404
          </h1>
          <div className="absolute -top-4 -right-4 md:top-0 md:right-10 bg-neo-yellow neo-border px-4 py-2 shadow-neo rotate-12 animate-bounce-slow">
            <span className="font-black text-neo-black text-sm md:text-lg uppercase italic">NOT FOUND!</span>
          </div>
          <div className="absolute top-1/2 -left-4 md:-left-12 bg-neo-pink neo-border px-4 py-2 shadow-neo -rotate-6 hidden md:block">
            <span className="font-black text-neo-black text-sm md:text-lg uppercase italic">LOST IN SPACE?</span>
          </div>
        </div>

        <NeoCard className="p-8 shadow-neo-xl space-y-6 relative overflow-hidden text-center">
             {/* Decorative lines like in Neobrutalism UI */}
            <div className="absolute top-0 left-0 w-full h-2 bg-neo-blue"></div>
            
            <h2 className="text-3xl md:text-4xl font-black text-neo-black dark:text-white uppercase tracking-tight">
                WHOOPS! YOU'RE OFF THE GRID.
            </h2>
            
            <p className="text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300 max-w-lg mx-auto leading-tight">
                The page you're looking for was either deleted, renamed, or never existed in this dimension.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/">
                    <NeoButton variant="primary" className="text-lg px-8 py-4 w-full sm:w-auto">
                        BACK TO HOME
                    </NeoButton>
                </Link>
                <Link href="/candidate/jobs">
                    <NeoButton variant="secondary" className="text-lg px-8 py-4 w-full sm:w-auto">
                        BROWSE JOBS
                    </NeoButton>
                </Link>
            </div>
        </NeoCard>

        <div className="flex justify-center gap-8 md:gap-16 pt-8">
            <div className="flex flex-col items-center group">
                <div className="w-12 h-12 bg-neo-green neo-border shadow-neo-sm rotate-3 group-hover:rotate-0 transition-transform"></div>
                <span className="mt-2 font-black text-xs uppercase tracking-widest text-neo-black dark:text-white">Applied</span>
            </div>
            <div className="flex flex-col items-center group">
                <div className="w-12 h-12 bg-neo-orange neo-border shadow-neo-sm -rotate-3 group-hover:rotate-0 transition-transform"></div>
                <span className="mt-2 font-black text-xs uppercase tracking-widest text-neo-black dark:text-white">Rejected</span>
            </div>
            <div className="flex flex-col items-center group">
                <div className="w-12 h-12 bg-neo-blue neo-border shadow-neo-sm rotate-6 group-hover:rotate-0 transition-transform"></div>
                <span className="mt-2 font-black text-xs uppercase tracking-widest text-neo-black dark:text-white">Hired</span>
            </div>
        </div>
      </div>
    </div>
  );
}
