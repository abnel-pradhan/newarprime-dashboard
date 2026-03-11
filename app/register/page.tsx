'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Gift, ArrowRight, Phone, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Password Match Check
    if (password !== confirmPassword) {
        return toast.error("Passwords do not match!");
    }

    // 2. Strong Password Check (At least 6 chars, 1 number, 1 special character)
    const strongPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    if (!strongPasswordRegex.test(password)) {
        return toast.error("Password must be at least 6 characters, include 1 number, and 1 special symbol (e.g. @, #, $)");
    }

    // 3. 10-Digit Phone Number Check (Only allows exactly 10 numbers)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        return toast.error("Please enter a valid 10-digit phone number.");
    }

    setLoading(true);

    // 4. Validate Sponsor Code in Database (If one was entered)
    if (referralCode) {
        // We check the profiles table to see if this code belongs to a real user
        const { data: sponsorExists, error: sponsorError } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode) // <--- WE CHANGED THIS LINE!
            .single();

        if (sponsorError || !sponsorExists) {
            setLoading(false);
            return toast.error("Invalid Sponsor Code! Please check and try again.");
        }
    }
    
    // 5. If everything passes, create the account
    try {
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

        if (authError) throw authError;

        toast.success("Account Created! Redirecting to login...");
        setTimeout(() => router.push('/login'), 1500);

    } catch (error: any) {
        toast.error(error.message);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans relative overflow-hidden py-12">
       {/* Premium Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
       
       {/* Ambient Glow Effects */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
       <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

       {/* Glassmorphism Card */}
       <div className="w-full max-w-[500px] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
          
          <div className="text-center mb-8">
              {/* Circular Logo */}
              <div className="flex justify-center mb-4">
                  <img 
                      src="/logo.png" 
                      alt="NewarPrime Logo" 
                      className="w-16 h-16 object-cover rounded-full drop-shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-white/10" 
                  />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wide mb-4">
                  <ShieldCheck size={14} className="text-purple-400"/> #1 Affiliate Platform
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
              <p className="text-gray-400 text-sm">Join thousands earning daily with NewarPrime.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                  <input type="text" required placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
              </div>

              <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                  <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
              </div>

              <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                  <input type="tel" required placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password Field */}
                  <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all tracking-widest"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500 hover:text-purple-400 transition-colors">
                          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        placeholder="Confirm" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all tracking-widest"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-gray-500 hover:text-purple-400 transition-colors">
                          {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                  </div>
              </div>

              <div className="relative group pt-2">
                  <Gift className="absolute left-4 top-3.5 text-purple-500/50 group-focus-within:text-purple-400 transition-colors" size={20}/>
                  <input type="text" placeholder="Sponsor Code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full bg-purple-900/10 border border-purple-500/30 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-2 mt-6"
              >
                  {loading ? <Loader2 className="animate-spin" size={20}/> : <>Create Account <ArrowRight size={20}/></>}
              </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
              Already have an account? <Link href="/login" className="text-white font-bold hover:text-purple-400 transition-colors">Sign in</Link>
          </p>
       </div>
    </div>
  );
}

// Wrapper for useSearchParams (Next.js requirement)
export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <Loader2 className="animate-spin" size={32} />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}