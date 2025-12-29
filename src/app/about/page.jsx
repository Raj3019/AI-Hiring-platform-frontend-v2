'use client';
import React from 'react';
import { NeoCard, NeoBadge, NeoButton } from '@/components/ui/neo';
import { 
  Zap, Activity, CheckCircle2, Command, 
  Target, Rocket, ShieldCheck, Search,
  Cpu, TrendingUp, AlertTriangle, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATS = [
  { label: "Matches Made", value: "10k+", icon: <Rocket className="w-5 h-5 text-neo-pink" /> },
  { label: "AI Analysis", value: "250k", icon: <Cpu className="w-5 h-5 text-neo-blue" /> },
  { label: "Time Saved", value: "85%", icon: <Activity className="w-5 h-5 text-neo-green" /> },
  { label: "Reliability", value: "99.9%", icon: <ShieldCheck className="w-5 h-5 text-neo-yellow" /> }
];

const VALUES = [
  {
    title: "Brutal Honesty",
    desc: "No more HR fluff. We tell you exactly why you're a fit (or why you aren't).",
    color: "bg-neo-yellow",
    icon: <Search className="w-6 h-6" />
  },
  {
    title: "Pure Performance",
    desc: "Our AI doesn't care about your font; it cares about your impact and results.",
    color: "bg-neo-blue",
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    title: "Radical Speed",
    desc: "Hire in days, not months. Apply in seconds, not hours. Move at the speed of light.",
    color: "bg-neo-pink",
    icon: <Zap className="w-6 h-6" />
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] dark:bg-zinc-950 text-neo-black dark:text-white pt-32 pb-20 font-mono">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden select-none">
        <div className="absolute top-20 right-20 text-[15vw] font-black rotate-12 uppercase tracking-tighter">NEOHIRE</div>
        <div className="absolute bottom-20 left-20 text-[10vw] font-black -rotate-12 uppercase tracking-tighter">FUTURE_OF_WORK</div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* --- Hero Section --- */}
        <section className="mb-32 text-center md:text-left">
           <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="space-y-8 flex-1">
                 <div className="inline-block py-1 pr-4 border-r-8 border-neo-black dark:border-white">
                    <NeoBadge variant="yellow" className="text-sm px-4 py-2 font-black italic tracking-tighter">EST. 2024</NeoBadge>
                 </div>
                 <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter transform -rotate-1">
                    The Hiring <br />
                    <span className="text-neo-blue">REVOLUTION</span> <br />
                    Is Here.
                 </h1>
                 <p className="text-xl md:text-2xl font-bold bg-white dark:bg-zinc-900 p-6 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] max-w-2xl transform rotate-1">
                    {`// Traditional hiring is a game of luck and corporate puzzles. We deleted the fluff and built a weapon for talent acquisition.`}
                 </p>
              </div>
              
              <div className="hidden lg:flex flex-col gap-4 pt-12">
                 <NeoCard className="p-4 bg-neo-black text-white dark:bg-white dark:text-neo-black transform -rotate-3 hover:rotate-0 transition-transform">
                    <p className="font-black text-2xl">NO GHOSTING.</p>
                 </NeoCard>
                 <NeoCard className="p-4 bg-neo-orange text-white transform rotate-6 hover:rotate-0 transition-transform">
                    <p className="font-black text-2xl">NO BUSYWORK.</p>
                 </NeoCard>
                 <NeoCard className="p-4 bg-neo-green text-white transform -rotate-2 hover:rotate-0 transition-transform">
                    <p className="font-black text-2xl">NO LIES.</p>
                 </NeoCard>
              </div>
           </div>
        </section>

        {/* --- Value Section --- */}
        <section className="mb-32">
           <div className="flex items-center gap-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-black uppercase italic">The Philosophy</h2>
              <div className="h-2 flex-1 bg-neo-black dark:bg-white"></div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {VALUES.map((val, i) => (
                <NeoCard key={i} className="group hover:-translate-y-2 transition-all p-8 flex flex-col items-center text-center">
                   <div className={cn("w-16 h-16 mb-6 flex items-center justify-center border-4 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff]", val.color)}>
                      {val.icon}
                   </div>
                   <h3 className="text-2xl font-black uppercase mb-4">{val.title}</h3>
                   <p className="font-bold text-sm opacity-80 leading-relaxed font-mono">
                      {val.desc}
                   </p>
                </NeoCard>
              ))}
           </div>
        </section>

        {/* --- Two Sides Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
           {/* Side 1: Recruiters */}
           <NeoCard className="p-0 border-4 overflow-hidden group">
              <div className="bg-neo-orange p-6 border-b-4 border-neo-black dark:border-white text-white">
                 <h3 className="text-3xl font-black uppercase flex items-center gap-4">
                    <Target className="w-8 h-8" />
                    For Recruiters
                 </h3>
              </div>
              <div className="p-8 space-y-6">
                 <p className="font-black italic text-lg leading-tight">
                    "Stop sorting through garbage. Start hiring winners."
                 </p>
                 <ul className="space-y-4 font-bold text-sm">
                    <li className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 shrink-0 text-neo-orange" />
                       <span>AI-Powered Candidate Ranking based on actual skill fit.</span>
                    </li>
                    <li className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 shrink-0 text-neo-orange" />
                       <span>Reliability Scores to predict candidate churn and performance.</span>
                    </li>
                    <li className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 shrink-0 text-neo-orange" />
                       <span>Automated technical breakdown of every applicant.</span>
                    </li>
                 </ul>
                 <Link href="/register?mode=recruiter" className="block pt-4">
                    <NeoButton className="w-full bg-neo-orange text-white py-4 text-xl">BUILD THE EMPIRE</NeoButton>
                 </Link>
              </div>
           </NeoCard>

           {/* Side 2: Candidates */}
           <NeoCard className="p-0 border-4 overflow-hidden group">
              <div className="bg-neo-blue p-6 border-b-4 border-neo-black dark:border-white text-white">
                 <h3 className="text-3xl font-black uppercase flex items-center gap-4">
                    <Command className="w-8 h-8" />
                    For Candidates
                 </h3>
              </div>
              <div className="p-8 space-y-6">
                 <p className="font-black italic text-lg leading-tight">
                    "Beat the ATS system. Get paid what you're worth."
                 </p>
                 <ul className="space-y-4 font-bold text-sm">
                    <li className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 shrink-0 text-neo-blue" />
                       <span>AI Resume Roast to identify and fix ATS-killing errors.</span>
                    </li>
                    <li className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 shrink-0 text-neo-blue" />
                       <span>Salary Spy to know the budget before you even apply.</span>
                    </li>
                    <li className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 shrink-0 text-neo-blue" />
                       <span>Auto-Apply Engine to saturate the market while you sleep.</span>
                    </li>
                 </ul>
                 <Link href="/register" className="block pt-4">
                    <NeoButton className="w-full bg-neo-blue text-white py-4 text-xl">SECURE THE BAG</NeoButton>
                 </Link>
              </div>
           </NeoCard>
        </div>

        {/* --- Stats Banner --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-32">
           {STATS.map((stat, i) => (
             <NeoCard key={i} className="p-6 text-center space-y-3 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all cursor-default">
                <div className="flex justify-center">{stat.icon}</div>
                <div className="text-4xl font-black">{stat.value}</div>
                <div className="text-[10px] uppercase font-bold opacity-50 tracking-widest">{stat.label}</div>
             </NeoCard>
           ))}
        </div>

        {/* --- Beta Warning Section --- */}
        <section className="mb-32">
           <NeoCard className="bg-neo-pink text-white border-4 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-neo-lg -rotate-1 hover:rotate-0 transition-all cursor-help relative group overflow-hidden">
              {/* Animated background stripes */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,white_20px,white_40px)]"></div>
              
              <div className="bg-white p-5 border-4 border-neo-black rotate-[-8deg] shrink-0 z-10 shadow-neo-sm group-hover:rotate-0 transition-transform">
                 <AlertTriangle className="w-14 h-14 text-neo-black animate-pulse" />
              </div>
              
              <div className="flex-1 text-center md:text-left z-10">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">BETA_V0.9_ACCESS</h3>
                    <NeoBadge variant="yellow" className="text-[10px] animate-bounce">STABLE_ISH</NeoBadge>
                 </div>
                 
                 <p className="font-black text-xl md:text-2xl leading-tight uppercase mb-6 opacity-90">
                    We're still crafting the future. <br className="hidden lg:block" />
                    Some systems might glitch, and things might break.
                 </p>

                 <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 pt-2">
                    <span className="bg-neo-black text-white px-4 py-2 text-sm font-black uppercase tracking-widest border-2 border-white">PROCEED WITH CAUTION</span>
                    <div className="flex items-center gap-2 text-white font-black group/email">
                       <Mail className="w-5 h-5 text-neo-yellow group-hover/email:scale-110 transition-transform" />
                       <a 
                         href="mailto:support@neohire.ai" 
                         className="text-lg md:text-xl hover:text-neo-yellow transition-colors underline decoration-4 underline-offset-4"
                       >
                          support@neohire.ai
                       </a>
                    </div>
                 </div>
              </div>
           </NeoCard>
        </section>

        {/* --- Footer CTA --- */}
        <div className="bg-neo-yellow dark:bg-zinc-900 border-8 border-neo-black dark:border-white p-12 text-center space-y-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 transform translate-x-1/2 -translate-y-1/2 bg-neo-black text-white dark:bg-white dark:text-neo-black rotate-45 font-black px-12 py-2 text-xs">
              NEO_HIRE_v2.0
           </div>
           
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter max-w-3xl mx-auto leading-none">
              READY TO STOP <span className="underline decoration-wavy decoration-neo-pink">WASTING TIME?</span>
           </h2>
           <p className="text-lg font-bold font-mono opacity-80 max-w-xl mx-auto">
              Join 1,000+ companies and 50,000+ top-tier candidates who already jumped ship from traditional job boards.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Link href="/register" className="flex-1 max-w-xs mx-auto">
                 <NeoButton className="w-full py-6 text-2xl bg-neo-black text-white dark:bg-white dark:text-neo-black shadow-neo-xl dark:shadow-[8px_8px_0px_0px_#ffffff] hover:scale-105 hover:bg-neo-blue hover:text-white dark:hover:bg-neo-blue dark:hover:text-white transition-all uppercase">
                    JOIN THE FUTURE
                 </NeoButton>
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
}

