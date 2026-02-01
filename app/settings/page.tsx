'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, User, CreditCard, Building2, Smartphone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [holderName, setHolderName] = useState('');

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch existing profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone_number || '');
        setUpiId(profile.payout_upi_id || '');
        setBankAccount(profile.bank_account_no || '');
        setIfsc(profile.bank_ifsc || '');
        setHolderName(profile.bank_holder_name || '');
      }
      setLoading(false);
    };

    getData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone_number: phone,
      payout_upi_id: upiId,
      bank_account_no: bankAccount,
      bank_ifsc: ifsc,
      bank_holder_name: holderName,
    }).eq('id', user.id);

    setSaving(false);

    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("✅ Settings Saved Successfully!");
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        {/* SECTION 1: PERSONAL DETAILS */}
        <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
            <User size={20} /> Personal Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Email Address (Read Only)</label>
              <div className="flex items-center gap-2 bg-black/50 border border-gray-800 rounded-lg p-3 text-gray-500">
                <Mail size={16} />
                {user?.email}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-3 top-3.5 text-gray-500"/>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-purple-500 outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PAYMENT DETAILS (Crucial!) */}
        <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-400">
            <CreditCard size={20} /> Payout Details
          </h2>
          <p className="text-sm text-gray-500 mb-6 bg-gray-800/50 p-3 rounded-lg">
            This is where we will send your earnings. Please double-check your details.
          </p>
          
          <div className="space-y-4">
            
            {/* UPI ID */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">UPI ID (GooglePay / PhonePe)</label>
              <input 
                type="text" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none placeholder-gray-600"
                placeholder="example@okaxis"
              />
            </div>

            <div className="my-6 border-t border-gray-800 relative">
               <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-neutral-900 px-2 text-xs text-gray-500">OR BANK TRANSFER</span>
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Account Number</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3.5 text-gray-500"/>
                  <input 
                    type="text" 
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-green-500 outline-none"
                    placeholder="XXXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none uppercase"
                  placeholder="SBIN0001234"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Account Holder Name</label>
              <input 
                type="text" 
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                placeholder="Name as per Bank Passbook"
              />
            </div>

          </div>
        </div>

        {/* SAVE BUTTON */}
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
        </button>

      </div>
    </div>
  );
}