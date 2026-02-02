'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, CheckCircle, PlayCircle, Users, DollarSign, Shield, Star, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                <span className="font-bold text-white text-xl">N</span>
             </div>
             <span className="font-bold text-xl tracking-wide">NewarPrime</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
             <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Features</Link>
             <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Leaderboard</Link>
             
             {session ? (
                 <Link href="/dashboard" className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2">
                    Dashboard <ArrowRight size={16}/>
                 </Link>
             ) : (
                 <div className="flex items-center gap-4">
                     <Link href="/login" className="text-white font-bold hover:text-purple-400 transition-colors">Login</Link>
                     <Link href="/register" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-900/50 transition-all">
                        Get Started
                     </Link>
                 </div>
             )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <div className="md:hidden bg-neutral-900 border-b border-gray-800 p-6 space-y-4">
                <Link href="#features" className="block text-gray-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                <Link href="/leaderboard" className="block text-gray-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
                <div className="h-[1px] bg-gray-800 my-2"></div>
                {session ? (
                    <Link href="/dashboard" className="block w-full text-center py-3 bg-white text-black font-bold rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                        Go to Dashboard
                    </Link>
                ) : (
                    <>
                        <Link href="/login" className="block w-full text-center py-3 border border-gray-700 rounded-xl mb-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        <Link href="/register" className="block w-full text-center py-3 bg-purple-600 font-bold rounded-xl" onClick={() => setMobileMenuOpen(false)}>Join Now</Link>
                    </>
                )}
            </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full text-purple-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
              <Star size={12} fill="currentColor"/> #1 Affiliate Platform in 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Master the Art of <br/>
              <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 text-transparent bg-clip-text bg-300% animate-gradient">Digital Wealth</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Learn high-income skills, build your personal brand, and earn 
              <span className="text-white font-bold"> 60% commissions </span> 
              by promoting premium courses.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  Start Earning Now <ArrowRight size={20}/>
              </Link>
              <Link href="#features" className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <PlayCircle size={20}/> Watch Demo
              </Link>
          </div>

          {/* Social Proof Ticker */}
          <div className="mt-16 pt-8 border-t border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Trusted by 10,000+ Students</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                   {/* Fake Logos for Trust */}
                   <span className="text-xl font-bold font-serif">Forbes</span>
                   <span className="text-xl font-bold font-mono">TechCrunch</span>
                   <span className="text-xl font-bold italic">Entrepreneur</span>
                   <span className="text-xl font-bold">Medium</span>
              </div>
          </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-neutral-900/50 relative">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose NewarPrime?</h2>
                  <p className="text-gray-400">Everything you need to succeed in the digital economy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="bg-black/40 border border-white/10 p-8 rounded-3xl hover:border-purple-500/50 transition-colors group">
                      <div className="w-14 h-14 bg-purple-900/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <DollarSign size={28}/>
                      </div>
                      <h3 className="text-xl font-bold mb-3">High Commission</h3>
                      <p className="text-gray-400 leading-relaxed">Earn up to 60% commission on every direct referral. The highest payout in the industry.</p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-black/40 border border-white/10 p-8 rounded-3xl hover:border-blue-500/50 transition-colors group">
                      <div className="w-14 h-14 bg-blue-900/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Users size={28}/>
                      </div>
                      <h3 className="text-xl font-bold mb-3">Community Support</h3>
                      <p className="text-gray-400 leading-relaxed">Join 5,000+ ambitious students in our exclusive Discord. Network, learn, and grow together.</p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-black/40 border border-white/10 p-8 rounded-3xl hover:border-green-500/50 transition-colors group">
                      <div className="w-14 h-14 bg-green-900/20 text-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Shield size={28}/>
                      </div>
                      <h3 className="text-xl font-bold mb-3">Weekly Payouts</h3>
                      <p className="text-gray-400 leading-relaxed">Get paid directly to your bank account or UPI every single week. No minimum threshold.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 bg-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold">N</div>
                  <span className="font-bold text-lg">NewarPrime</span>
              </div>
              <p className="text-gray-500 text-sm">© 2026 NewarPrime. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-gray-500">
                  <Link href="#" className="hover:text-white">Terms</Link>
                  <Link href="#" className="hover:text-white">Privacy</Link>
                  <Link href="#" className="hover:text-white">Support</Link>
              </div>
          </div>
      </footer>

    </div>
  );
}