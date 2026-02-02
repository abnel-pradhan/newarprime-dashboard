'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Login Successful!");
      
      // ⚡ CRITICAL FIX: Refresh router so Middleware sees the new cookie
      router.refresh(); 
      
      // Wait a tiny bit for the cookie to set, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans relative overflow-hidden">
       {/* Glow Effects */}
       <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
          <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Login to continue your journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                  <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20}/>
                      <input 
                        type="email" 
                        required 
                        placeholder="Email Address"
                        className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>

                  <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20}/>
                      <input 
                        type="password" 
                        required 
                        placeholder="Password"
                        className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                  </div>
              </div>

              <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Forgot Password?
                  </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                  {loading ? <Loader2 className="animate-spin"/> : <>Login <ArrowRight size={20}/></>}
              </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
              Don't have an account? <Link href="/register" className="text-white font-bold hover:underline">Register</Link>
          </p>
       </div>
    </div>
  );
}