'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Building2, CreditCard, User, Banknote, Loader2, Bell, Mail, Sliders, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
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

      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (data) {
        // ✅ BUG FIXED HERE: Changed 'package_id' to 'package_name' to match your database!
        setIsActive(!!data.package_name); 

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
    } else {
        toast.success("Settings Saved Successfully!");
    }
    setSaving(false);
  };

  // PREMIUM TOGGLE COMPONENT
  const ToggleSwitch = ({ checked, onChange, title, description, icon: Icon }: any) => (
      <label className="flex items-center justify-between cursor-pointer p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all group">
          <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${checked ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-500 border border-transparent'}`}>
                  <Icon size={20} />
              </div>
              <div>
                  <p className="text-white font-bold text-sm tracking-wide">{title}</p>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
              </div>
          </div>
          <div className="relative">
              <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-gray-800 border border-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${checked ? 'transform translate-x-6' : ''}`}></div>
          </div>
      </label>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-500" size={40}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl sticky top-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
             <Link href="/dashboard" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
             </Link>
             <span className="font-extrabold text-xl tracking-tight">Account Settings</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8 relative z-10">
        
        {/* IF NOT ACTIVE: SHOW PREMIUM LOCK SCREEN */}
        {!isActive ? (
            <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/[0.02] backdrop-blur-2xl border border-red-500/20 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
                    <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <Lock size={40} className="text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Settings Locked</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                        Activate your NewarPrime package to unlock payout settings and add your bank details for withdrawals.
                    </p>
                    <Link 
                        href="/dashboard" 
                        className="block w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-[1.02]"
                    >
                        Activate Account Now
                    </Link>
                </div>
            </div>
        ) : (
            /* IF ACTIVE: SHOW NORMAL SETTINGS UI */
            <>
                {/* TAB NAVIGATION MENU */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl backdrop-blur-xl w-full sm:w-auto">
                        <button 
                            onClick={() => setActiveTab('payout')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'payout' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Banknote size={16}/> Payout Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('preferences')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'preferences' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Sliders size={16}/> Preferences
                        </button>
                    </div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSave} className="space-y-8">
                        
                        {/* TAB 1: PAYOUT DETAILS */}
                        {activeTab === 'payout' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3 text-white tracking-tight">
                                    <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-xl border border-green-500/30">
                                        <Banknote className="text-green-400" size={28}/> 
                                    </div>
                                    Payout Details
                                </h2>
                                <p className="text-gray-400 mb-10 text-sm ml-1">Enter your details carefully. This is where we will send your earnings.</p>

                                {/* UPI Section */}
                                <div className="space-y-3 mb-8">
                                    <label className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] ml-1">Fast Transfer</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                                        <input 
                                            type="text" 
                                            placeholder="username@okaxis" 
                                            value={formData.payout_upi_id} 
                                            onChange={(e) => setFormData({...formData, payout_upi_id: e.target.value})} 
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:bg-white/[0.05] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-2 opacity-40 mb-8">
                                    <div className="h-[1px] bg-white/20 flex-1"></div>
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">OR Bank Transfer</span>
                                    <div className="h-[1px] bg-white/20 flex-1"></div>
                                </div>

                                {/* Bank Section */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Account Holder Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20}/>
                                            <input type="text" placeholder="Name as per Bank Passbook" value={formData.bank_holder_name} onChange={(e) => setFormData({...formData, bank_holder_name: e.target.value})} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-white/[0.05] outline-none transition-all"/>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Account Number</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20}/>
                                                <input type="text" placeholder="e.g. 123456789012" value={formData.bank_account_no} onChange={(e) => setFormData({...formData, bank_account_no: e.target.value})} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-white/[0.05] outline-none transition-all"/>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">IFSC Code</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20}/>
                                                <input type="text" placeholder="e.g. SBIN0001234" value={formData.ifsc_code} onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-white/[0.05] outline-none transition-all uppercase"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: PREFERENCES */}
                        {activeTab === 'preferences' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3 text-white tracking-tight">
                                    <div className="p-3 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-xl border border-purple-500/30">
                                        <Bell className="text-purple-400" size={28}/> 
                                    </div>
                                    Notifications
                                </h2>
                                <p className="text-gray-400 mb-10 text-sm ml-1">Control how NewarPrime communicates with you.</p>

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

                                    <div className="h-[1px] bg-white/5 my-6"></div>

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
                            className={`w-full py-4 rounded-2xl font-bold shadow-2xl transition-all flex items-center justify-center gap-3 mt-10 overflow-hidden relative group ${
                                saving 
                                ? 'bg-neutral-800 text-gray-400 cursor-not-allowed border border-white/5' 
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(147,51,234,0.3)]'
                            }`}
                        >
                            {saving ? (
                                <><Loader2 className="animate-spin" size={20}/> Encrypting & Saving...</>
                            ) : (
                                <><Save size={20} className="group-hover:rotate-12 transition-transform"/> Save Configurations</>
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