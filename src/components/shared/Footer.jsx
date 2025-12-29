import React from 'react';
import { NeoButton } from '@/components/ui/neo';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neo-black text-white py-16 border-t-8 border-neo-green dark:border-neo-blue">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="max-w-md">
                    <h2 className="text-4xl font-black uppercase mb-4 text-neo-yellow">NeoHire AI</h2>
                    <p className="font-mono text-gray-400 mb-6">
                        The world's first brutallly honest hiring platform powered by AI. 
                        No fluff, just results.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-12 font-mono">
                    <div>
                        <h3 className="font-bold text-neo-pink mb-4 uppercase">Platform</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/about" className="hover:text-white hover:underline">About</Link></li>
                            <li><a href="#" className="hover:text-white hover:underline">Features</a></li>
                            <li><a href="#" className="hover:text-white hover:underline">Pricing</a></li>
                            <li><a href="#" className="hover:text-white hover:underline">Enterprise</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-neo-blue mb-4 uppercase">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white hover:underline">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white hover:underline">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white hover:underline">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="border-t-2 border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="font-mono text-xs text-gray-500">© 2025 NeoHire Platform. Built with Retro Love.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="w-8 h-8 bg-neo-yellow border-2 border-white hover:translate-y-[-2px] transition-transform cursor-pointer"></div>
                    <div className="w-8 h-8 bg-neo-pink border-2 border-white hover:translate-y-[-2px] transition-transform cursor-pointer"></div>
                    <div className="w-8 h-8 bg-neo-blue border-2 border-white hover:translate-y-[-2px] transition-transform cursor-pointer"></div>
                </div>
            </div>
        </div>
    </footer>
  );
}
