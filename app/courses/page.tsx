'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
// FIX: Added 'Clock' to this import list
import { PlayCircle, Lock, CheckCircle, Search, List, ArrowLeft, Star, Clock } from 'lucide-react';
import Link from 'next/link';

// --- MOCK COURSE DATA ---
const COURSES = [
  {
    id: 1,
    title: "Affiliate Marketing Foundation",
    description: "The complete guide to starting your affiliate journey from zero.",
    duration: "45 Mins",
    category: "Starter",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/S_8d6p5yWbc" 
  },
  {
    id: 2,
    title: "Lead Generation Mastery",
    description: "How to get unlimited leads using organic social media strategies.",
    duration: "60 Mins",
    category: "Starter",
    thumbnail: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/5G1C3a55bac"
  },
  {
    id: 3,
    title: "Sales Closing Psychology",
    description: "Learn the art of closing high-ticket sales on call or chat.",
    duration: "90 Mins",
    category: "Starter",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/hJq73981GvI"
  },
  {
    id: 4,
    title: "Instagram Reels Viral Formula",
    description: "Advanced editing and scripting to go viral on Instagram.",
    duration: "2 Hours",
    category: "Pro",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A"
  },
  {
    id: 5,
    title: "Facebook Ads Blueprint",
    description: "Run profitable ads and scale your business to 6 figures.",
    duration: "3 Hours",
    category: "Pro",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/1yM94q-CbaQ"
  },
  {
    id: 6,
    title: "Personal Branding Secrets",
    description: "Build a brand that people trust and buy from instantly.",
    duration: "1.5 Hours",
    category: "Pro",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/2e873641973"
  }
];

export default function CoursesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(COURSES[0]); 
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };
    getData();
  }, []);

  // Check access logic
  const hasAccess = (courseCategory: string) => {
    if (!profile?.is_active) return false; 
    if (courseCategory === 'Starter') return true; 
    if (courseCategory === 'Pro' && profile.package_name?.includes('Pro')) return true; 
    return false;
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Learning Hub...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
      
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Link href="/dashboard" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
                <ArrowLeft size={20} />
             </Link>
             <span className="font-bold text-xl">Learning Hub</span>
          </div>
          <div className="px-4 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300 uppercase tracking-wider">
             {profile?.package_name || 'Free Member'}
          </div>
        </div>
      </nav>

      {/* --- CINEMA MODE (VIDEO PLAYER) --- */}
      <div className="w-full bg-neutral-900 border-b border-gray-800 relative">
          
          {/* Locked Overlay */}
          {!profile?.is_active ? (
             <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                <Lock size={64} className="text-gray-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Content Locked</h2>
                <p className="text-gray-400 mb-6 max-w-md">You must have an active package to watch this course.</p>
                <Link href="/dashboard" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-all">
                    Activate Account
                </Link>
             </div>
          ) : !hasAccess(activeCourse.category) && (
            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 bg-yellow-500/20 rounded-full mb-4">
                    <Star size={48} className="text-yellow-500" fill="currentColor"/>
                </div>
                <h2 className="text-3xl font-bold mb-2">Pro Member Exclusive</h2>
                <p className="text-gray-400 mb-6 max-w-md">Upgrade to NewarPrime Pro to unlock advanced strategies.</p>
                <button className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-full transition-all">
                    Upgrade Now
                </button>
             </div>
          )}

          {/* Video Iframe */}
          <div className="max-w-6xl mx-auto aspect-video bg-black shadow-2xl relative">
              <iframe 
                width="100%" 
                height="100%" 
                src={activeCourse.videoUrl} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className={!hasAccess(activeCourse.category) || !profile?.is_active ? 'opacity-20 pointer-events-none' : ''}
              ></iframe>
          </div>
      </div>

      {/* VIDEO INFO */}
      <div className="max-w-6xl mx-auto px-6 py-8 border-b border-gray-800 mb-8">
         <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-white">{activeCourse.title}</h1>
                <p className="text-gray-400 max-w-2xl">{activeCourse.description}</p>
            </div>
            <div className="flex gap-3">
                <span className="px-4 py-2 bg-neutral-800 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                    <PlayCircle size={16} className="text-purple-400"/> {activeCourse.duration}
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${activeCourse.category === 'Pro' ? 'bg-yellow-900/20 border-yellow-600/50 text-yellow-500' : 'bg-blue-900/20 border-blue-600/50 text-blue-400'}`}>
                    {activeCourse.category}
                </span>
            </div>
         </div>
      </div>

      {/* --- COURSE LIST --- */}
      <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold flex items-center gap-2">
                 <List size={24} className="text-purple-500"/> All Modules
             </h2>
             <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                 <input type="text" placeholder="Search lessons..." className="bg-neutral-900 border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm focus:border-purple-500 outline-none w-64"/>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {COURSES.map((course) => {
                 const isLocked = !hasAccess(course.category);
                 const isActive = activeCourse.id === course.id;

                 return (
                    <div 
                        key={course.id} 
                        onClick={() => {
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                             setActiveCourse(course);
                        }}
                        className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer ${isActive ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-800 hover:border-gray-600 bg-neutral-900'}`}
                    >
                        {/* Thumbnail */}
                        <div className="h-48 overflow-hidden relative">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                {isLocked ? (
                                    <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                                        <Lock size={20} className="text-gray-400" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all shadow-lg">
                                        <PlayCircle size={24} fill="white" className="text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="absolute top-3 right-3">
                                {course.category === 'Pro' && (
                                    <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">PRO</span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className={`font-bold mb-2 line-clamp-1 ${isActive ? 'text-purple-400' : 'text-white'}`}>{course.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">{course.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                {/* FIXED: Clock is now imported correctly */}
                                <span className="flex items-center gap-1"><Clock size={12}/> {course.duration}</span>
                                {isLocked ? (
                                    <span className="flex items-center gap-1 text-red-400"><Lock size={12}/> Locked</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-400"><CheckCircle size={12}/> Unlocked</span>
                                )}
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