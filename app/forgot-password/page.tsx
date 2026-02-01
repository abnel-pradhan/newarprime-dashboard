'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // To show success message
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Supabase Magic: Sends a reset link to the user's email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Redirects them to dashboard after clicking link
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true); // Show success screen
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>

      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800 transition-all text-sm font-medium border border-gray-800">
            <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>

      <div className="bg-neutral-900/50 border border-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md backdrop-blur-xl relative">
        
        {/* SUCCESS STATE (Shows after sending email) */}
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your Inbox</h2>
            <p className="text-gray-400 mb-8">
              We have sent a password reset link to <span className="text-white font-medium">{email}</span>.
            </p>
            <Link href="/login" className="block w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
              Return to Login
            </Link>
          </div>
        ) : (
          /* FORM STATE (Default) */
          <form onSubmit={handleReset}>
            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
               <p className="text-gray-400 text-sm">Enter your email and we'll send you a link to get back into your account.</p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 pl-10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}