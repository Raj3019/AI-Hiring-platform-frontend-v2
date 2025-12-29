'use client';
import React from 'react';
import { NeoCard, NeoBadge, NeoButton } from '@/components/ui/neo';
import { 
  Database, Server, Cpu, Terminal, Shield, 
  Zap, Github, Linkedin, Mail, Code2, 
  Layers, Workflow, Binary, Activity,
  ExternalLink, Briefcase, Globe, CheckCircle2,
  ChevronRight, Command, Boxes, Fingerprint,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const Bug = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>
);

const Sparkles = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

const STACK = [
  { name: "Node.js", category: "Core", color: "bg-green-500", icon: <Server className="w-4 h-4" /> },
  { name: "MongoDB", category: "DB", color: "bg-emerald-600", icon: <Database className="w-4 h-4" /> },
  { name: "Express", category: "API", color: "bg-gray-700", icon: <Layers className="w-4 h-4" /> },
  { name: "Redis", category: "Cache", color: "bg-red-600", icon: <Zap className="w-4 h-4" /> },
  { name: "Docker", category: "Ops", color: "bg-blue-500", icon: <Boxes className="w-4 h-4" /> },
  { name: "Gemini AI", category: "AI", color: "bg-neo-blue", icon: <Sparkles className="w-4 h-4" /> },
];

