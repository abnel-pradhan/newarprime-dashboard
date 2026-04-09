'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { PlayCircle, Lock, ArrowLeft, Star, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null); // For auto-scroll

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      // Fetch courses - RLS handles the heavy lifting
      const { data: courseData } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
      setCourses(courseData || []);
      
      if (courseData && courseData.length > 0) setActiveVideo(courseData[0]);
      setLoading(false);
    };
    getData();
  }, [router]);

  const isLocked = (course: any) => {
    if (!userProfile?.is_active) return true;
    if (course.is_pro && !userProfile.package_name?.includes('Pro')) return true;
    if (!course.video_id) return true; 
    return false;
  };

  const handleVideoSelect = (course: any) => {
    setActiveVideo(course);
    // Auto-scroll to player on mobile
    if (window.innerWidth < 1024) {
      playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pb-20">
        <nav className="border-b border-gray-800 bg-neutral-900/50 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-neutral-800 animate-pulse rounded-full"></div>
          <div className="w-32 h-6 bg-neutral-800 animate-pulse rounded-md"></div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="aspect-video bg-neutral-900 rounded-3xl animate-pulse border border-gray-800"></div>
          </div>
          <div className="w-full lg:w-96 bg-neutral-900/50 border border-gray-800 rounded-3xl p-6 h-80 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white pb-20 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
             <Link href="/dashboard" className="p-2 bg-neutral-900 border border-gray-800 rounded-full hover:bg-neutral-800 transition-all hover:scale-110">
                <ArrowLeft size={20} />
             </Link>
             <div className="flex flex-col">
                <span className="font-bold text-lg md:text-xl tracking-tight">Learning Hub</span>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest hidden md:block">NewarPrime Academy</span>
             </div>
             <div className="ml-auto flex items-center gap-2 bg-neutral-900 px-4 py-1.5 rounded-full border border-gray-800 shadow-inner">
                <ShieldCheck size={14} className="text-purple-400"/>
                <span className="text-xs font-black text-gray-300 uppercase">{userProfile?.package_name || 'Starter'}</span>
             </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: VIDEO PLAYER */}
          <div className="flex-1" ref={playerRef}>
              <div className="aspect-video bg-neutral-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative">
                  {activeVideo && !isLocked(activeVideo) ? (
                     <iframe 
                        width="100%" height="100%" 
                        src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=1&rel=0&modestbranding=1&showinfo=0`} 
                        title="Course Content" frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="pointer-events-auto"
                     ></iframe>
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 p-6 text-center">
                         <div className="p-6 bg-black/40 rounded-full mb-4 border border-white/5 text-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                            <Lock size={44}/>
                         </div>
                         <h3 className="text-2xl font-bold text-white">Content Locked</h3>
                         <p className="text-gray-500 text-sm mt-3 max-w-sm leading-relaxed">
                            {!userProfile?.is_active ? "Activate your account to access our full training library and start earning." : "This masterclass is reserved for Pro members only. Upgrade to unlock this content."}
                         </p>
                         <button 
                            onClick={() => router.push(!userProfile?.is_active ? "/register" : "/dashboard")}
                            className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 active:scale-95 flex items-center gap-2"
                         >
                            <Zap size={18} fill="currentColor"/>
                            {!userProfile?.is_active ? "Activate Account" : "Upgrade to Pro"}
                         </button>
                     </div>
                  )}
              </div>
              
              <div className="mt-8 p-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-purple-600/20 text-purple-400 text-[10px] font-black px-2 py-1 rounded border border-purple-500/20">MODULE {courses.indexOf(activeVideo) + 1}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">NewarPrime Official Training</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-white">{activeVideo?.title || 'Select a Module'}</h1>
                  <p className="text-gray-400 leading-relaxed text-lg max-w-4xl border-l-2 border-gray-800 pl-6">{activeVideo?.description}</p>
              </div>
          </div>

          {/* RIGHT: PLAYLIST */}
          <div className="w-full lg:w-96 bg-neutral-900/30 backdrop-blur-md border border-gray-800 rounded-[2rem] p-6 h-fit sticky top-28">
              <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
                <PlayCircle size={16} className="text-purple-500"/> Course Curriculum
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {courses.map((course, index) => {
                      const locked = isLocked(course);
                      const active = activeVideo?.id === course.id;

                      return (
                          <div 
                            key={course.id} 
                            onClick={() => handleVideoSelect(course)}
                            className={`group p-3 rounded-2xl flex gap-3 cursor-pointer transition-all border-2 ${active ? 'bg-purple-600/10 border-purple-500/50 shadow-xl' : 'hover:bg-white/5 border-transparent'}`}
                          >
                              {/* Thumbnail */}
                              <div className="relative w-24 h-16 bg-black rounded-xl overflow-hidden shrink-0 border border-white/5">
                                  <img 
                                    src={`https://img.youtube.com/vi/${course.video_id || 'unlocked'}/mqdefault.jpg`} 
                                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${locked ? 'opacity-20 grayscale' : 'opacity-100'}`}
                                    alt=""
                                  />
                                  {locked && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/30">
                                        <Lock size={18}/>
                                    </div>
                                  )}
                                  <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[8px] font-bold text-white/50">
                                    {String(index + 1).padStart(2, '0')}
                                  </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <h4 className={`font-bold text-sm truncate transition-colors ${active ? 'text-purple-400' : 'text-gray-300 group-hover:text-white'}`}>{course.title}</h4>
                                  <div className="flex items-center gap-2 mt-2">
                                      {course.is_pro ? (
                                        <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-2 py-0.5 rounded-md border border-yellow-500/20 flex items-center gap-1">
                                            <Star size={8} fill="currentColor"/> PRO
                                        </span>
                                      ) : (
                                        <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-md border border-blue-500/20">STARTER</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* CSS for custom scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}