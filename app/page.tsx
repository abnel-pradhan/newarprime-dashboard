'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Zap, Shield, Users, Star, CheckCircle, 
  LayoutDashboard, ShieldCheck, Banknote, Clock, PlayCircle, Trophy, TrendingUp,
  Menu, X, Calendar
} from 'lucide-react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      
      {/* 🌟 SMOOTH MOVING RGB BACKGROUND EFFECT */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-black pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px] animate-blob"></div>
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          
          {/* LOGO */}
          <div className="flex items-center gap-2 md:gap-3">
             <img src="/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-full border border-gray-800 shadow-lg" />
             <span className="font-bold text-lg md:text-2xl tracking-wide bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
               NewarPrime
             </span>
          </div>

          {/* DESKTOP ACTIONS & PUBLIC LINKS */}
          <div className="hidden md:flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-6 mr-2 border-r border-gray-800 pr-6">
                <Link href="/team" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                    Our Team
                </Link>
                <Link href="/events" className="text-sm font-bold text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    Live Events <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                </Link>
            </div>

            <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-purple-400 font-medium transition-colors text-sm md:text-base">
               <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
            </Link>
            
            <Link href="/login" className="text-sm md:text-base text-gray-300 hover:text-white font-medium transition-colors">
                Login
            </Link>
            
            <Link href="/register" className="px-5 py-2.5 bg-white text-black font-bold text-sm md:text-base rounded-full hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Start Now <ArrowRight size={16} />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON + START NOW */}
          <div className="md:hidden flex items-center gap-3">
             <Link href="/register" className="px-5 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-200 transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Start Now
             </Link>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-gray-300 hover:text-white transition-colors">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
             </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl p-4 flex flex-col gap-3 animate-fade-in">
              <Link href="/team" onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-white/5 border border-white/5 rounded-xl text-white font-bold flex items-center gap-3 active:scale-95 transition-transform">
                  <Users size={20} className="text-purple-500" /> Our Team
              </Link>
              <Link href="/events" onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-white/5 border border-white/5 rounded-xl text-white font-bold flex items-center gap-3 active:scale-95 transition-transform">
                  <Calendar size={20} className="text-blue-500" /> Live Events 
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></span>
              </Link>
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-white/5 border border-white/5 rounded-xl text-white font-bold flex items-center gap-3 active:scale-95 transition-transform">
                  <LayoutDashboard size={20} className="text-green-500" /> Dashboard
              </Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-white/5 border border-white/5 rounded-xl text-white font-bold flex items-center gap-3 active:scale-95 transition-transform">
                  <ArrowRight size={20} className="text-gray-400" /> Login
              </Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wide mb-8 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            India's Elite E-Learning & Earning Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Master Digital Skills & <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">Build a Daily Income</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the fastest-growing community of digital entrepreneurs. Learn high-income skills and earn <span className="text-white font-bold">up to 70% commission</span> plus up to <span className="text-purple-400 font-bold">40% weekly cashback</span> bonuses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full text-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-2">
              Join Now for ₹199 <Zap size={20}/>
            </Link>
            <Link href="/courses" className="w-full sm:w-auto px-8 py-4 bg-neutral-900/80 backdrop-blur-sm border border-gray-700 hover:border-gray-500 text-white font-bold rounded-full text-lg transition-all flex items-center justify-center gap-2">
              <PlayCircle size={20} /> View Courses
            </Link>
          </div>
        </div>

        {/* --- INFINITE SCROLL BANNER --- */}
        <div className="w-full bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm overflow-hidden py-4 border-y border-white/10 mb-24 shadow-lg shadow-purple-900/20">
          <div className="animate-marquee whitespace-nowrap flex">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-12 px-6">
                <span className="text-white font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-purple-400"/> 100% Secure
                </span>
                <span className="text-white/30">✦</span>
                <span className="text-white font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                  <Banknote size={18} className="text-green-400"/> Same Day Withdrawal
                </span>
                <span className="text-white/30">✦</span>
                <span className="text-white font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                  <Star size={18} className="text-yellow-400"/> 70% Direct Commission
                </span>
                <span className="text-white/30">✦</span>
                <span className="text-white font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                  <Clock size={18} className="text-blue-400"/> 24/7 Support
                </span>
                 <span className="text-white/30">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- HOW IT WORKS SECTION --- */}
        <div className="max-w-7xl mx-auto px-6 pb-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How NewarPrime Works</h2>
          <p className="text-gray-400 mb-16 max-w-2xl mx-auto">Three simple steps to start your digital journey and create a sustainable secondary income.</p>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
             {/* Connection Line for Desktop */}
             <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 -z-10"></div>

             <div className="bg-black/40 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl relative">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-[0_0_30px_rgba(147,51,234,0.5)] rotate-3">1</div>
                <h3 className="text-xl font-bold mb-3 text-white">Enroll & Learn</h3>
                <p className="text-gray-400 text-sm">Sign up for a Starter or Pro package and get instant access to premium courses on marketing and sales.</p>
             </div>

             <div className="bg-black/40 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl relative mt-0 md:mt-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.5)] -rotate-3">2</div>
                <h3 className="text-xl font-bold mb-3 text-white">Promote & Share</h3>
                <p className="text-gray-400 text-sm">Use your unique affiliate link to share the platform on your social media using the strategies we teach.</p>
             </div>

             <div className="bg-black/40 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl relative">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-[0_0_30px_rgba(22,163,74,0.5)] rotate-3">3</div>
                <h3 className="text-xl font-bold mb-3 text-white">Earn Commission</h3>
                <p className="text-gray-400 text-sm">Earn massive commissions instantly when someone joins through your link. Withdraw directly to your bank.</p>
             </div>
          </div>
        </div>

        {/* --- PRICING / PACKAGES SECTION --- */}
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-gray-400">Select the package that fits your goals and budget.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* Starter Package */}
             <div className="p-8 rounded-[2rem] bg-neutral-900/40 backdrop-blur-xl border border-gray-800 hover:border-purple-500/50 transition-all flex flex-col group">
               <h3 className="text-2xl font-bold text-gray-200 mb-2">Starter Package</h3>
               <p className="text-sm text-gray-400 mb-6">Perfect for beginners wanting to learn the basics.</p>
               <div className="text-5xl font-extrabold text-white mb-8">₹199<span className="text-lg text-gray-500 font-normal">/lifetime</span></div>
               
               <ul className="text-sm text-gray-300 mb-8 space-y-4 flex-1">
                   <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-purple-500"/> Fundamental Marketing Courses</li>
                   <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-purple-500"/> 60% Direct Commission</li>
                   <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-purple-500"/> Standard Support</li>
                   <li className="flex gap-3 items-center text-gray-600"><CheckCircle size={18} className="text-gray-700"/> No Pro Courses</li>
               </ul>
               <Link href="/register" className="w-full py-4 bg-gray-800 group-hover:bg-purple-600 text-white font-bold rounded-xl transition-all text-center">Start Basic</Link>
             </div>

             {/* Pro Package */}
             <div className="p-8 rounded-[2rem] bg-gradient-to-b from-purple-900/20 to-black backdrop-blur-xl border border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative flex flex-col transform md:-translate-y-4">
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg uppercase">Most Popular</div>
               <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">Pro Package <Zap className="text-yellow-400" size={20}/></h3>
               <p className="text-sm text-gray-400 mb-6">For serious earners who want maximum profits.</p>
               <div className="text-5xl font-extrabold text-white mb-8">₹499<span className="text-lg text-gray-500 font-normal">/lifetime</span></div>
               
               <ul className="text-sm text-white mb-8 space-y-4 flex-1">
                   <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-yellow-400"/> All Starter Courses + Premium Library</li>
                   <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-yellow-400"/> Flat ₹300 Direct Commission</li>
                   <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-yellow-400"/> Cashback & Weekly Bonuses</li>
                   <li className="flex gap-3 items-center"><CheckCircle size={18} className="text-yellow-400"/> Priority 24/7 Support</li>
               </ul>
               <Link href="/register" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-xl text-center">Upgrade to Pro</Link>
             </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">High Commission</h3>
              <p className="text-gray-400">Earn up to 70% direct commission on every referral you make. The highest payout structure in the industry.</p>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Mentorship</h3>
              <p className="text-gray-400">Get access to premium video courses on sales, marketing, and personal branding from top earners.</p>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 hover:border-green-500/50 transition-colors group">
              <div className="w-12 h-12 bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Banknote className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Payouts</h3>
              <p className="text-gray-400">Withdraw your earnings directly to your bank account via UPI. Fast processing with minimal wait times.</p>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="max-w-4xl mx-auto px-6 pb-24 text-center">
             <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to change your financial future?</h2>
             <p className="text-gray-400 mb-8">Join thousands of students and professionals earning daily with NewarPrime.</p>
             <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Create Free Account <ArrowRight size={20}/>
             </Link>
        </div>
      </main>

      {/* PROFESSIONAL FOOTER */}
      <footer className="border-t border-gray-800 bg-black/60 backdrop-blur-md pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
               <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
               <span className="font-bold text-xl text-white">NewarPrime</span>
             </div>
             <p className="text-gray-400 text-sm leading-relaxed">
               India's Elite Affiliate Platform. Learn high-income digital skills and earn daily commissions.
             </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/register" className="hover:text-purple-400 transition-colors">Join Now</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Follow Us (Socials) */}
          <div>
            <h4 className="font-bold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/newarprime?igsh=NGllb2hrdDdlOWlj" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-gradient-to-tr hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} NewarPrime. All rights reserved.</p>
        </div>
      </footer>

      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-blob {
            animation: blob 10s infinite;
        }
        @keyframes blob {
            0% { transform: translate(-50%, -50%) scale(1); }
            33% { transform: translate(-30%, -60%) scale(1.2); }
            66% { transform: translate(-60%, -40%) scale(0.8); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}