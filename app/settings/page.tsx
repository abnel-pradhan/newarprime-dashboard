'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Building2, CreditCard, User, Banknote, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // ✅ IMPORT TOAST
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    payout_upi_id: '',
    bank_account_no: '',
    ifsc_code: '',
    bank_holder_name: ''
  });
  
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({
            full_name: data.full_name || '',
            payout_upi_id: data.payout_upi_id || '',
            bank_account_no: data.bank_account_no || '',
            ifsc_code: data.ifsc_code || '',
            bank_holder_name: data.bank_holder_name || ''
        });
      }
      setLoading(false);
    };
    getData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('profiles')
        .update({
            payout_upi_id: formData.payout_upi_id,
            bank_account_no: formData.bank_account_no,
            ifsc_code: formData.ifsc_code,
            bank_holder_name: formData.bank_holder_name
        })
        .eq('id', user.id);

    if (error) {
        toast.error("Error saving: " + error.message); // ✅ Smart Error Popup
        setSaving(false);
    } else {
        toast.success("Bank Details Saved! Redirecting..."); // ✅ Smart Success Popup
        
        // ✅ AUTO REDIRECT LOGIC
        setTimeout(() => {
            router.push('/dashboard');
        }, 1500);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
      
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
             <Link href="/dashboard" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
                <ArrowLeft size={20} />
             </Link>
             <span className="font-bold text-xl">Payment Settings</span>
        </div>
      </nav>

      {/* FORM CONTENT */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        
        <div className="bg-neutral-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                <Banknote className="text-green-500"/> Payout Details
            </h2>
            <p className="text-gray-400 mb-8 text-sm">
                Enter your bank details carefully. This is where we will send your earnings.
            </p>

            <form onSubmit={handleSave} className="space-y-6">
                
                {/* 1. UPI ID Section */}
                <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl">
                    <label className="block text-sm font-bold text-gray-300 mb-2">UPI ID (GooglePay / PhonePe)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="username@okaxis" 
                            value={formData.payout_upi_id}
                            onChange={(e) => setFormData({...formData, payout_upi_id: e.target.value})}
                            className="w-full bg-neutral-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all"
                        />
                        <CreditCard className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Recommended for faster payments.</p>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-[1px] bg-gray-800 flex-1"></div>
                    <span className="text-gray-500 text-xs font-bold uppercase">OR Bank Transfer</span>
                    <div className="h-[1px] bg-gray-800 flex-1"></div>
                </div>

                {/* 2. Bank Details Section */}
                <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-4">
                    
                    {/* Account Holder Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Account Holder Name</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Name as per Bank Passbook" 
                                value={formData.bank_holder_name}
                                onChange={(e) => setFormData({...formData, bank_holder_name: e.target.value})}
                                className="w-full bg-neutral-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all"
                            />
                            <User className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                        </div>
                    </div>

                    {/* Account Number */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Bank Account Number</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="e.g. 123456789012" 
                                value={formData.bank_account_no}
                                onChange={(e) => setFormData({...formData, bank_account_no: e.target.value})}
                                className="w-full bg-neutral-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all"
                            />
                            <Building2 className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                        </div>
                    </div>

                    {/* IFSC Code */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">IFSC Code</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="e.g. SBIN0001234" 
                                value={formData.ifsc_code}
                                onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})}
                                className="w-full bg-neutral-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all uppercase"
                            />
                            <Building2 className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                        </div>
                    </div>

                </div>

                {/* Save Button */}
                <button 
                    type="submit" 
                    disabled={saving}
                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                        saving ? 'bg-green-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                    }`}
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
                    {saving ? 'Saving...' : 'Save Details'}
                </button>

            </form>
        </div>
      </main>
    </div>
  );
}