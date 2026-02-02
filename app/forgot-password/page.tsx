'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast'; // ✅ Smart Popup

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast.error(error.message); // ✅ Smart Error
    } else {
      setSent(true);
      toast.success("Reset link sent!"); // ✅ Smart Success
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft size={16}/> Back to Login
        </Link>

        {sent ? (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400 text-sm">We have sent a password reset link to <span className="text-white font-bold">{email}</span>.</p>
                <p className="text-gray-500 text-xs mt-6">Did not receive it? Check Spam folder.</p>
            </div>
        ) : (
            <>
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-400 border border-purple-500/20">
                        <Lock size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-gray-400 text-sm">No worries! Enter your email and we will send you a reset link.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Registered Email</label>
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

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : <>Send Reset Link <ArrowLeft className="rotate-180" size={20}/></>}
                    </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
}