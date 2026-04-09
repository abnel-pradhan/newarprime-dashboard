'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Clock, Video, Users, 
  PlayCircle, Sparkles, MessageSquare, Send, CheckCircle2,
  Crown, ShieldCheck, User, ExternalLink, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchEventsAndUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase.from('profiles').select('is_active, package_name').eq('id', user.id).single();
          if (profileData) {
              setProfile(profileData);
              setIsActive(profileData.is_active);
          }
        }

        // Fetch dynamic events from the database
        const { data: eventsData, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
        
        if (eventsData) {
            setUpcomingEvents(eventsData.filter(e => !e.is_past_recording));
            setPastEvents(eventsData.filter(e => e.is_past_recording));
        } else if (error) {
            console.error("Error fetching events:", error);
        }
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventsAndUser();
  }, [router]);

  const handleJoinEvent = (event: any) => {
      if (!isActive) {
          toast.error("🔒 Active package required! Redirecting...");
          setTimeout(() => router.push('/register'), 1500);
          return;
      }
      if (event.is_pro_only && !profile?.package_name?.includes('Pro')) {
          return toast.error("This session is exclusively for NewarPrime Pro members. Please upgrade to join!");
      }
      toast.success("Opening secure session...");
      window.open(event.link, '_blank');
  };

  const handleSuggestTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return toast.error("Please enter a topic");
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('event_suggestions').insert([{ topic: topic }]);
      if (error) throw error;
      toast.success("Suggestion sent! We'll try to cover this soon.");
      setTopic(''); 
    } catch (error) {
      toast.error("Failed to send. Please try again later.");
    } finally {
      setIsSubmitting(false); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] p-6 md:p-10 text-white">
        <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-4">
           <div className="w-10 h-10 bg-neutral-900 animate-pulse rounded-full"></div>
           <div className="w-32 h-6 bg-neutral-900 animate-pulse rounded-full"></div>
           <div className="w-10 h-10"></div>
        </div>
        <div className="w-48 h-6 bg-neutral-900 animate-pulse rounded-full mx-auto mb-6"></div>
        <div className="w-3/4 h-12 bg-neutral-900 animate-pulse rounded-xl mx-auto mb-4"></div>
        <div className="w-2/3 h-4 bg-neutral-900 animate-pulse rounded-full mx-auto mb-16"></div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80 bg-neutral-900/50 border border-gray-800 rounded-3xl animate-pulse"></div>
          <div className="h-80 bg-neutral-900/50 border border-gray-800 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden pb-24">
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <nav className="relative z-50 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 bg-neutral-900 border border-gray-800 rounded-full text-white hover:bg-neutral-800 transition-colors">
              <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="text-purple-500" size={24}/>
            <span className="font-bold text-lg tracking-wide">Live Events</span>
          </div>
          <div className="w-10"></div> 
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* HERO SECTION */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wide mb-6 shadow-lg">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Live Training & Webinars
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white tracking-tight">
            Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Earnings</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
             Join our exclusive live sessions hosted by NewarPrime founders and top earners. Learn insider strategies, ask questions in real-time, and scale your digital business.
          </p>
        </div>

        {/* 🚨 UPCOMING EVENTS GRID */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
            <Sparkles className="text-yellow-400" /> Upcoming Sessions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map(event => (
                <div key={event.id} className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col">
                    <div className="absolute top-0 right-0 p-4 z-10">
                        {event.is_pro_only ? 
                            <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1"><Crown size={12}/> Pro Exclusive</span> 
                            : <span className="bg-green-900/40 text-green-400 border border-green-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1"><ShieldCheck size={12}/> Free for All</span>
                        }
                    </div>

                    {/* ✅ HOST PHOTO & INFO */}
                    <div className="flex items-center gap-4 mb-6 mt-2">
                        {event.host_image_url ? (
                            <img src={event.host_image_url} alt={event.host} className="w-16 h-16 rounded-full border-2 border-purple-500/50 object-cover shadow-[0_0_15px_rgba(147,51,234,0.3)]" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-purple-900/30 border-2 border-purple-500/50 flex items-center justify-center text-purple-400"><User size={24}/></div>
                        )}
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Hosted By</p>
                            <p className="font-bold text-lg text-white">{event.host}</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">{event.description}</p>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <Clock className="text-purple-400" size={20}/>
                        <span className="font-bold text-gray-200">{event.date_time}</span>
                    </div>

                    {/* ✅ GLOWING JOIN BUTTON */}
                    <button 
                        onClick={() => handleJoinEvent(event)}
                        className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] flex items-center justify-center gap-2 relative overflow-hidden mt-auto"
                    >
                        <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <ExternalLink size={18} /> Join Live Session
                    </button>
                </div>
            ))}
            
            {upcomingEvents.length === 0 && (
                <div className="col-span-full py-16 text-center border border-dashed border-gray-800 rounded-3xl bg-white/[0.01]">
                    <Calendar className="mx-auto text-gray-600 mb-4" size={48}/>
                    <p className="text-gray-400 font-bold">No upcoming sessions scheduled.</p>
                    <p className="text-gray-600 text-sm">Check back later or watch our past recordings!</p>
                </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* 📚 PAST RECORDINGS */}
            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                    <Video className="text-gray-400" /> Past Recordings
                </h2>
                <div className="space-y-4">
                    {pastEvents.map(event => (
                        <div 
                          key={event.id} 
                          onClick={() => handleJoinEvent(event)}
                          className="bg-black/50 border border-gray-800 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                {/* Small Host Image for Past Recordings */}
                                {event.host_image_url ? (
                                    <img src={event.host_image_url} alt={event.host} className="w-10 h-10 rounded-full border border-gray-700 object-cover hidden sm:block" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 hidden sm:flex"><User size={16}/></div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                                        {event.title}
                                        {event.is_pro_only && <Crown size={14} className="text-yellow-500"/>}
                                    </h4>
                                    <div className="flex gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                                        <span>🎤 {event.host}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{event.date_time}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
                                <PlayCircle size={20}/>
                            </div>
                        </div>
                    ))}
                    {pastEvents.length === 0 && (
                        <div className="py-8 text-center text-gray-600 text-sm border border-dashed border-gray-800 rounded-2xl">
                            No past recordings available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* 💡 SUGGESTION BOX */}
            <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-neutral-900 to-black border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white">
                        <MessageSquare size={18} className="text-blue-400"/> Suggest a Topic
                    </h3>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        Struggling with a specific part of your business? Let us know what you want to learn in the next live session!
                    </p>

                    <form onSubmit={handleSuggestTopic} className="space-y-4 relative z-10">
                        <textarea 
                            required
                            rows={4}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="E.g., 'How do I handle objections when people say it is too expensive?'"
                            className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-gray-600"
                        ></textarea>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                isSubmitting ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                            }`}
                        >
                            {isSubmitting ? <><CheckCircle2 size={16}/> Sent!</> : <><Send size={16}/> Submit Request</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>

      </main>
      
      {/* Required for the button light-sweep effect */}
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}