'use client';
import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden font-sans">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* GLASS CARD */}
      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
            <img src="/logo.png" className="w-12 h-12 rounded-full mx-auto mb-4 border border-white/20 shadow-lg"/>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Enter your credentials to access your empire.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20}/>
                    <input 
                      type="email" 
                      required 
                      placeholder="you@example.com"
                      className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20}/>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-12 text-white focus:border-purple-500 outline-none transition-all"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                </div>
                <div className="text-right">
                    <span className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer">Forgot Password?</span>
                </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="animate-spin"/> : <>Login to Dashboard <ArrowRight size={20}/></>}
            </button>

        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
            Don't have an account? <Link href="/register" className="text-white font-bold hover:underline">Join Now</Link>
        </p>

      </div>
    </div>
  );
}

export default function Login() {
  return <Suspense fallback={<div>Loading...</div>}><LoginForm /></Suspense>;
}