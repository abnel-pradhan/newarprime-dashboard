'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Gift, ArrowRight, Eye, EyeOff, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast'; // ✅ IMPORT TOAST

function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) return toast.error("Passwords do not match!"); // ✅ NEW POPUP
    if (password.length < 6) return toast.error("Password must be at least 6 characters."); // ✅ NEW POPUP

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone,
          referral_code: referralCode || null,
        },
      },
    });

    if (authError) {
      toast.error(authError.message); // ✅ NEW POPUP
      setLoading(false);
      return;
    }

    toast.success("Account Created! Please check your email."); // ✅ NEW POPUP
    router.push('/login');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 my-10">
        <div className="text-center mb-8">
            <img src="/logo.png" className="w-12 h-12 rounded-full mx-auto mb-4 border border-white/20 shadow-lg"/>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">Join the #1 Affiliate Platform today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18}/>
                    <input type="text" required placeholder="John Doe" className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all" onChange={(e) => setFullName(e.target.value)} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18}/>
                    <input type="email" required placeholder="you@example.com" className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all" onChange={(e) => setEmail(e.target.value)} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative group">
                    <Phone className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18}/>
                    <input type="tel" required placeholder="+91 98765 43210" className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all" onChange={(e) => setPhone(e.target.value)} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18}/>
                    <input type={showPassword ? "text" : "password"} required placeholder="Create a password" className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-12 text-white focus:border-purple-500 outline-none transition-all" onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18}/>
                    <input type={showPassword ? "text" : "password"} required placeholder="Confirm password" className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all focus:border-purple-500" onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
            </div>

            <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Referral Code (Optional)</label>
                <div className="relative group">
                    <Gift className={`absolute left-4 top-3.5 transition-colors ${referralCode ? 'text-green-500' : 'text-gray-500'}`} size={18}/>
                    <input type="text" placeholder="Sponsor Code" value={referralCode} className={`w-full bg-black/50 border rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-all ${referralCode ? 'border-green-500/50 text-green-400' : 'border-gray-800 focus:border-purple-500'}`} onChange={(e) => setReferralCode(e.target.value)} />
                    {referralCode && <CheckCircle className="absolute right-4 top-3.5 text-green-500" size={18}/>}
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 mt-6 transform hover:scale-[1.02]">
                {loading ? <Loader2 className="animate-spin"/> : <>Create Account <ArrowRight size={20}/></>}
            </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Login Here</Link></p>
      </div>
    </div>
  );
}

export default function Register() {
  return <Suspense fallback={<div>Loading...</div>}><RegisterForm /></Suspense>;
}