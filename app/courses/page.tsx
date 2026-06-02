'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { PlayCircle, Lock, ArrowLeft, Star, ShieldCheck, Zap, Youtube, CheckCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Courses() {
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [completedVideoIds, setCompletedVideoIds] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // 1. Fetch User Data (Now includes highest_module_unlocked)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      // 2. Fetch Modules
      const { data: moduleData } = await supabase.from('modules').select('*').order('order_index', { ascending: true });
      setModules(moduleData || []);

      // 3. Fetch Courses
      const { data: courseData } = await supabase.from('courses').select('*').order('sequence_num', { ascending: true });
      setCourses(courseData || []);

      // 4. Fetch Progress (Which videos have they clicked "Complete" on?)
      const { data: progressData } = await supabase.from('user_progress').select('course_id').eq('user_id', user.id);
      if (progressData) {
          setCompletedVideoIds(progressData.map(p => p.course_id));
      }

      // Set initial video and open the first module accordion
      if (moduleData && moduleData.length > 0) {
          setExpandedModuleId(moduleData[0].id);
          const firstModuleCourses = courseData?.filter(c => c.module_id === moduleData[0].id) || [];
          if (firstModuleCourses.length > 0) setActiveVideo(firstModuleCourses[0]);
      }
      
      setLoading(false);
    };
    getData();
  }, [router]);

  // --- LOGIC FUNCTIONS ---
  const isVideoLocked = (course: any) => {
    if (!userProfile?.is_active) return true;
    if (course.is_pro && !userProfile.package_name?.includes('Pro')) return true;
    if (!course.video_id) return true; 
    return false;
  };

  const isModuleLocked = (moduleOrderIndex: number) => {
    if (!userProfile?.is_active) return true;
    const highestUnlocked = userProfile?.highest_module_unlocked || 1;
    return moduleOrderIndex > highestUnlocked;
  };

  const handleVideoSelect = (course: any) => {
    setActiveVideo(course);
    if (window.innerWidth < 1024) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleModule = (moduleId: number) => {
      setExpandedModuleId(prev => prev === moduleId ? null : moduleId);
  };

  // --- THE COMPLETION ENGINE ---
  const markVideoAsComplete = async () => {
      if (!activeVideo || !userProfile) return;
      setIsCompleting(true);

      // 1. Write to user_progress table
      const { error } = await supabase.from('user_progress').insert({
          user_id: userProfile.id,
          course_id: activeVideo.id
      });

      if (error) {
          toast.error("Error saving progress.");
          setIsCompleting(false);
          return;
      }

      // Update local state instantly so the checkmark appears
      setCompletedVideoIds(prev => [...prev, activeVideo.id]);
      toast.success("Lesson Completed! 🚀");

      // 2. Check if this was the last video in the module
      const currentModule = modules.find(m => m.id === activeVideo.module_id);
      const allVideosInModule = courses.filter(c => c.module_id === currentModule?.id);
      
      // We check if (all unlocked videos + this new one) == total videos in module
      const isModuleFinished = allVideosInModule.every(v => v.id === activeVideo.id || completedVideoIds.includes(v.id));

      if (isModuleFinished && currentModule) {
          // Find the next module
          const nextModule = modules.find(m => m.order_index === currentModule.order_index + 1);
          
          if (nextModule) {
              const newUnlockLevel = nextModule.order_index;
              const currentUnlockLevel = userProfile.highest_module_unlocked || 1;
              
              // 🛑 THE BUG FIX: Only level up if the new level is GREATER than their current level!
              if (newUnlockLevel > currentUnlockLevel) {
                  // Unlock the next module in the database!
                  await supabase.from('profiles')
                      .update({ highest_module_unlocked: newUnlockLevel })
                      .eq('id', userProfile.id);
                  
                  // Update UI
                  setUserProfile({ ...userProfile, highest_module_unlocked: newUnlockLevel });
                  toast.success(`🎉 Module Unlocked: ${nextModule.title}`);
                  
                  // Auto-expand the newly unlocked module
                  setExpandedModuleId(nextModule.id);
              }
              // If they were already at a higher level, it does nothing and safely leaves their progress alone!
              
          } else {
              // Only show the trophy if they are truly at the highest level of the whole platform
              const currentUnlockLevel = userProfile.highest_module_unlocked || 1;
              if (currentModule.order_index >= currentUnlockLevel) {
                  toast.success("🏆 You have completed all available modules!");
              }
          }
      }

      setIsCompleting(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pb-20">
        <nav className="border-b border-gray-800 bg-neutral-900/50 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-neutral-800 animate-pulse rounded-full"></div>
          <div className="w-32 h-6 bg-neutral-800 animate-pulse rounded-md"></div>
        </nav>
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
          
         {/* LEFT: VIDEO PLAYER & METADATA */}
          <div className="flex-1" ref={containerRef}>
              <div 
                className="aspect-video bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col"
                onContextMenu={(e) => e.preventDefault()}
              >
                  {activeVideo && !isVideoLocked(activeVideo) ? (
                      <div className="relative w-full h-full group">
                          {/* UPDATE HERE: autoplay=0 prevents the video from starting automatically
                          */}
                          <iframe 
                              ref={iframeRef}
                              width="100%" height="100%" 
                              src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=0&controls=1&rel=0&modestbranding=1`} 
                              title="Course Content" frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                              sandbox="allow-scripts allow-same-origin allow-presentation"
                              className="absolute inset-0 w-full h-full z-10"
                          ></iframe>
                      </div>
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 p-6 text-center z-30 relative">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-purple-600/20 text-purple-400 text-[10px] font-black px-2 py-1 rounded border border-purple-500/20 uppercase">
                            Video {activeVideo?.sequence_num || 1}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">{modules.find(m => m.id === activeVideo?.module_id)?.title || 'NewarPrime Official Training'}</span>
                      </div>

                      <a 
                          href="https://www.youtube.com/channel/UCvTLoCuQqB4MwsOunnqFy_Q" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                      >
                          <Youtube size={18} />
                          Subscribe for Free Training
                      </a>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter text-white">{activeVideo?.title || 'Select a Module'}</h1>
                  <p className="text-gray-400 leading-relaxed text-lg max-w-4xl border-l-2 border-gray-800 pl-6 mb-10">{activeVideo?.description}</p>
                  
                  {/* MARK AS COMPLETE BUTTON */}
                  {activeVideo && !isVideoLocked(activeVideo) && (
                      <button 
                          onClick={markVideoAsComplete}
                          disabled={completedVideoIds.includes(activeVideo.id) || isCompleting}
                          className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                              completedVideoIds.includes(activeVideo.id) 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/30 cursor-default' 
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:-translate-y-1'
                          }`}
                      >
                          {completedVideoIds.includes(activeVideo.id) ? (
                              <><CheckCircle2 size={24}/> Completed</>
                          ) : isCompleting ? (
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                              <><CheckCircle2 size={24}/> Mark as Complete</>
                          )}
                      </button>
                  )}
              </div>
          </div>

          {/* RIGHT: PLAYLIST ACCORDION MENU */}
          <div className="w-full lg:w-[400px] shrink-0 h-fit sticky top-28 space-y-4">
              
              {modules.map((module) => {
                  const isLockedModule = isModuleLocked(module.order_index);
                  const isExpanded = expandedModuleId === module.id;
                  const moduleCourses = courses.filter(c => c.module_id === module.id);
                  
                  // Calculate progress for this module
                  const totalVideos = moduleCourses.length;
                  const completedVideos = moduleCourses.filter(c => completedVideoIds.includes(c.id)).length;
                  const progressPercentage = totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100);

                  return (
                      <div key={module.id} className={`border rounded-[1.5rem] overflow-hidden transition-all duration-300 ${isExpanded && !isLockedModule ? 'bg-neutral-900/50 border-gray-700 shadow-xl' : 'bg-black border-gray-800'}`}>
                          
                          {/* Accordion Header */}
                          <div 
                              onClick={() => !isLockedModule && toggleModule(module.id)}
                              className={`p-5 flex items-center justify-between transition-colors ${isLockedModule ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white/5'}`}
                          >
                              <div className="flex-1 min-w-0 pr-4">
                                  <div className="flex items-center gap-2 mb-1.5">
                                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Part {module.order_index}</span>
                                      {!isLockedModule && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${progressPercentage === 100 ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400'}`}>{completedVideos}/{totalVideos} Done</span>}
                                  </div>
                                  <h3 className="font-bold text-white text-lg leading-tight truncate">{module.title}</h3>
                              </div>
                              
                              <div className="shrink-0">
                                  {isLockedModule ? (
                                      <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20"><Lock size={18}/></div>
                                  ) : (
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 border ${isExpanded ? 'bg-white/10 text-white rotate-180 border-transparent' : 'bg-transparent text-gray-400 border-gray-700'}`}>
                                          <ChevronDown size={20}/>
                                      </div>
                                  )}
                              </div>
                          </div>
                          
                          {/* Progress Bar (Visual Only) */}
                          {!isLockedModule && (
                              <div className="w-full h-1 bg-gray-900">
                                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                              </div>
                          )}

                          {/* Accordion Body (The Videos) */}
                          <div className={`transition-all duration-300 ease-in-out ${isExpanded && !isLockedModule ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                              <div className="p-3 space-y-2 bg-black/40">
                                  {moduleCourses.map((course) => {
                                      const locked = isVideoLocked(course);
                                      const active = activeVideo?.id === course.id;
                                      const isDone = completedVideoIds.includes(course.id);

                                      return (
                                          <div 
                                              key={course.id} 
                                              onClick={() => !locked && handleVideoSelect(course)}
                                              className={`group p-2.5 rounded-xl flex gap-3 transition-all border-2 ${locked ? 'opacity-50 cursor-not-allowed border-transparent' : 'cursor-pointer'} ${active ? 'bg-blue-600/10 border-blue-500/50 shadow-lg' : 'hover:bg-white/5 border-transparent'}`}
                                          >
                                              <div className="relative w-24 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-white/5">
                                                  <img 
                                                      src={`https://img.youtube.com/vi/${course.video_id}/mqdefault.jpg`} 
                                                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                                      alt=""
                                                  />
                                                  {locked ? (
                                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"><Lock size={16} className="text-white/50"/></div>
                                                  ) : isDone ? (
                                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]"><CheckCircle2 size={24} className="text-green-500 shadow-2xl"/></div>
                                                  ) : (
                                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"><PlayCircle size={24} className="text-white drop-shadow-md"/></div>
                                                  )}
                                                  <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[8px] font-bold text-white/50">
                                                      {String(course.sequence_num).padStart(2, '0')}
                                                  </div>
                                              </div>

                                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                  <h4 className={`font-bold text-sm truncate transition-colors ${active ? 'text-blue-400' : isDone ? 'text-gray-400 line-through' : 'text-gray-200 group-hover:text-white'}`}>{course.title}</h4>
                                                  <div className="flex items-center gap-2 mt-1.5">
                                                      {course.is_pro ? (
                                                          <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1">
                                                              <Star size={8} fill="currentColor"/> PRO
                                                          </span>
                                                      ) : (
                                                          <span className="text-gray-500 text-[9px] font-black uppercase">Free</span>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                                  {moduleCourses.length === 0 && <div className="text-center text-gray-600 text-xs py-4">No videos in this module yet.</div>}
                              </div>
                          </div>
                      </div>
                  );
              })}

          </div>
      </div>
    </div>
  );
}