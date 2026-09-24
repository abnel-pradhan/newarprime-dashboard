'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Send, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Directs to the callback route first to exchange the secure token,
      // then uses the 'next' parameter to forward to the update page.
      // Make sure this exactly matches your Supabase URL Configuration.
      redirectTo: 'https://newarprime.in/auth/callback?next=/update-password',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Reset link sent! Check your email.");
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] selection:bg-purple-500 selection:text-white p-4 relative overflow-hidden">
      
      {/* Premium Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* Icon Header */}
        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <KeyRound className="text-purple-400" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">Reset Password</h2>
        <p className="text-gray-400 text-center text-sm mb-8">Enter your NewarPrime email and we will send you a reset link.</p>

        <form onSubmit={handleResetRequest} className="space-y-6">
          
          {/* Email Input */}
          <div className="relative group">
            <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
            <input 
              type="email" 
              required 
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(147,51,234,0.2)] transition-all flex items-center justify-center gap-2 ${
              loading 
              ? 'bg-purple-600/50 text-white cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]'
            }`}
          >
            {loading ? <><Loader2 className="animate-spin" size={20}/> Sending...</> : <><Send size={20}/> Send Reset Link</>}
          </button>
          
          <div className="text-center mt-4">
            <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}