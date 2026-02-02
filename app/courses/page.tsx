'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { PlayCircle, Lock, ArrowLeft, Star, Search } from 'lucide-react';
import Link from 'next/link';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      // 1. Check User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // 2. Get Profile (to check if Active/Pro)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      // 3. Get Courses
      const { data: courseData } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
      setCourses(courseData || []);
      
      // Set first video as active if available
      if (courseData && courseData.length > 0) setActiveVideo(courseData[0]);

      setLoading(false);
    };
    getData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Training...</div>;

  // Logic: Is the course locked for this user?
  const isLocked = (course: any) => {
    if (!userProfile?.is_active) return true; // Inactive users see everything locked
    if (course.is_pro && !userProfile.package_name?.includes('Pro')) return true; // Starter user trying to view Pro
    return false;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
      
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
             <Link href="/dashboard" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
                <ArrowLeft size={20} />
             </Link>
             <span className="font-bold text-xl">Learning Hub</span>
             <div className="ml-auto bg-neutral-800 px-3 py-1 rounded-full text-xs font-bold text-gray-400 border border-gray-700">
                {userProfile?.package_name || 'Free User'}
             </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: VIDEO PLAYER */}
          <div className="flex-1">
              <div className="aspect-video bg-neutral-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative group">
                  {activeVideo && !isLocked(activeVideo) ? (
                     <iframe 
                        width="100%" height="100%" 
                        src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=0&rel=0`} 
                        title="Video player" frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                     ></iframe>
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900">
                         <div className="p-4 bg-neutral-800 rounded-full mb-4 text-gray-500"><Lock size={32}/></div>
                         <h3 className="text-xl font-bold text-gray-300">Content Locked</h3>
                         <p className="text-gray-500 text-sm mt-2">
                             {!userProfile?.is_active ? "Activate your account to watch." : "Upgrade to Pro to unlock this masterclass."}
                         </p>
                     </div>
                  )}
              </div>
              
              <div className="mt-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{activeVideo?.title || 'Select a Course'}</h1>
                  <p className="text-gray-400 leading-relaxed">{activeVideo?.description}</p>
              </div>
          </div>

          {/* RIGHT: PLAYLIST */}
          <div className="w-full lg:w-96 bg-neutral-900/50 border border-gray-800 rounded-3xl p-6 h-fit max-h-[600px] overflow-y-auto">
              <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2"><PlayCircle size={14}/> Course Content</h3>
              
              <div className="space-y-3">
                  {courses.map((course) => {
                      const locked = isLocked(course);
                      const active = activeVideo?.id === course.id;

                      return (
                          <div 
                            key={course.id} 
                            onClick={() => setActiveVideo(course)}
                            className={`p-3 rounded-xl flex gap-3 cursor-pointer transition-all border ${active ? 'bg-white/10 border-purple-500/50' : 'hover:bg-white/5 border-transparent'}`}
                          >
                              {/* Thumbnail */}
                              <div className="relative w-24 h-16 bg-black rounded-lg overflow-hidden shrink-0">
                                  <img src={`https://img.youtube.com/vi/${course.video_id}/mqdefault.jpg`} className={`w-full h-full object-cover ${locked ? 'opacity-30' : 'opacity-100'}`}/>
                                  {locked && <div className="absolute inset-0 flex items-center justify-center"><Lock size={16} className="text-white"/></div>}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                  <h4 className={`font-bold text-sm truncate ${active ? 'text-purple-400' : 'text-gray-200'}`}>{course.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                      {course.is_pro && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1"><Star size={8}/> PRO</span>}
                                      <span className="text-[10px] text-gray-500">12 min</span>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

      </div>
    </div>
  );
}