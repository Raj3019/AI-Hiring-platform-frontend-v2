'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NeoButton, NeoBadge } from '@/components/ui/neo';
import { useAuthStore } from '@/lib/store';
import { hasValidAuth } from '@/lib/utils';

// Helper Marquee
const Marquee = ({ text, reverse, className }) => (
  <div className={`overflow-hidden whitespace-nowrap py-3 border-y-4 border-neo-black dark:border-white ${className}`}>
    <div className={`inline-block ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
      {[...Array(10)].map((_, i) => (
         <span key={i} className="text-xl md:text-2xl font-black uppercase mx-6 tracking-widest">{text}</span>
      ))}
    </div>
  </div>
);

const Content = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuthStore();
    
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role?.toLowerCase() === 'recuter' || user.role?.toLowerCase() === 'recruiter') {
                router.push('/recruiter/dashboard');
            } else {
                router.push('/candidate/dashboard');
            }
        }
    }, [isAuthenticated, user, router]);

    const isRecruiterMode = searchParams.get('mode') === 'recruiter';
  
    const candidateTestimonials = [
      {
          quote: "I was getting rejected by interns. Used NeoHire, fixed my resume keywords, and now I'm rejecting offers. Power move.",
          author: "Marcus T.",
          role: "HIRED @ TECHCORP",
          color: "bg-neo-yellow"
      },
      {
          quote: "The salary predictor told me to ask for $40k more. They didn't even blink. This app literally paid for itself in one negotiation.",
          author: "Sarah J.",
          role: "SENIOR DEV",
          color: "bg-neo-green"
      }
    ];
  
    const recruiterTestimonials = [
      {
          quote: "I fired my external agency. This tool found me a Principal Engineer in 48 hours. It's actually insane.",
          author: "Mike Ross",
          role: "CTO @ GRIDLOCK",
          color: "bg-neo-orange"
      },
      {
          quote: "The reliability score is scary accurate. Saved us from hiring a 'senior' dev who couldn't code. ROI is 100x.",
          author: "Jessica Pearson",
          role: "VP TALENT",
          color: "bg-neo-pink"
      }
    ];
  
    const activeTestimonials = isRecruiterMode ? recruiterTestimonials : candidateTestimonials;
    
    // Anti-flash: if we have a valid token/session, don't show the landing page
    // because a redirect to dashboard is likely coming soon.
    if (hasValidAuth()) {
        return null;
    }

    return (
        <div className="bg-neo-bg overflow-x-hidden transition-colors duration-200">
          
          {/* Hero Section */}
          <section id="home" className={`relative py-24 px-4 border-b-4 border-neo-black dark:border-white overflow-hidden ${isRecruiterMode ? 'bg-neo-orange/10 dark:bg-neo-orange/20' : 'bg-neo-blue/10 dark:bg-neo-blue/20'}`}>
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
              <div className="animate-bounce-slow mb-6 cursor-pointer" onClick={() => router.push(isRecruiterMode ? '/' : '/?mode=recruiter')}>
                 <NeoBadge variant={isRecruiterMode ? 'pink' : 'green'}>
                    <span className="text-lg px-2 font-black">
                        {isRecruiterMode ? '⚠ RECRUITER PORTAL' : '★ CANDIDATE PORTAL'}
                    </span>
                 </NeoBadge>
                 <p className="text-xs font-bold mt-2 uppercase text-gray-500">(Click badge to toggle mode demo)</p>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-neo-black dark:text-white leading-[0.85] mb-8 drop-shadow-[4px_4px_0px_rgba(255,255,255,1)] dark:drop-shadow-[4px_4px_0px_rgba(0,0,0,0)]">
                {isRecruiterMode ? (
                    <>
                        <span className="text-neo-orange block transform -rotate-1">HIRE</span>
                        <span className="block transform rotate-1">THE BEST</span>
                        <span className="text-neo-black dark:text-white block transform -rotate-1">TALENT.</span>
                    </>
                ) : (
                    <>
                        <span className="text-neo-blue block transform -rotate-2">GET</span>
                        <span className="block transform rotate-1">THE JOB.</span>
                        <span className="text-neo-yellow block transform -rotate-1">GET RICH.</span>
                    </>
                )}
              </h1>
    
              <p className="text-xl md:text-3xl font-mono mb-12 max-w-3xl mx-auto text-neo-black dark:text-white font-bold bg-white dark:bg-zinc-800 p-6 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] transform rotate-1">
                {isRecruiterMode 
                  ? "Stop sorting through thousands of irrelevant resumes. Our AI ranks candidates by relevance, skill, and reliability instantly."
                  : "The ATS system hates you. We teach you how to fight back. Optimize your resume, cheat the system (legally), and secure the bag."
                }
              </p>
    
              <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
                <button 
                    onClick={() => router.push(`/register${isRecruiterMode ? '?mode=recruiter' : ''}`)} 
                    className={`group relative px-8 py-5 text-white font-black text-2xl border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-black dark:bg-zinc-800'}`}
                >
                    {isRecruiterMode ? 'START HIRING' : 'LAUNCH CAREER'}
                </button>
                <button 
                    onClick={() => document.getElementById('pricing').scrollIntoView({behavior: 'smooth'})} 
                    className="px-8 py-5 bg-white dark:bg-zinc-900 text-neo-black dark:text-white font-black text-2xl border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                    VIEW PRICING
                </button>
              </div>
            </div>
          </section>
    
          {/* Marquee Separator 1 */}
          <Marquee 
            text={isRecruiterMode 
              ? "✅ VERIFIED CANDIDATES ✅ INSTANT RANKING ✅ 10X FASTER HIRING ✅"
              : "★ STOP SCROLLING ★ START EARNING ★ SECURE THE BAG ★"
            } 
            className={isRecruiterMode ? "bg-neo-black text-neo-orange" : "bg-neo-blue text-white"} 
          />
    
          {/* Value Proposition */}
          <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                <h2 className="text-5xl md:text-7xl font-black uppercase leading-none dark:text-white">
                    {isRecruiterMode ? "THE TOOLKIT" : "THE CHEAT"} <br/>
                    <span className={`px-4 inline-block transform -rotate-2 ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-green text-neo-black'}`}>
                        {isRecruiterMode ? "FOR PROS" : "CODES"}
                    </span>
                </h2>
                <p className="text-xl font-mono max-w-md border-l-8 border-neo-black dark:border-white pl-6 font-bold dark:text-gray-300">
                    {isRecruiterMode 
                        ? "We stripped away the corporate HR fluff. This is a weapon for talent acquisition."
                        : "Corporate hiring is a game. We give you the controller with cheat codes enabled."
                    }
                </p>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group bg-white dark:bg-zinc-800 p-8 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-neo-xl transition-all hover:-translate-y-2 relative">
                    <div className="absolute top-0 right-0 bg-neo-black dark:bg-white text-white dark:text-black font-bold px-3 py-1 border-l-4 border-b-4 border-neo-black dark:border-white">01</div>
                    <div className={`w-20 h-20 border-4 border-neo-black dark:border-white mb-6 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] rounded-none flex items-center justify-center text-4xl ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'}`}>
                        {isRecruiterMode ? '🎯' : '🤖'}
                    </div>
                    <h3 className="text-3xl font-black mb-4 uppercase dark:text-white">{isRecruiterMode ? "Precision" : "AI ROAST"}</h3>
                    <p className="font-mono text-lg leading-relaxed font-bold dark:text-gray-300">
                        {isRecruiterMode 
                            ? "Filter 1,000 applicants in 30 seconds. Our AI highlights the winners and hides the time-wasters."
                            : "Upload your resume and watch our AI tear it apart. It hurts, but it works. Fix the gaps, get the interview."
                        }
                    </p>
                </div>
                
                <div className={`group p-8 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-neo-xl transition-all hover:-translate-y-2 relative ${isRecruiterMode ? 'bg-neo-black text-neo-orange dark:bg-zinc-900' : 'bg-neo-yellow text-black'}`}>
                    <div className="absolute top-0 right-0 bg-white text-black font-bold px-3 py-1 border-l-4 border-b-4 border-black">02</div>
                    <div className="w-20 h-20 bg-white border-4 border-black mb-6 shadow-[4px_4px_0px_0px_#000] flex items-center justify-center text-4xl">⚡</div>
                    <h3 className="text-3xl font-black mb-4 uppercase">{isRecruiterMode ? "Speed" : "Auto-Apply"}</h3>
                    <p className="font-mono text-lg leading-relaxed font-bold">
                        {isRecruiterMode 
                            ? "Stop scheduling 'intro chats'. Get a reliability score and a technical breakdown before you even say hello."
                            : "Don't type your name 500 times. Our bot fills out applications while you sleep. Wake up to offers."
                        }
                    </p>
                </div>
    
                <div className="group bg-white dark:bg-zinc-800 p-8 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-neo-xl transition-all hover:-translate-y-2 relative">
                    <div className="absolute top-0 right-0 bg-neo-black dark:bg-white text-white dark:text-black font-bold px-3 py-1 border-l-4 border-b-4 border-neo-black dark:border-white">03</div>
                    <div className={`w-20 h-20 border-4 border-neo-black dark:border-white mb-6 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] rounded-none flex items-center justify-center text-4xl ${isRecruiterMode ? 'bg-neo-pink' : 'bg-neo-green'}`}>🔮</div>
                    <h3 className="text-3xl font-black mb-4 uppercase dark:text-white">{isRecruiterMode ? "Insight" : "Salary Spy"}</h3>
                    <p className="font-mono text-lg leading-relaxed font-bold dark:text-gray-300">
                        {isRecruiterMode 
                            ? "Predict candidate churn before they join. Our psychological profiling is borderline unfair."
                            : "Know exactly what they pay before you apply. We estimate salaries with scary accuracy."
                        }
                    </p>
                </div>
            </div>
          </section>
    
          {/* Large Break/CTA */}
          <section className={`${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'} border-y-8 border-neo-black dark:border-white py-24 px-4 text-center`}>
            <h2 className="text-5xl md:text-8xl font-black uppercase text-white drop-shadow-[8px_8px_0px_#000] mb-10 leading-[0.9]">
                {isRecruiterMode ? "BUILD YOUR\nTEAM." : "SECURE THE\nBAG."}
            </h2>
            <NeoButton onClick={() => router.push(`/register${isRecruiterMode ? '?mode=recruiter' : ''}`)} className="bg-white text-neo-black text-3xl py-8 px-16 shadow-neo-xl dark:shadow-[12px_12px_0px_0px_#000000] border-4 hover:scale-105 transform transition-transform uppercase">
                {isRecruiterMode ? "Start Hiring" : "Get Hired"}
            </NeoButton>
          </section>
    
          {/* Testimonials */}
          <section className="py-24 px-4 max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <span className={`text-black font-black px-6 py-3 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] mb-6 inline-block uppercase text-xl ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-yellow'}`}>
                    {isRecruiterMode ? 'Success Stories 🏆' : 'Receipts 🧾'}
                </span>
                <h2 className="text-6xl font-black uppercase dark:text-white">REAL RESULTS</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {activeTestimonials.map((t, i) => (
                    <div key={i} className={`bg-white dark:bg-zinc-800 p-10 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform relative`}>
                        <div className={`absolute -top-8 ${i % 2 === 0 ? '-left-8' : '-right-8'} ${t.color} border-4 border-neo-black dark:border-white p-4 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] font-black text-5xl text-black`}>"</div>
                        <p className="text-2xl font-bold mb-8 font-mono leading-tight dark:text-white">
                            "{t.quote}"
                        </p>
                        <div className="flex items-center gap-4 border-t-4 border-neo-black dark:border-white pt-6">
                            <div className="w-16 h-16 bg-neo-black dark:bg-white rounded-none"></div>
                            <div>
                                <p className="font-black text-xl uppercase dark:text-white">{t.author}</p>
                                <p className={`font-mono text-sm font-bold ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-blue text-white'} inline-block px-1`}>{t.role}</p>
                            </div>
                        </div>
                    </div>
                 ))}
             </div>
          </section>
    
          {/* Pricing - DYNAMIC based on mode */}
          <section id="pricing" className="py-24 px-4 max-w-7xl mx-auto bg-grid-pattern bg-white dark:bg-[#121212] border-t-8 border-neo-black dark:border-white">
            <h2 className="text-6xl md:text-8xl font-black mb-20 text-center uppercase tracking-tighter dark:text-white">
                {isRecruiterMode ? "PLANS" : "PAY UP"}
            </h2>
            
            {isRecruiterMode ? (
                 /* RECRUITER PRICING */
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    {/* Tier 1 */}
                    <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white p-8 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] h-auto flex flex-col relative group hover:-translate-y-2 transition-transform">
                        <h3 className="text-4xl font-black uppercase mb-2 dark:text-white">STARTUP</h3>
                        <p className="text-7xl font-black mb-6 dark:text-white">$0</p>
                        <ul className="font-mono text-sm space-y-4 mb-8 flex-1 font-bold dark:text-gray-300">
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> 1 Active Job</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Basic AI Scoring</li>
                            <li className="flex items-center text-gray-400 decoration-2 line-through"><span className="mr-3 text-2xl">✕</span> Auto-Reject</li>
                        </ul>
                        <NeoButton variant="secondary" className="w-full border-4 shadow-neo-sm py-4 text-xl">TRY IT</NeoButton>
                    </div>
    
                    {/* Tier 2 */}
                    <div className="bg-neo-black dark:bg-zinc-900 text-white border-4 border-neo-black dark:border-white p-8 shadow-neo-xl dark:shadow-[8px_8px_0px_0px_#ffffff] h-auto md:h-[36rem] flex flex-col relative z-10 transform scale-105">
                        <div className="absolute top-0 inset-x-0 -mt-6 flex justify-center">
                            <span className="bg-neo-orange text-black font-black uppercase px-6 py-2 border-4 border-neo-black dark:border-white shadow-neo text-lg">HIGH GROWTH</span>
                        </div>
                        <h3 className="text-5xl font-black uppercase mb-4 mt-6 text-neo-orange">SCALE</h3>
                        <p className="text-8xl font-black mb-8">$199</p>
                        <ul className="font-mono text-base space-y-5 mb-8 flex-1 font-bold">
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Unlimited Jobs</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Deep AI Analysis</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Reliability Scores</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Candidate Comparison</li>
                        </ul>
                        <NeoButton className="w-full bg-neo-orange border-4 border-white text-black hover:bg-orange-400 shadow-[6px_6px_0px_0px_#ffffff] py-6 text-xl">SCALE UP</NeoButton>
                    </div>
    
                    {/* Tier 3 */}
                    <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white p-8 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] h-auto flex flex-col relative group hover:-translate-y-2 transition-transform">
                        <h3 className="text-4xl font-black uppercase mb-2 dark:text-white">EMPIRE</h3>
                        <p className="text-7xl font-black mb-6 dark:text-white">$999</p>
                        <ul className="font-mono text-sm space-y-4 mb-8 flex-1 font-bold dark:text-gray-300">
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> API Access</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Whitelabel</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Dedicated Server</li>
                        </ul>
                        <NeoButton variant="secondary" className="w-full border-4 shadow-neo-sm py-4 text-xl">CONTACT SALES</NeoButton>
                    </div>
                </div>
            ) : (
                 /* CANDIDATE PRICING */
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    {/* Tier 1 */}
                    <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white p-8 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] h-auto flex flex-col relative group hover:-translate-y-2 transition-transform">
                        <h3 className="text-4xl font-black uppercase mb-2 dark:text-white">BROKE</h3>
                        <p className="text-7xl font-black mb-6 dark:text-white">$0</p>
                        <ul className="font-mono text-sm space-y-4 mb-8 flex-1 font-bold dark:text-gray-300">
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> 3 Resume Scans</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Weak Dashboard</li>
                            <li className="flex items-center text-gray-400 decoration-2 line-through"><span className="mr-3 text-2xl">✕</span> Auto-Apply</li>
                        </ul>
                        <NeoButton variant="secondary" className="w-full border-4 shadow-neo-sm py-4 text-xl">TRY IT</NeoButton>
                    </div>
    
                    {/* Tier 2 */}
                    <div className="bg-neo-black dark:bg-zinc-900 text-white border-4 border-neo-black dark:border-white p-8 shadow-neo-xl dark:shadow-[8px_8px_0px_0px_#ffffff] h-auto md:h-[36rem] flex flex-col relative z-10 transform scale-105">
                        <div className="absolute top-0 inset-x-0 -mt-6 flex justify-center">
                            <span className="bg-white text-black font-black uppercase px-6 py-2 border-4 border-neo-black shadow-neo text-lg">BEST VALUE</span>
                        </div>
                        <h3 className="text-5xl font-black uppercase mb-4 mt-6 text-neo-yellow">BALLER</h3>
                        <p className="text-8xl font-black mb-8">$29</p>
                        <ul className="font-mono text-base space-y-5 mb-8 flex-1 font-bold">
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Unlimited AI Abuse</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Auto-Apply Bot</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Salary Predictor</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Priority Support</li>
                        </ul>
                        <NeoButton className="w-full bg-white border-4 border-black text-black hover:bg-gray-200 shadow-[6px_6px_0px_0px_#000000] py-6 text-xl">DOMINATE</NeoButton>
                    </div>
    
                    {/* Tier 3 */}
                    <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white p-8 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] h-auto flex flex-col relative group hover:-translate-y-2 transition-transform">
                        <h3 className="text-4xl font-black uppercase mb-2 dark:text-white">GOD</h3>
                        <p className="text-7xl font-black mb-6 dark:text-white">$99</p>
                        <ul className="font-mono text-sm space-y-4 mb-8 flex-1 font-bold dark:text-gray-300">
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Personal Agent</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Resume Rewrite</li>
                            <li className="flex items-center"><span className="mr-3 text-2xl">✓</span> Interview Coach</li>
                        </ul>
                        <NeoButton variant="secondary" className="w-full border-4 shadow-neo-sm py-4 text-xl">GET HELP</NeoButton>
                    </div>
                </div>
            )}
          </section>
    
          <Marquee 
            text={isRecruiterMode 
                ? "⚠ HIGH PERFORMANCE RECRUITING ⚠ AI POWERED RANKING ⚠"
                : "★ GET PAID WHAT YOU'RE WORTH ★ BEAT THE SYSTEM ★"
            } 
            reverse 
            className={`border-b-0 border-t-8 text-white ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-yellow !text-black'}`} 
          />
        </div>
    );
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6] dark:bg-[#121212]"></div>}>
        <Content />
    </Suspense>
  );
}
