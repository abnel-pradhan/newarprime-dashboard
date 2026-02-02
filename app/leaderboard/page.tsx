'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Trophy, Crown, Medal, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLeaders = async () => {
      // Fetch top 50 users by total_earnings
      const { data } = await supabase
        .from('profiles')
        .select('full_name, total_earnings, avatar_url, username')
        .order('total_earnings', { ascending: false })
        .limit(50);
      
      setLeaders(data || []);
      setLoading(false);
    };
    getLeaders();
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Champions...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black pb-20 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="relative py-20 bg-neutral-900/30 border-b border-gray-800 text-center">
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
            <Link href="/dashboard" className="p-3 bg-neutral-800 rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
                <ArrowLeft size={20} />
            </Link>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        
        <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Trophy size={14} /> Wall of Fame
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500">Performers</span>
        </h1>
        <p className="text-gray-400">The highest earning affiliates of all time.</p>
      </div>

      {/* TOP 3 PODIUM (Responsive Fix) */}
<div className="max-w-5xl mx-auto px-6 mt-8 mb-16">
  {/* On Mobile: Stack Vertically. On Desktop: Row aligned at bottom */}
  <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-6 md:gap-12">
      
      {/* 🥇 1st Place (Winner) - Shows FIRST on Mobile now */}
      {leaders[0] && (
          <div className="order-1 flex flex-col items-center z-10 mb-6 md:mb-0">
              <div className="relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                      <Crown size={28} fill="currentColor" />
                  </div>
                  <img 
                      src={leaders[0].avatar_url || `https://ui-avatars.com/api/?name=${leaders[0].full_name}&background=random`} 
                      className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)] object-cover"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-0.5 rounded-full text-xs font-bold border border-yellow-300 shadow-lg">#1</div>
              </div>
              <h3 className="mt-5 font-bold text-xl text-white text-center">{leaders[0].full_name}</h3>
              <p className="text-yellow-400 font-bold font-mono text-lg">₹{leaders[0].total_earnings}</p>
          </div>
      )}

      {/* 🥈 2nd Place */}
      {leaders[1] && (
          <div className="order-2 flex flex-row md:flex-col items-center gap-4 md:gap-0 bg-neutral-900/50 md:bg-transparent p-4 md:p-0 rounded-2xl w-full md:w-auto border border-gray-800 md:border-none">
              <div className="relative shrink-0">
                  <img 
                      src={leaders[1].avatar_url || `https://ui-avatars.com/api/?name=${leaders[1].full_name}&background=random`} 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-400 shadow-[0_0_30px_rgba(156,163,175,0.5)] object-cover"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-700 text-gray-200 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-500">#2</div>
              </div>
              <div className="text-left md:text-center">
                  <h3 className="font-bold text-base text-gray-300">{leaders[1].full_name}</h3>
                  <p className="text-gray-500 text-sm font-mono">₹{leaders[1].total_earnings}</p>
              </div>
          </div>
      )}

      {/* 🥉 3rd Place */}
      {leaders[2] && (
          <div className="order-3 flex flex-row md:flex-col items-center gap-4 md:gap-0 bg-neutral-900/50 md:bg-transparent p-4 md:p-0 rounded-2xl w-full md:w-auto border border-gray-800 md:border-none">
              <div className="relative shrink-0">
                  <img 
                      src={leaders[2].avatar_url || `https://ui-avatars.com/api/?name=${leaders[2].full_name}&background=random`} 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-700 shadow-[0_0_30px_rgba(194,65,12,0.4)] object-cover"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-900 text-orange-200 px-2 py-0.5 rounded-full text-[10px] font-bold border border-orange-700">#3</div>
              </div>
               <div className="text-left md:text-center">
                  <h3 className="font-bold text-base text-orange-200">{leaders[2].full_name}</h3>
                  <p className="text-orange-500 text-sm font-mono">₹{leaders[2].total_earnings}</p>
              </div>
          </div>
      )}

  </div>
</div>

      {/* THE REST OF THE LIST */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-neutral-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
            {leaders.slice(3).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-5 border-b border-gray-800 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-500 font-bold w-6 text-center">{index + 4}</span>
                        <img 
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`} 
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{user.full_name}</p>
                            <p className="text-xs text-gray-500">@{user.username || 'user'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-mono font-bold text-green-400">₹{user.total_earnings}</p>
                    </div>
                </div>
            ))}
            
            {leaders.length === 0 && (
                <div className="p-10 text-center text-gray-500">
                    <Sparkles className="mx-auto mb-3 opacity-20" size={40}/>
                    No data available yet. Be the first to earn!
                </div>
            )}
        </div>
      </div>

    </div>
  );
}