'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation: Do passwords match?
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    // 2. Validation: Is it long enough?
    if (password.length < 6) {
      alert("⚠ Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    // 3. Update Password in Supabase
    const { error } = await supabase.auth.updateUser({ 
      password: password 
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      alert("✅ Password Updated Successfully!");
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-neutral-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Set New Password</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Create a strong password for your account.</p>
        
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* NEW PASSWORD FIELD */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-purple-500 outline-none pr-10 transition-all"
                required
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-black border rounded-lg p-3 pl-10 text-white outline-none pr-10 transition-all ${
                  password && confirmPassword && password !== confirmPassword 
                    ? 'border-red-500 focus:border-red-500' // Red border if not matching
                    : 'border-gray-700 focus:border-purple-500'
                }`}
                required
              />
              
              {/* EYE ICON TOGGLE (Controls both fields) */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            
            {/* Real-time Error Message */}
            {password && confirmPassword && password !== confirmPassword && (
               <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg transform active:scale-[0.98]"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}