const EXPERIENCES = [
  {
    tag: "NOW",
    role: "Senior Backend Developer",
    company: "Innovate AI",
    period: "2023 - PRESENT",
    desc: "Leading high-performance system designs. Architected a sub-100ms latency matching engine powered by Gemini AI. Focused on horizontally scalable microservices.",
    stats: ["Sub-100ms Latency", "99.9% Uptime", "AI-Integrated"]
  },
  {
    tag: "PREV",
    role: "Backend Engineer",
    company: "CloudStream Systems",
    period: "2022 - 2023",
    desc: "Optimized complex data pipelines and automated deployment workflows. Reduced server costs by 35% through query optimization and strategic caching.",
    stats: ["35% Cost Reduction", "SQL/NoSQL", "CI/CD Expert"]
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] dark:bg-zinc-950 text-neo-black dark:text-white pt-24 pb-20 font-mono">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 overflow-hidden select-none">
        <div className="absolute top-20 right-20 text-[10vw] font-black rotate-12">{`{ code }`}</div>
        <div className="absolute bottom-20 left-20 text-[10vw] font-black -rotate-12">{`// dev`}</div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* --- Hero Section: The Developer --- */}
        <section className="mb-24 flex flex-col md:flex-row gap-12 items-center">
          <div className="relative shrink-0">
             <div className="w-48 h-48 md:w-64 md:h-64 border-8 border-neo-black dark:border-white shadow-neo bg-white dark:bg-zinc-900 overflow-hidden">
                <Image 
                   src="/avatar.png" 
                   alt="Developer Avatar" 
                   width={256} 
                   height={256}
                   className="w-full h-full object-cover"
                />
             </div>
             <div className="absolute -bottom-4 -right-4 bg-neo-yellow text-neo-black px-4 py-2 border-4 border-neo-black font-black text-xs md:text-sm">
                AVAILABLE FOR HIRE
             </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
             <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <NeoBadge variant="blue" className="px-3 py-1 font-black italic tracking-tighter border-2">BACKEND ARCHITECT</NeoBadge>
                <NeoBadge variant="yellow" className="px-3 py-1 font-black italic tracking-tighter border-2">2+ YRS EXP</NeoBadge>
             </div>
             <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight tracking-tighter">
                Crafting <span className="text-neo-blue">Unbreakable</span> <br /> 
                Scalable Backend Sets.
             </h1>
             <p className="text-sm md:text-base leading-relaxed opacity-80 max-w-xl">
                {`/* I convert business logic into high-efficiency server-side realities. Specialized in Node.js, MongoDB, and Express for modern, high-load applications. */`}
             </p>
             <div className="flex justify-center md:justify-start gap-4 pt-2">
                <a href="#" className="p-2 border-2 border-neo-black dark:border-white shadow-neo-sm hover:translate-y-[-2px] transition-transform bg-white dark:bg-zinc-900"><Github /></a>
                <a href="#" className="p-2 border-2 border-neo-black dark:border-white shadow-neo-sm hover:translate-y-[-2px] transition-transform bg-white dark:bg-zinc-900"><Linkedin /></a>
                <a href="#" className="p-2 border-2 border-neo-black dark:border-white shadow-neo-sm hover:translate-y-[-2px] transition-transform bg-white dark:bg-zinc-900"><Mail /></a>
             </div>
          </div>
        </section>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
           
           {/* Left Column: Stack & Philosophy */}
           <div className="md:col-span-4 space-y-8">
              <NeoCard className="p-6">
                 <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-neo-blue" />
                    The Stack
                 </h2>
                 <div className="space-y-3">
                    {STACK.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border-2 border-neo-black/10 dark:border-white/10 group hover:border-neo-black dark:hover:border-white transition-all cursor-default">
                         <div className="flex items-center gap-3">
                            <div className={cn("p-1.5 text-white", item.color)}>{item.icon}</div>
                            <span className="text-xs font-black uppercase">{item.name}</span>
                         </div>
                         <span className="text-[10px] uppercase opacity-40 group-hover:opacity-100">{item.category}</span>
                      </div>
                    ))}
                 </div>
              </NeoCard>

              <NeoCard className="p-6 bg-neo-black text-white dark:bg-zinc-900">
                 <h2 className="text-xl font-black uppercase mb-4 text-neo-yellow italic">Logic Kernel</h2>
                 <p className="text-xs leading-relaxed opacity-70 mb-4">
                    My approach to backend is rooted in three principles:
                 </p>
                 <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest">
                    <li className="flex items-center gap-2 text-neo-green"><CheckCircle2 className="w-4 h-4" /> Scalability</li>
                    <li className="flex items-center gap-2 text-neo-blue"><CheckCircle2 className="w-4 h-4" /> Data Integrity</li>
                    <li className="flex items-center gap-2 text-neo-pink"><CheckCircle2 className="w-4 h-4" /> Peak Security</li>
                 </ul>
              </NeoCard>
           </div>

           {/* Right Column: Experience Log */}
           <div className="md:col-span-8 space-y-8">
              <NeoCard className="p-8 h-full">
                 <div className="flex items-center justify-between mb-10 border-b-4 border-neo-black/10 pb-4">
                    <h2 className="text-2xl font-black uppercase italic">System Journey</h2>
                    <span className="text-[10px] opacity-40 uppercase tracking-widest">Git Log Output</span>
                 </div>

                 <div className="space-y-12">
                    {EXPERIENCES.map((exp, i) => (
                      <div key={i} className="relative pl-8 border-l-4 border-neo-black dark:border-white">
                         <div className="absolute -left-3 top-0 px-2 py-0.5 bg-neo-black text-white dark:bg-white dark:text-neo-black text-[8px] font-black uppercase">
                            {exp.tag}
                         </div>
                         
                         <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                               <h3 className="text-xl font-black uppercase leading-none">{exp.role}</h3>
                               <span className="text-xs font-black opacity-50 uppercase tracking-tighter italic">{exp.period}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neo-blue font-black uppercase text-xs">
                               <Briefcase className="w-4 h-4" />
                               {exp.company}
                            </div>
                            <p className="text-xs font-mono opacity-70 leading-relaxed italic">
                               {`/* ${exp.desc} */`}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                               {exp.stats.map((s, j) => (
                                 <span key={j} className="text-[9px] font-black uppercase px-2 py-1 bg-neo-yellow text-neo-black border-2 border-neo-black -rotate-1 group-hover:rotate-0 transition-transform">
                                    {s}
                                 </span>
                               ))}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Custom Contact Block */}
                 <div className="mt-20 p-6 bg-neo-blue/10 border-4 border-dashed border-neo-blue text-center space-y-4">
                    <h4 className="text-lg font-black uppercase">Start a new handshake?</h4>
                    <p className="text-[10px] opacity-60">Currently open to specialized backend architecture roles.</p>
                    <Link href="/contact" className="block mx-auto">
                       <NeoButton className="w-full sm:w-auto px-10 py-4 bg-neo-blue text-white shadow-neo hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
                          INITIALIZE_CONTACT()
                       </NeoButton>
                    </Link>
                 </div>
              </NeoCard>
           </div>
        </div>

        {/* --- Footer Stats --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
           {[
             { label: "Systems Built", value: "24", icon: <Boxes className="w-5 h-5 text-neo-pink" /> },
             { label: "Code Commits", value: "3.2k", icon: <Binary className="w-5 h-5 text-neo-blue" /> },
             { label: "API Uptime", value: "99.9%", icon: <Activity className="w-5 h-5 text-neo-green" /> },
             { label: "Bugs Fixed", value: "∞", icon: <Bug className="w-5 h-5 text-neo-yellow" /> }
           ].map((stat, i) => (
             <NeoCard key={i} className="p-6 text-center space-y-2 hover:bg-white transition-colors group">
                <div className="flex justify-center transform group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-[10px] uppercase font-black opacity-40">{stat.label}</div>
             </NeoCard>
           ))}
        </div>

      </div>
    </div>
  );
}

