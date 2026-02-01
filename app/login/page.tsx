'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        alert("⚠ Please verify your email first! Check your inbox.");
      } else {
        alert(error.message);
      }
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans">
      <div className="flex w-full max-w-6xl bg-black rounded-3xl overflow-hidden shadow-2xl h-[850px] border border-gray-800 relative">
        
        {/* BACK BUTTON (Top Left) */}
        <div className="absolute top-6 left-6 z-20">
            <Link href="/" className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10">
                <ArrowLeft size={20} />
            </Link>
        </div>

        {/* LEFT SIDE: Purple Gradient */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-purple-900 to-black p-12 flex-col justify-between text-white relative">
          
          <div className="relative z-10 mt-10">
            {/* LOGO SECTION (Fixed) */}
            <div className="flex items-center space-x-3 mb-10">
              {/* 1. Your Actual Logo */}
              <img 
                src="/logo.png" 
                alt="NewarPrime Logo" 
                className="w-12 h-12 object-cover rounded-full border-2 border-white/20 shadow-xl" 
              />
              {/* 2. Text is White here for better contrast against purple bg */}
              <span className="text-3xl font-bold tracking-wide text-white drop-shadow-md">
                NewarPrime
              </span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome Back</h1>
            <p className="text-lg text-purple-200 max-w-md leading-relaxed">
              Login to access your dashboard, track your sales, and manage your affiliate link.
            </p>
          </div>

          {/* Decorative Quote */}
          <div className="relative z-10 mb-20">
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-sm shadow-xl">
                <p className="font-semibold text-lg italic">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Login Form */}
        <div className="w-full lg:w-1/2 bg-[#0a0a0a] p-8 md:p-16 flex flex-col justify-center text-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold mb-2 text-center">Member Login</h2>
            <p className="text-gray-400 text-center mb-8">Enter your credentials to continue.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    className="w-full p-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
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

                {/* Forgot Password Link */}
                <div className="flex justify-end mt-2">
                    <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors hover:underline">
                        Forgot Password?
                    </Link>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors mt-6 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Verifying...' : 'Login to Dashboard'}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-white font-semibold hover:underline">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}