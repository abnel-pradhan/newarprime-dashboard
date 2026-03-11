'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, Zap } from 'lucide-react';
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

      if (error) throw error;

      toast.success("Welcome back!");
      
      // CRITICAL FIX: Refresh router so Middleware sees the new cookie
      router.refresh(); 
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans relative overflow-hidden">
       {/* Premium Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
       
       {/* Ambient Glow Effects */}
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

       {/* Glassmorphism Card */}
       <div className="w-full max-w-[420px] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
          
          <div className="flex justify-center mb-6">
            <img 
                src="/logo.png" 
                alt="NewarPrime Logo" 
                className="w-16 h-16 object-cover rounded-full drop-shadow-[0_0_15px_rgba(147,51,234,0.3)]" 
            />
        </div>
          <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Sign in to your NewarPrime account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                  <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                      <input 
                        type="email" 
                        required 
                        placeholder="Email Address"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>

                  <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                      <input 
                        type="password" 
                        required 
                        placeholder="Password"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all tracking-widest"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                  </div>
              </div>

              <div className="flex justify-end pt-1">
                  <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      Forgot Password?
                  </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-2 mt-4"
              >
                  {loading ? <Loader2 className="animate-spin" size={20}/> : <>Sign In <ArrowRight size={20}/></>}
              </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
              Don't have an account? <Link href="/register" className="text-white font-bold hover:text-purple-400 transition-colors">Create one</Link>
          </p>
       </div>
    </div>
  );
}