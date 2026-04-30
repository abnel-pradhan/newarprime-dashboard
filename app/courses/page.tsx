'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  PlayCircle, Lock, ArrowLeft, Star, ShieldCheck, Zap, 
  Play, Pause, Volume2, VolumeX, Maximize, Settings 
} from 'lucide-react';
import Link from 'next/link';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  
  // Custom Player API States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const playerRef = useRef<any>(null); // Holds the YouTube API instance
  const containerRef = useRef<HTMLDivElement>(null); // For fullscreen
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      const { data: courseData } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
      setCourses(courseData || []);
      
      if (courseData && courseData.length > 0) setActiveVideo(courseData[0]);
      setLoading(false);
    };
    getData();
  }, [router]);

  // --- 🌟 YOUTUBE API INTEGRATION ---
  useEffect(() => {
    if (!activeVideo || isLocked(activeVideo)) return;

    // Clean up previous video instance if switching videos
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player-container', {
        videoId: activeVideo.video_id,
        playerVars: {
          controls: 0,          // Hides native UI
          disablekb: 1,         // Disables keyboard shortcuts
          modestbranding: 1,    // Hides YT Logo
          rel: 0,               // No related videos
          showinfo: 0,          // Hides title
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            event.target.playVideo(); // Auto-play
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === (window as any).YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === (window as any).YT.PlayerState.ENDED) setIsPlaying(false);
          }
        }
      });
    };

    // Load YouTube IFrame API Script if it doesn't exist
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [activeVideo]);

  // --- ⏱️ TIMELINE TRACKER ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && isPlaying) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500); // Updates progress bar every 500ms
    return () => clearInterval(interval);
  }, [isPlaying]);

  const isLocked = (course: any) => {
    if (!userProfile?.is_active) return true;
    if (course.is_pro && !userProfile.package_name?.includes('Pro')) return true;
    if (!course.video_id) return true; 
    return false;
  };

  const handleVideoSelect = (course: any) => {
    setActiveVideo(course);
    setIsPlaying(false);
    setCurrentTime(0);
    if (window.innerWidth < 1024) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- 🎮 CUSTOM CONTROLS ---
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) playerRef.current.unMute();
    else playerRef.current.mute();
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
          
          {/* LEFT: CUSTOM PROFESSIONAL VIDEO PLAYER */}
          <div className="flex-1">
              <div 
                ref={containerRef} 
                className="aspect-video bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group flex flex-col"
                onContextMenu={(e) => e.preventDefault()}
              >
                  {activeVideo && !isLocked(activeVideo) ? (
                      <>
                          {/* 🚫 100% UNCLICKABLE VIDEO LAYER */}
                          {/* Scaling to 1.05 removes thin YouTube borders. pointer-events-none completely disables all interaction with the iframe */}
                          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black z-0">
                              <div id="youtube-player-container" className="w-full h-full scale-[1.05]"></div>
                          </div>
                          
                          {/* CLICKABLE OVERLAY (To Play/Pause by tapping the screen) */}
                          <div className="absolute inset-0 w-full h-[calc(100%-60px)] z-10 cursor-pointer" onClick={togglePlay}></div>

                          {/* BIG CENTER PLAY BUTTON (Fades out when playing) */}
                          {!isPlaying && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-10 pointer-events-none transition-opacity duration-300">
                                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                      <Play size={36} className="ml-2" fill="currentColor" />
                                  </div>
                              </div>
                          )}

                          {/* ✨ THE PRO CONTROL BAR (Slides up on hover) */}
                          <div className="absolute bottom-0 left-0 w-full bg-[#0a0a0a] z-20 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                              
                              {/* 📏 CLICKABLE TIMELINE */}
                              <div 
                                className="absolute top-0 left-0 w-full h-1.5 bg-gray-800 cursor-pointer group/timeline hover:h-2 transition-all -translate-y-full"
                                onClick={handleTimelineClick}
                              >
                                  <div className="h-full bg-purple-500 relative transition-all duration-75" style={{ width: `${(currentTime / duration) * 100}%` }}>
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover/timeline:opacity-100 transform translate-x-1/2 shadow-md"></div>
                                  </div>
                              </div>

                              {/* 🎛️ CONTROLS */}
                              <div className="h-14 px-5 flex items-center gap-5">
                                  <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">
                                      {isPlaying ? <Pause size={22} fill="currentColor"/> : <Play size={22} fill="currentColor"/>}
                                  </button>
                                  
                                  <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                                      {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                                  </button>

                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-300 select-none">
                                      <span className="w-10 text-right">{formatTime(currentTime)}</span>
                                      <span className="text-gray-600">/</span>
                                      <span>{formatTime(duration)}</span>
                                      <span className="text-gray-600 mx-2 text-lg">•</span>
                                      <span className="font-bold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">{activeVideo.title}</span>
                                  </div>

                                  <div className="ml-auto flex items-center gap-5">
                                      <button className="text-gray-400 hover:text-white transition-colors"><Settings size={20}/></button>
                                      <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors"><Maximize size={20}/></button>
                                  </div>
                              </div>
                          </div>
                      </>
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}