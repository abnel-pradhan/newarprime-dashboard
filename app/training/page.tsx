'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Lock } from 'lucide-react';

export default function Training() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is active (paid)
      const { data: profile } = await supabase.from('profiles').select('is_active').eq('id', user.id).single();
      if (profile) setActive(profile.is_active);
      setLoading(false);
    };
    checkAccess();
  }, []);

  const videos = [
    { title: "Introduction to Affiliate Marketing", id: "1" },
    { title: "How to Generate Leads", id: "2" },
    { title: "Closing Sales Like a Pro", id: "3" },
    { title: "Personal Branding Mastery", id: "4" },
  ];

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.push('/dashboard')} className="p-2 bg-neutral-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"><ArrowLeft size={20} /></button>
            <h1 className="text-3xl font-bold">Training Hub</h1>
        </div>

        {!active ? (
            <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-2xl text-center">
                <Lock size={48} className="mx-auto text-red-500 mb-4"/>
                <h2 className="text-2xl font-bold text-red-400 mb-2">Access Locked</h2>
                <p className="text-gray-300">You must purchase a package to view these training videos.</p>
                <button onClick={() => router.push('/dashboard')} className="mt-6 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200">Go to Dashboard</button>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid, i) => (
                    <div key={i} className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500 transition-all group cursor-pointer">
                        {/* Fake Video Thumbnail */}
                        <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <Play fill="white" className="text-white ml-1" size={20}/>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{vid.title}</h3>
                            <p className="text-gray-500 text-sm">Lesson {i + 1}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}