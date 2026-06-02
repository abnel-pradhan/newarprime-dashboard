'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2, Lock, Clock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://newarprime.in/auth/callback',
    });

    if (error) {
      if (error.status === 429) {
        toast.error("Security limit reached. Please wait.");
        setCooldown(60);
      } else {
        toast.error(error.message);
      }
    } else {
      setSent(true);
      setCooldown(60);
      toast.success("Security link dispatched!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
      
      {/* Animated Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]"></div>

      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative z-10">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-400 mb-8 text-sm font-medium transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Login
        </Link>

        {sent ? (
            <div className="text-center py-4">
                <div className="w-20 h-20 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 text-green-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/30 rotate-3">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Check Inbox</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  We've sent a secure link to <br/>
                  <span className="text-purple-400 font-mono text-sm">{email}</span>
                </p>
                <button 
                  onClick={() => setSent(false)} 
                  className="px-6 py-2 rounded-full border border-white/10 text-gray-400 text-xs hover:bg-white/5 transition-colors"
                >
                  Used wrong email?
                </button>
            </div>
        ) : (
            <>
                <div className="mb-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                        <Lock size={28} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">Recover Access</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Enter your NewarPrime ID to receive a secure password recovery link.
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] ml-1">Identity Verification</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-4 text-gray-600 group-focus-within:text-purple-400 transition-colors" size={18}/>
                            <input 
                              type="email" 
                              required 
                              placeholder="name@newarprime.in"
                              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500/50 focus:bg-white/[0.05] outline-none transition-all placeholder:text-gray-700"
                              onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || cooldown > 0}
                      className={`w-full font-bold py-4 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 overflow-hidden relative group ${
                        cooldown > 0 
                        ? 'bg-neutral-800 text-gray-500 cursor-not-allowed border border-white/5' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                        {loading ? (
                          <Loader2 className="animate-spin" size={20}/>
                        ) : cooldown > 0 ? (
                          <>
                            <Clock size={18} className="animate-pulse"/>
                            <span>Resend in {cooldown}s</span>
                          </>
                        ) : (
                          <>
                            <span>Authorize Reset</span>
                            <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18}/>
                          </>
                        )}
                    </button>
                </form>
                
                <p className="text-center mt-10 text-[10px] text-gray-600 uppercase tracking-widest">
                  Secure Encryption Active
                </p>
            </>
        )}
      </div>
    </div>
  );
}