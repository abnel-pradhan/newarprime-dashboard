import { Target, Users, Rocket, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white pb-20 overflow-x-hidden relative">
      
      {/* BACK BUTTON */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="p-3 bg-neutral-900/50 backdrop-blur-md border border-gray-800 rounded-full text-white hover:bg-white/10 transition-all flex items-center justify-center group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
        </Link>
      </div>

      {/* HEADER SECTION (Dynamic & Glowing) */}
      <div className="relative py-24 bg-neutral-900/30 border-b border-gray-800">
        
        {/* Animated Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            {/* Small Badge */}
            <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-widest uppercase mb-8 shadow-lg shadow-purple-900/20">
                <Sparkles size={14} /> Our Story
            </span>
            
            {/* THE DYNAMIC TITLE */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 drop-shadow-2xl">NewarPrime</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
               We are not just a platform; we are a movement. Helping thousands of students master high-income skills and break free from the ordinary.
            </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        
        {/* 1. MISSION GRID (Modern Cards) */}
        <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="p-10 bg-neutral-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl hover:border-purple-500/50 transition-all group hover:shadow-2xl hover:shadow-purple-900/10">
                <div className="w-14 h-14 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform shadow-inner border border-purple-500/20">
                    <Target size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors">Our Mission</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                    To empower the youth of India by providing practical, skill-based education that helps them escape the 9-to-5 rat race and build their own digital empires.
                </p>
            </div>

            {/* Card 2 */}
            <div className="p-10 bg-neutral-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl hover:border-blue-500/50 transition-all group hover:shadow-2xl hover:shadow-blue-900/10">
                <div className="w-14 h-14 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform shadow-inner border border-blue-500/20">
                    <Users size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">Our Community</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                    We are a family of ambitious dreamers. Our unique <span className="text-white font-bold">"Learn & Earn"</span> model ensures that as you learn new skills, your bank account grows with you.
                </p>
            </div>
        </div>

        {/* 2. THE STORY SECTION (Typography) */}
        <div className="relative p-8 md:p-12 rounded-3xl border border-gray-800 bg-gradient-to-b from-neutral-900 to-black overflow-hidden">
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

             <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Rocket className="text-yellow-500" /> 
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">The Vision</span>
                </h2>
                <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                    <p>
                      NewarPrime started with a simple, powerful idea: <strong>Education should pay you back.</strong> 
                    </p>
                    <p>
                      Most traditional systems leave students with degrees but no real-world income skills. We wanted to change that forever. Today, we are proud to be one of India's fastest-growing platforms, paying out lakhs in commissions every week to students, housewives, and professionals who dared to start.
                    </p>
                </div>
             </div>
        </div>

        {/* 3. GOVERNMENT VERIFIED SECTION (NEW) */}
        <div className="relative p-8 md:p-12 rounded-3xl border border-gray-800 bg-neutral-900/30 flex flex-col items-center text-center overflow-hidden">
             {/* Subtle background glow for trust section */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none"></div>
             
             <div className="relative z-10 w-full flex flex-col items-center">
                 <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-green-900/30 border border-green-500/30 text-green-400 text-sm font-bold tracking-widest uppercase mb-6 shadow-lg shadow-green-900/10">
                     <ShieldCheck size={16} /> Government Verified
                 </div>
                 
                 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Officially Registered Enterprise</h2>
                 <p className="text-gray-400 mb-10 max-w-2xl text-lg leading-relaxed">
                     NewarPrime operates with full transparency. We are officially recognized and registered under the Ministry of Micro, Small and Medium Enterprises, Government of India.
                 </p>
                 
                 {/* Certificate Image Wrapper */}
                 <div className="relative w-full max-w-3xl rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-white/5 p-2">
                     <img 
                        src="/msme-certificate.jpg" 
                        alt="NewarPrime MSME Certificate" 
                        className="w-full h-auto rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300 object-contain"
                     />
                 </div>
                 
                 <p className="mt-6 text-gray-500 font-mono tracking-widest bg-black/50 px-4 py-2 rounded-lg border border-gray-800">
                    UDYAM-SK-01-0009272
                 </p>
             </div>
        </div>

      </div>
    </div>
  );
}