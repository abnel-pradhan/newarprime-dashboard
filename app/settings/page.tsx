'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Building2, CreditCard, User, Banknote, Loader2, Check, Bell, Mail, ShieldAlert, Sliders, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ✅ New State to check if user has bought a package
  const [isActive, setIsActive] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'payout' | 'preferences'>('payout');

  const [formData, setFormData] = useState({
    full_name: '',
    payout_upi_id: '',
    bank_account_no: '',
    ifsc_code: '',
    bank_holder_name: ''
  });

  const [preferences, setPreferences] = useState({
    alert_new_referral: true,
    alert_withdrawal: true,
    alert_marketing: false
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
        // ✅ Set the active state from the database
        // If package_id exists, they are active. If it's null, they are inactive!
        setIsActive(data.package_id ? true : false);

        setFormData({
            full_name: data.full_name || '',
            payout_upi_id: data.payout_upi_id || '',
            bank_account_no: data.bank_account_no || '',
            ifsc_code: data.ifsc_code || '',
            bank_holder_name: data.bank_holder_name || ''
        });
        
        setPreferences({
            alert_new_referral: data.alert_new_referral ?? true,
            alert_withdrawal: data.alert_withdrawal ?? true,
            alert_marketing: data.alert_marketing ?? false,
        });
      }
      setLoading(false);
    };
    getData();
  }, [router]);

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
            bank_holder_name: formData.bank_holder_name,
            alert_new_referral: preferences.alert_new_referral,
            alert_withdrawal: preferences.alert_withdrawal,
            alert_marketing: preferences.alert_marketing,
        })
        .eq('id', user.id);

    if (error) {
        toast.error("Error saving: " + error.message);
        setSaving(false);
    } else {
        toast.success("Settings Saved!");
        setSaving(false);
    }
  };

  // CUSTOM TOGGLE COMPONENT
  const ToggleSwitch = ({ checked, onChange, title, description, icon: Icon }: any) => (
      <label className="flex items-center justify-between cursor-pointer p-5 bg-black/40 border border-white/5 rounded-2xl hover:bg-black/60 hover:border-white/10 transition-all group">
          <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg transition-colors ${checked ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-500'}`}>
                  <Icon size={20} />
              </div>
              <div>
                  <p className="text-white font-bold text-sm tracking-wide">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
          </div>
          <div className="relative">
              <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-purple-600' : 'bg-gray-800 border border-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${checked ? 'transform translate-x-6 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}></div>
          </div>
      </label>
  );

  if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* NAVBAR */}
      <nav className="relative z-50 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl sticky top-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
             <Link href="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5">
                <ArrowLeft size={20} />
             </Link>
             <span className="font-bold text-xl tracking-tight">Account Settings</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8 relative z-10">
        
        {/* ✅ IF NOT ACTIVE: SHOW LOCK SCREEN */}
        {!isActive ? (
            <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-[#1a0505] border border-red-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Lock size={36} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Settings Locked</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                        You must activate a package to unlock your payout settings and add your bank details for withdrawals.
                    </p>
                    <Link 
                        href="/dashboard" 
                        className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                    >
                        Activate Account Now
                    </Link>
                </div>
            </div>
        ) : (
            /* ✅ IF ACTIVE: SHOW NORMAL SETTINGS UI */
            <>
                {/* TAB NAVIGATION MENU */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex bg-black/40 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl w-full sm:w-auto">
                        <button 
                            onClick={() => setActiveTab('payout')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'payout' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Banknote size={16}/> Payout Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('preferences')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'preferences' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Sliders size={16}/> Preferences
                        </button>
                    </div>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                    <form onSubmit={handleSave} className="space-y-8">
                        
                        {/* TAB 1: PAYOUT DETAILS */}
                        {activeTab === 'payout' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-white tracking-tight">
                                    <div className="p-2 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-lg border border-green-500/20">
                                        <Banknote className="text-green-400" size={24}/> 
                                    </div>
                                    Payout Details
                                </h2>
                                <p className="text-gray-400 mb-8 text-sm ml-1">Enter your bank details carefully. This is where we will send your earnings.</p>

                                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden mb-6">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">UPI ID (GooglePay / PhonePe)</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                                        <input type="text" placeholder="username@okaxis" value={formData.payout_upi_id} onChange={(e) => setFormData({...formData, payout_upi_id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"/>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-2 opacity-50 mb-6">
                                    <div className="h-[1px] bg-white/10 flex-1"></div>
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">OR Bank Transfer</span>
                                    <div className="h-[1px] bg-white/10 flex-1"></div>
                                </div>

                                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Account Holder Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20}/>
                                            <input type="text" placeholder="Name as per Bank Passbook" value={formData.bank_holder_name} onChange={(e) => setFormData({...formData, bank_holder_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-all"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Bank Account Number</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20}/>
                                            <input type="text" placeholder="e.g. 123456789012" value={formData.bank_account_no} onChange={(e) => setFormData({...formData, bank_account_no: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-all"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">IFSC Code</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20}/>
                                            <input type="text" placeholder="e.g. SBIN0001234" value={formData.ifsc_code} onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-all uppercase"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PREFERENCES */}
                        {activeTab === 'preferences' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-white tracking-tight">
                                    <div className="p-2 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-lg border border-purple-500/20">
                                        <Bell className="text-purple-400" size={24}/> 
                                    </div>
                                    Notifications
                                </h2>
                                <p className="text-gray-400 mb-8 text-sm ml-1">Control how NewarPrime communicates with you.</p>

                                <div className="space-y-4">
                                    <ToggleSwitch 
                                        title="New Referral Alerts" 
                                        description="Get notified instantly when someone joins using your link."
                                        icon={User}
                                        checked={preferences.alert_new_referral} 
                                        onChange={(e: any) => setPreferences({...preferences, alert_new_referral: e.target.checked})} 
                                    />
                                    
                                    <ToggleSwitch 
                                        title="Withdrawal Updates" 
                                        description="Receive an email when your payout is processed and sent."
                                        icon={Banknote}
                                        checked={preferences.alert_withdrawal} 
                                        onChange={(e: any) => setPreferences({...preferences, alert_withdrawal: e.target.checked})} 
                                    />

                                    <div className="h-[1px] bg-white/10 my-6"></div>

                                    <ToggleSwitch 
                                        title="Marketing & Offers" 
                                        description="Receive tips, tricks, and promotional offers from our team."
                                        icon={Mail}
                                        checked={preferences.alert_marketing} 
                                        onChange={(e: any) => setPreferences({...preferences, alert_marketing: e.target.checked})} 
                                    />
                                </div>
                            </div>
                        )}

                        {/* GLOBAL SAVE BUTTON */}
                        <button 
                            type="submit" 
                            disabled={saving}
                            className={`w-full py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(147,51,234,0.2)] transition-all flex items-center justify-center gap-2 mt-8 ${
                                saving 
                                ? 'bg-green-600 text-white cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]'
                            }`}
                        >
                            {saving ? (
                                <><Loader2 className="animate-spin" size={20}/> Saving...</>
                            ) : (
                                <><Save size={20}/> Save All Settings</>
                            )}
                        </button>
                    </form>
                </div>
            </>
        )}
      </main>
    </div>
  );
}