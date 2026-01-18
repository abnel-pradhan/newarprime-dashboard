'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Phone, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Toggle States
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); 
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCodeInput = searchParams.get('ref');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Check Passwords
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        setLoading(false);
        return;
    }

    // 2. Validate Phone Format
    const phoneRegex = /^[6-9]\d{9}$/; 
    if (!phoneRegex.test(phone)) {
        alert("Invalid Phone Number! Please enter a valid 10-digit Indian number.");
        setLoading(false);
        return;
    }

    // 3. Resolve Referral Code
    let finalReferredBy = null;
    if (referralCodeInput) {
        const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', referralCodeInput).single();
        if (referrer) finalReferredBy = referrer.id;
    }

    // 4. Generate New Unique Code (First 4 letters of Name + 4 Random Numbers)
    const namePart = fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const newReferralCode = `${namePart}${randomPart}`;

    // 5. ATTEMPT SIGN UP (Auth Layer)
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone_number: phone } }
    });

    if (error) {
      alert("Auth Error: " + error.message);
      setLoading(false);
      return;
    }

    if (user) {
      // 6. ATTEMPT PROFILE CREATION (Database Layer)
      const { error: profileError } = await supabase.from('profiles').insert([{
            id: user.id,
            email: email,
            full_name: fullName,
            phone_number: phone,
            is_active: false,
            wallet_balance: 0,
            referral_code: newReferralCode,
            referred_by: finalReferredBy
        }]);
        
        if (profileError) {
             alert("Database Error: " + profileError.message);
        } else {
             setSuccess(true); 
        }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-neutral-950 w-full max-w-6xl rounded-3xl overflow-hidden flex shadow-2xl border border-neutral-800 min-h-[650px]">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="hidden md:flex w-5/12 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 p-12 flex-col justify-between relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center"><div className="w-5 h-5 bg-purple-600 rounded-full"></div></div>
                  <span className="text-2xl font-bold text-white">NewarPrime</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Start Your Journey</h1>
              <p className="text-purple-200 text-lg opacity-90">Join thousands of affiliates earning daily.</p>
           </div>
           <div className="relative z-10 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <p className="text-white italic text-lg mb-4">"The best way to predict the future is to create it."</p>
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-black font-bold text-xs">NP</div>
                  <div><p className="text-white font-bold text-sm">Affiliate Team</p><p className="text-xs text-gray-300">NewarPrime Official</p></div>
              </div>
           </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="w-full md:w-7/12 flex items-center justify-center p-12 bg-neutral-950">
          <div className="w-full max-w-md">
              {success ? (
                  <div className="text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Mail size={40} className="text-green-500" /></div>
                      <h2 className="text-3xl font-bold text-white mb-2">Check Your Email</h2>
                      <p className="text-gray-400 mb-8">We sent a confirmation link to <span className="text-white font-semibold">{email}</span>.</p>
                      <Link href="/login" className="block w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors text-center">Go to Login</Link>
                  </div>
              ) : (
                  <div className="space-y-6">
                      <div className="text-center md:text-left">
                          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                          <p className="text-gray-400">Enter your details to register.</p>
                      </div>

                      <form onSubmit={handleRegister} className="space-y-4">
                          
                          {/* Full Name */}
                          <div>
                              <label className="text-xs font-semibold text-gray-400 block mb-2">Full Name</label>
                              <div className="relative group">
                                <User className="absolute left-4 top-3.5 text-gray-500" size={18}/>
                                <input type="text" onChange={(e) => setFullName(e.target.value)} className="w-full pl-11 p-4 bg-black border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="John Doe" required />
                              </div>
                          </div>

                          {/* Phone */}
                          <div>
                              <label className="text-xs font-semibold text-gray-400 block mb-2">Phone Number</label>
                              <div className="relative group">
                                <Phone className="absolute left-4 top-3.5 text-gray-500" size={18}/>
                                <input type="tel" maxLength={10} onChange={(e) => setPhone(e.target.value)} className="w-full pl-11 p-4 bg-black border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="9876543210" required />
                              </div>
                          </div>

                          {/* Email */}
                          <div>
                              <label className="text-xs font-semibold text-gray-400 block mb-2">Email Address</label>
                              <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-500" size={18}/>
                                <input type="email" onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 p-4 bg-black border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" placeholder="you@example.com" required />
                              </div>
                          </div>

                          {/* Password */}
                          <div>
                              <label className="text-xs font-semibold text-gray-400 block mb-2">Password</label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-500" size={18}/>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full pl-11 pr-12 p-4 bg-black border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" 
                                    placeholder="••••••••" 
                                    required 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-white">
                                    {showPassword ? <Eye size={18}/> : <EyeOff size={18}/>}
                                </button>
                              </div>
                          </div>

                          {/* Confirm Password */}
                          <div>
                              <label className="text-xs font-semibold text-gray-400 block mb-2">Confirm Password</label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-500" size={18}/>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="w-full pl-11 pr-12 p-4 bg-black border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none" 
                                    placeholder="••••••••" 
                                    required 
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-white">
                                    {showConfirmPassword ? <Eye size={18}/> : <EyeOff size={18}/>}
                                </button>
                              </div>
                          </div>

                          <button disabled={loading} className="w-full py-4 mt-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all flex justify-center items-center gap-2 text-lg">
                              {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                          </button>
                      </form>

                      <div className="text-center text-sm text-gray-500">
                          Already have an account? <Link href="/login" className="text-white hover:underline font-medium ml-1">Login here</Link>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}