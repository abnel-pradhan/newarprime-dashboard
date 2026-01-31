import Link from 'next/link';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* LOGO & BRAND NAME (Updated) */}
          <div className="flex items-center gap-3">
             {/* 1. The Clean Icon (Make sure your file is named 'icon.png' in public folder) */}
             <img 
               src="/logo.jpeg" 
               alt="NewarPrime Logo" 
               className="w-10 h-10 object-contain drop-shadow-lg" 
             />
             
             {/* 2. The Text (Gold Metal Effect) */}
             <span className="font-bold text-2xl tracking-wide bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 text-transparent bg-clip-text drop-shadow-sm">
               NewarPrime
             </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white font-medium transition-colors">Login</Link>
            <Link href="/register" className="px-5 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wide mb-6">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            #1 Affiliate Platform in India
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master Digital Skills & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Earn Daily Income</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join India's fastest-growing e-learning platform. Learn high-income skills like Affiliate Marketing, Sales, and Content Creation while earning <span className="text-white font-bold">60-70% commission</span>.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full text-lg shadow-lg shadow-purple-900/20 transition-all">
              Join Now for ₹199
            </Link>
            <Link href="/login" className="w-full md:w-auto px-8 py-4 bg-neutral-900 border border-gray-700 hover:border-gray-500 text-white font-bold rounded-full text-lg transition-all">
              Member Login
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-gray-800 hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">High Commission</h3>
              <p className="text-gray-400">Earn up to 70% direct commission on every referral you make. The highest in the industry.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-gray-800 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Mentorship</h3>
              <p className="text-gray-400">Get access to premium video courses on sales, marketing, and personal branding.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-gray-800 hover:border-green-500/50 transition-colors group">
              <div className="w-12 h-12 bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Weekly Payouts</h3>
              <p className="text-gray-400">Get your earnings directly in your bank account every week. No minimum threshold.</p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} NewarPrime. All rights reserved.</p>
      </footer>
    </div>
  );
}