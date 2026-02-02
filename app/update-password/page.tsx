'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // ✅ Smart Popup

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Password Updated! Redirecting...");
      setTimeout(() => {
          router.push('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans relative overflow-hidden">
       {/* Background Glows */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Set New Password</h2>
        
        <form onSubmit={handleUpdate} className="space-y-6">
            <div className="relative group">
                <input 
                  type="password" 
                  required 
                  placeholder="Enter New Password"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-green-500 outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-4 top-3.5 text-gray-500" size={18}/>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-lg">
               {loading ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Update Password</>}
            </button>
        </form>
      </div>
    </div>
  );
}