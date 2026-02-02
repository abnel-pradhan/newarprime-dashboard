'use client';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Users, Star, CheckCircle, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      
      {/* 🌟 SMOOTH RGB BACKGROUND EFFECT */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-black">
          {/* 1. Purple Orb (Top Left) */}
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
          
          {/* 2. Blue Orb (Bottom Right) */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          
          {/* 3. Pink Moving Orb (Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[100px] animate-blob"></div>
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          
          {/* LOGO */}
          <div className="flex items-center gap-2 md:gap-3">
             <img 
               src="/logo.png" 
               alt="Logo" 
               className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-full border border-gray-800 shadow-lg" 
             />
             <span className="font-bold text-lg md:text-2xl tracking-wide bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text hidden md:block">
               NewarPrime
             </span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-purple-400 font-medium transition-colors">
               <LayoutDashboard size={20} /> <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link href="/login" className="text-sm md:text-base text-gray-300 hover:text-white font-medium transition-colors">
                Login
            </Link>
            
            <Link href="/register" className="px-4 py-2 bg-white text-black font-bold text-sm md:text-base rounded-full hover:bg-gray-200 transition-all flex items-center gap-2">
              Start <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wide mb-6">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            #1 Affiliate Platform in India
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master Digital Skills & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">Earn Daily Income</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join India's fastest-growing e-learning platform. Learn high-income skills like Affiliate Marketing, Sales, and Content Creation while earning <span className="text-white font-bold">60-70% commission</span>.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full text-lg shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all hover:scale-105">
              Join Now for ₹199
            </Link>
            <Link href="/dashboard" className="w-full md:w-auto px-8 py-4 bg-neutral-900/50 backdrop-blur-sm border border-gray-700 hover:border-gray-500 text-white font-bold rounded-full text-lg transition-all flex items-center justify-center gap-2">
              <LayoutDashboard size={20} /> Go to Dashboard
            </Link>
          </div>
        </div>

        {/* --- INFINITE SCROLL BANNER --- */}
        <div className="w-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm overflow-hidden py-3 border-y border-white/10 mb-20">
          <div className="animate-marquee whitespace-nowrap flex">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-12 px-6">
                <span className="text-white font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                  <CheckCircle size={18} fill="white" className="text-purple-600"/> Government Approved
                </span>
                <span className="text-white/50">✦</span>
                <span className="text-white font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                  <Zap size={18} fill="white" className="text-purple-600"/> Easy Withdrawal
                </span>
                <span className="text-white/50">✦</span>
                <span className="text-white font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                  <Star size={18} fill="white" className="text-purple-600"/> 60% Commission
                </span>
                <span className="text-white/50">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">High Commission</h3>
              <p className="text-gray-400">Earn up to 70% direct commission on every referral you make. The highest in the industry.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Mentorship</h3>
              <p className="text-gray-400">Get access to premium video courses on sales, marketing, and personal branding.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 hover:border-green-500/50 transition-colors group">
              <div className="w-12 h-12 bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Weekly Payouts</h3>
              <p className="text-gray-400">Get your earnings directly in your bank account every week. No minimum threshold.</p>
            </div>
          </div>
        </div>
      </main>

      {/* PROFESSIONAL FOOTER */}
      <footer className="border-t border-gray-800 bg-black/60 backdrop-blur-md pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
               <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
               <span className="font-bold text-xl text-white">NewarPrime</span>
             </div>
             <p className="text-gray-400 text-sm leading-relaxed">
               India's #1 Affiliate Platform. Learn high-income skills and earn daily commissions.
             </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/register" className="hover:text-purple-400 transition-colors">Join Now</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-purple-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Follow Us (Socials) */}
          <div>
            <h4 className="font-bold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/newarprime?igsh=NGllb2hrdDdlOWlj" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-gradient-to-tr hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>

              {/* YouTube */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-lg"
              >
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
            animation: blob 7s infinite;
        }
        @keyframes blob {
            0% { transform: translate(-50%, -50%) scale(1); }
            33% { transform: translate(-50%, -50%) scale(1.1); }
            66% { transform: translate(-50%, -50%) scale(0.9); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}