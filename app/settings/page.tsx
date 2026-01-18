'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, CreditCard, Lock, Loader2, ShieldCheck, Mail, Phone, Landmark, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Personal Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment Details
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [holderName, setHolderName] = useState('');
  
  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Fetch Profile Data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user.email || ''); 
      setPhone(profile.phone_number || 'Not Provided'); 
      
      setUpiId(profile.payout_upi_id || '');
      setBankAccount(profile.bank_account_no || '');
      setIfsc(profile.bank_ifsc || '');
      setHolderName(profile.bank_holder_name || '');
    }
    setLoading(false);
  };

  // --- FORGOT PASSWORD HANDLER ---
  const handleForgotPassword = async () => {
    if (!email) return alert("No email found.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) alert("Error: " + error.message);
    else {
        setResetSent(true);
        alert(`Reset Link Sent to ${email}! Check your inbox.`);
    }
  };

  // --- MAIN SAVE HANDLER ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. SECURITY CHECK
    if (newPassword) {
        if (!oldPassword) {
            alert("Security Check: Please enter your CURRENT password to set a new one.");
            setSaving(false);
            return;
        }

        if (newPassword.length < 6) {
            alert("Security Alert: New password must be at least 6 characters long.");
            setSaving(false);
            return;
        }

        // Verify Old Password
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: email,
            password: oldPassword
        });

        if (verifyError) {
            alert("Security Failed: The 'Old Password' is incorrect.");
            setSaving(false);
            return;
        }

        // Update Password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) {
            alert("Error updating password: " + updateError.message);
            setSaving(false);
            return;
        }
    }

    // 2. SAVE PROFILE DETAILS
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        payout_upi_id: upiId,
        bank_account_no: bankAccount,
        bank_ifsc: ifsc,
        bank_holder_name: holderName
      })
      .eq('id', user.id);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      alert("Success: Profile Updated!");
      setOldPassword('');
      setNewPassword('');
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={() => router.push('/dashboard')} 
                className="p-2 bg-neutral-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6" autoComplete="off">
            {/* Hidden inputs to stop browser auto-fill */}
            <input type="text" style={{display: 'none'}} />
            <input type="password" style={{display: 'none'}} />
            
            {/* 1. PERSONAL DETAILS */}
            <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-purple-400">
                    <User size={20}/> Personal Details
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Full Name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition-colors"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Email</label><input type="text" value={email} disabled className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-gray-500 cursor-not-allowed"/></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Phone</label><input type="text" value={phone} disabled className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-gray-500 cursor-not-allowed"/></div>
                    </div>
                </div>
            </div>

            {/* 2. PAYMENT DETAILS */}
            <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400">
                    <CreditCard size={20}/> Payment Details
                </h2>
                <div className="space-y-6">
                    <div><label className="text-xs text-gray-500 font-bold uppercase mb-1 block">UPI ID</label><input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@okaxis" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-green-500 transition-colors font-mono"/></div>
                    <div className="pt-4 border-t border-gray-800">
                        <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2"><Landmark size={16}/> Bank Transfer (Optional)</h3>
                        <div className="space-y-4">
                             <div><label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Account Holder Name</label><input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Name as per Bank Passbook" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors"/></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Account Number</label><input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="XXXXXXXXXX" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors font-mono"/></div>
                                <div><label className="text-xs text-gray-500 font-bold uppercase mb-1 block">IFSC Code</label><input type="text" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="SBIN000XXXX" maxLength={11} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors font-mono uppercase"/></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. SECURITY SECTION */}
            <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-500">
                    <ShieldCheck size={20}/> Security & Password
                </h2>

                <div className="space-y-5">
                    {/* OLD PASSWORD */}
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-500" size={16}/>
                            <input 
                                type={showOldPass ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Enter current password"
                                autoComplete="new-password" 
                                className="w-full bg-black border border-gray-800 rounded-lg py-3 pl-10 pr-10 text-white outline-none focus:border-yellow-500 transition-colors"
                            />
                            <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                                {showOldPass ? <Eye size={18}/> : <EyeOff size={18}/>}
                            </button>
                        </div>
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-500" size={16}/>
                            <input 
                                type={showNewPass ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                className="w-full bg-black border border-gray-800 rounded-lg py-3 pl-10 pr-10 text-white outline-none focus:border-yellow-500 transition-colors"
                            />
                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                                {showNewPass ? <Eye size={18}/> : <EyeOff size={18}/>}
                            </button>
                        </div>
                    </div>

                    {/* FORGOT PASSWORD */}
                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                            <span className="flex items-center gap-1 text-red-400 font-bold mb-1"><AlertTriangle size={12}/> Forgot your password?</span>
                            Send a secure reset link to your email.
                        </div>
                        <button 
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={resetSent}
                            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${resetSent ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                        >
                            {resetSent ? "Link Sent!" : "Reset Password"}
                        </button>
                    </div>
                </div>
            </div>

            {/* SAVE BUTTON */}
            <button 
                type="submit" 
                disabled={saving}
                className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-200 flex items-center justify-center gap-2 transition-all mt-4"
            >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>

        </form>
      </div>
    </div>
  );
}