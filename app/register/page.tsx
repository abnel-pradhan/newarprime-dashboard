'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Gift, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Phone } from 'lucide-react';

// Component to handle search params
function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // ✅ Added Phone State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-fill referral code from URL if present
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation: Passwords must match
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    // 2. Validation: Length check
    if (password.length < 6) {
        alert("⚠ Password must be at least 6 characters.");
        return;
    }

    setLoading(true);

    // 3. Sign Up User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone, // ✅ Saving Phone Number
          referral_code: referralCode || null,
        },
      },
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    // 4. Success!
    alert("✅ Account Created Successfully! Please check your email to verify.");
    router.push('/login');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans">
      <div className="flex w-full max-w-6xl bg-black rounded-3xl overflow-hidden shadow-2xl h-[950px] border border-gray-800 relative">
        
        {/* BACK BUTTON (Top Left) */}
        <div className="absolute top-6 left-6 z-20">
            <Link href="/" className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10">
                <ArrowLeft size={20} />
            </Link>
        </div>

        {/* LEFT SIDE: Purple Gradient */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-purple-900 to-black p-12 flex-col justify-between text-white relative">
          
          <div className="relative z-10 mt-10">
            {/* LOGO SECTION */}
            <div className="flex items-center space-x-3 mb-10">
              <img 
                src="/logo.png" 
                alt="NewarPrime Logo" 
                className="w-12 h-12 object-cover rounded-full border-2 border-white/20 shadow-xl" 
              />
              <span className="text-3xl font-bold tracking-wide text-white drop-shadow-md">
                NewarPrime
              </span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 leading-tight">Start Your Journey</h1>
            <p className="text-lg text-purple-200 max-w-md leading-relaxed">
              Join thousands of affiliates earning daily. Create your account and start your training today.
            </p>
          </div>

          {/* Decorative Quote */}
          <div className="relative z-10 mb-20">
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-sm shadow-xl">
                <p className="font-semibold text-lg italic">"The best way to predict the future is to create it."</p>
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Registration Form */}
        <div className="w-full lg:w-1/2 bg-[#0a0a0a] p-8 md:p-12 flex flex-col justify-center text-white overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold mb-2 text-center">Create Account</h2>
            <p className="text-gray-400 text-center mb-6">Fill in your details to get started.</p>

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                </div>
              </div>

              {/* Phone Number (NEW FIELD) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a password"
                    className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all pr-10"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    className={`w-full p-3 pl-10 bg-gray-900 border rounded-lg outline-none text-white transition-all ${
                        password && confirmPassword && password !== confirmPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-800 focus:ring-2 focus:ring-purple-500'
                    }`}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12}/> Passwords do not match
                    </p>
                )}
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Referral Code (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Sponsor Code"
                    value={referralCode}
                    className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                  <Gift className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  {referralCode && (
                      <div className="absolute right-3 top-3.5 text-green-500">
                          <CheckCircle size={18} />
                      </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all mt-4 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : <>Get Started <ArrowRight size={20} /></>}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}