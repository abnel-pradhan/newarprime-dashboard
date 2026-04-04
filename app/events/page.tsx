'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, Calendar, Clock, Video, Users, 
  PlayCircle, Sparkles, MessageSquare, Send, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EventsPage() {
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ NEW: State to track if the user is paid/active
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  // ✅ NEW: Background check to see if they are a paid user
  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_active').eq('id', user.id).single();
        if (profile?.is_active) {
          setIsActive(true);
        }
      }
    };
    checkUserStatus();
  }, []);

  // ✅ NEW: The Security Lock Function
  const handleProtectedClick = (e: React.MouseEvent, destinationUrl?: string) => {
    e.preventDefault(); // Stop normal clicking behavior
    
    if (!isActive) {
      // If they haven't paid, block them and redirect!
      toast.error("🔒 Active package required! Redirecting...");
      setTimeout(() => {
        router.push('/register');
      }, 1500);
    } else {
      // If they have paid, let them through!
      toast.success("Opening secure session...");
      if (destinationUrl) {
          window.open(destinationUrl, '_blank');
      }
    }
  };

  const handleSuggestTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return toast.error("Please enter a topic");
    
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Suggestion sent! We'll try to cover this soon.");
      setTopic('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden pb-20">
      
      {/* 🌟 BACKGROUND GLOWS */}
      <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <Link href="/" className="p-2 bg-neutral-900 border border-gray-800 rounded-full text-white hover:bg-neutral-800 transition-colors">
              <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Calendar className="text-purple-500" size={24}/>
            <span className="font-bold text-lg tracking-wide">Live Events</span>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
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
            
            {/* Event Card 1 */}
            <div className="bg-gradient-to-b from-neutral-900/80 to-black border border-purple-500/30 rounded-3xl p-1 relative overflow-hidden group hover:border-purple-500 transition-colors shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <div className="bg-black rounded-[1.4rem] p-6 h-full flex flex-col relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 w-fit">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE WEBINAR
                    </span>
                    <span className="text-purple-400 bg-purple-900/20 px-2 py-1 rounded text-xs border border-purple-500/20 font-bold flex items-center gap-1">
                       <Users size={12}/> Pro Only
                    </span>
                 </div>
                 
                 <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">Mastering Instagram Sales: 0 to 10k Followers</h3>
                 <p className="text-gray-400 text-sm mb-6 flex-1">Discover the exact content formula to attract high-paying leads organically using Reels and Stories.</p>
                 
                 <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Calendar size={16} className="text-purple-500"/> <span>Sunday, April 12, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Clock size={16} className="text-purple-500"/> <span>8:00 PM IST (45 mins)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Video size={16} className="text-purple-500"/> <span>Host: Sharwan Subba (CMO)</span>
                    </div>
                 </div>
                 
                 {/* ✅ APPLIED SECURITY LOCK */}
                 <button 
                    onClick={(e) => handleProtectedClick(e, 'https://meet.google.com/your-link-here')}
                    className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                 >
                    <PlayCircle size={18}/> Join Session Link
                 </button>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="bg-neutral-900 border border-gray-800 rounded-3xl p-6 flex flex-col hover:border-blue-500/50 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-900/50 text-blue-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border border-blue-800">
                      Q&A / MOTIVATION
                    </span>
                 </div>
                 
                 <h3 className="text-xl font-bold text-white mb-2">Weekly NewarPrime Mastermind</h3>
                 <p className="text-gray-400 text-sm mb-6 flex-1">Bring your doubts and challenges. Our CEO will be answering your questions live and sharing the roadmap for next month.</p>
                 
                 <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Calendar size={16}/> <span>Wednesday, April 15, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Clock size={16}/> <span>7:00 PM IST</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Video size={16}/> <span>Host: Utam Pradhan (CEO)</span>
                    </div>
                 </div>
                 
                 {/* ✅ APPLIED SECURITY LOCK */}
                 <button 
                    onClick={(e) => handleProtectedClick(e, 'https://zoom.us/your-link-here')}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                 >
                    Register Now
                 </button>
            </div>

          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* 📚 PAST RECORDINGS */}
            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                    <Video className="text-gray-400" /> Past Recordings
                </h2>
                <div className="space-y-4">
                    {[
                        { title: 'The "Zero to First ₹10k" Blueprint', date: 'March 28, 2026', dur: '58 mins' },
                        { title: 'Facebook Ads 101 for Affiliates', date: 'March 15, 2026', dur: '1h 12m' },
                        { title: 'How to Build Trust over DMs', date: 'March 02, 2026', dur: '45 mins' }
                    ].map((rec, i) => (
                        // ✅ APPLIED SECURITY LOCK TO ALL VIDEOS
                        <div 
                          key={i} 
                          onClick={(e) => handleProtectedClick(e, 'https://youtube.com/your-unlisted-video')}
                          className="bg-black/50 border border-gray-800 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                            <div>
                                <h4 className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors">{rec.title}</h4>
                                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                    <span>{rec.date}</span>
                                    <span>•</span>
                                    <span>{rec.dur}</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <PlayCircle size={20}/>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-4 text-sm text-gray-500 hover:text-white font-bold border border-dashed border-gray-800 rounded-2xl hover:bg-white/5 transition-all">
                        Load More Recordings...
                    </button>
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
    </div>
  );
}