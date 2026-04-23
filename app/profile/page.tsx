'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  User, Camera, Save, ArrowLeft, Loader2, Copy, 
  ShieldCheck, Fingerprint, Share2, FileText, Check, Lock, Crown, Zap,
  X, CheckCircle2, Upload, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import QRCode from 'react-qr-code';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Form Fields
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState(''); 
  const [avatarUrl, setAvatarUrl] = useState('');

  // Payment Modal States
  const [paymentModal, setPaymentModal] = useState({ show: false, pkgName: '', price: 0 });
  const [utrInput, setUtrInput] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setBio(data.bio || ''); 
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);
    };
    getData();
  }, [router]);

  const getInitials = (name: string) => {
      if (!name) return 'U';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Select an image.');

      const originalFile = event.target.files[0];
      if (originalFile.size > 10 * 1024 * 1024) throw new Error('File is too massive (over 10MB). Please choose a smaller photo.');

      toast.loading("Optimizing image...", { id: "compressToast" });

      const options = { maxSizeMB: 0.15, maxWidthOrHeight: 800, useWebWorker: true };
      const compressedFile = await imageCompression(originalFile, options);
      toast.dismiss("compressToast"); 

      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      toast.loading("Uploading securely...", { id: "uploadToast" });

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.dismiss("uploadToast");
      toast.success("Profile Photo Updated!");

    } catch (error: any) {
      toast.dismiss("compressToast");
      toast.dismiss("uploadToast");
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- SAVE PROFILE DETAILS ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('profiles').update({ full_name: fullName, bio: bio }).eq('id', user.id);

    if (error) {
        toast.error(error.message);
        setSaving(false);
    } else {
        toast.success("Saved! Redirecting...");
        setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      toast.success(`${label} Copied!`);
  };

  // --- UPGRADE LOGIC ---
  const handleUpgradeToPro = () => {
      setPaymentModal({ show: true, pkgName: 'Pro Package Upgrade', price: 499 });
  };

  const submitPaymentRequest = async () => {
      if (utrInput.length !== 12) return toast.error("Please enter a valid 12-digit UTR number.");
      setIsSubmittingUtr(true);
      
      try {
          let receiptUrl = profile?.payment_screenshot || null; 

          if (receiptFile) {
              const fileExt = receiptFile.name.split('.').pop() || 'jpg';
              const fileName = `${user.id}-upgrade-${Math.random()}.${fileExt}`;
              
              const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile);
              if (uploadError) throw uploadError;
              
              const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
              receiptUrl = data.publicUrl;
          }

          // 🌟 THE FIX: Set package to Pro but force payment_status to pending!
          const { error } = await supabase.from('profiles').update({
              package_name: 'Pro Package',
              payment_status: 'pending',
              utr_number: utrInput,
              payment_screenshot: receiptUrl
          }).eq('id', user.id);

          if (error) throw error;

          toast.success("Upgrade Request Submitted! Admin will verify shortly.");
          setPaymentModal({ show: false, pkgName: '', price: 0 });
          
          setTimeout(() => window.location.reload(), 1500);

      } catch (error: any) {
          toast.error(error.message);
      } finally {
          setIsSubmittingUtr(false);
      }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden pb-20">
      
      {/* 🌟 THE HYBRID PREMIUM PAYMENT MODAL */}
      {paymentModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setPaymentModal({ show: false, pkgName: '', price: 0 })}></div>
          
          <div className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(147,51,234,0.15)] flex flex-col md:flex-row overflow-hidden animate-scale-up max-h-[95vh] md:max-h-[85vh] overflow-y-auto md:overflow-y-hidden">
              
              <button onClick={() => setPaymentModal({ show: false, pkgName: '', price: 0 })} className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white bg-black/50 hover:bg-black p-2 rounded-full backdrop-blur-md transition-all border border-white/10">
                  <X size={20}/>
              </button>

              {/* LEFT PANE: Digital Invoice & QR/Button */}
              <div className="flex-1 bg-gradient-to-br from-purple-900/20 via-[#0a0a0a] to-blue-900/20 p-6 md:p-10 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/5">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50"></div>
                  <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]"></div>

                  <div className="text-center mb-6 relative z-10">
                      <span className="text-purple-400 font-bold tracking-widest text-xs uppercase mb-2 block">Secure Checkout</span>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{paymentModal.pkgName}</h3>
                      <div className="inline-block mt-2 px-5 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 text-sm font-medium shadow-inner">
                          Pay exactly: <span className="text-white font-black tracking-wider text-lg">₹{paymentModal.price}</span>
                      </div>
                  </div>

                  {/* 💻 & 📱 EVERYWHERE: QR Code Pedestal */}
                  <div className="relative group z-10 mb-6">
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-300"></div>
                      <div className="relative bg-white p-4 md:p-5 rounded-3xl shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                          <QRCode 
                              value={`upi://pay?pa=abnelpradhan7@okaxis&pn=NewarPrime&am=${paymentModal.price}&cu=INR`} 
                              size={160}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              viewBox={`0 0 256 256`}
                          />
                      </div>
                  </div>

                  {/* 📱 MOBILE ONLY: Direct Pay Button */}
                  <div className="w-full max-w-xs z-10 mb-6 block md:hidden">
                      <a 
                          href={`upi://pay?pa=abnelpradhan7@okaxis&pn=NewarPrime&am=${paymentModal.price}&cu=INR`}
                          className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-extrabold text-sm text-center shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-transform flex justify-center items-center gap-2 border border-green-400/50"
                      >
                          <Zap size={18} className="text-yellow-300 fill-yellow-300" /> Pay with PhonePe / GPay
                      </a>
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-[10px] text-red-400 text-center leading-tight font-medium">
                              ⚠️ <strong>CRITICAL:</strong> After paying, you MUST return to this screen and enter your 12-Digit UTR below.
                          </p>
                      </div>
                  </div>

                  {/* 💻 & 📱 EVERYWHERE: Official UPI Text Box */}
                  <div className="bg-black/60 border border-white/10 px-6 py-4 rounded-2xl text-center w-full max-w-xs backdrop-blur-md z-10 shadow-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Official UPI ID</p>
                      <p className="font-mono text-purple-400 font-bold tracking-wider select-all text-sm">abnelpradhan7@okaxis</p>
                  </div>
              </div>

              {/* RIGHT PANE: Action / Inputs */}
              <div className="flex-[1.2] bg-[#050505] p-8 md:p-12 flex flex-col justify-center relative">
                  <div className="mb-8">
                      <h4 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2">
                          <CheckCircle2 className="text-green-500" size={24}/> Verify Payment
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed">After scanning the QR, enter your transaction details below to upgrade your account instantly.</p>
                  </div>

                  <div className="space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">12-Digit UTR / Ref No. <span className="text-red-500">*</span></label>
                          <div className="relative group">
                              <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20}/>
                              <input 
                                  type="text" 
                                  maxLength={12} 
                                  placeholder="e.g. 312345678901" 
                                  value={utrInput} 
                                  onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ''))} 
                                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-mono text-lg focus:border-purple-500 focus:bg-white/[0.02] shadow-inner outline-none transition-all placeholder:text-gray-700 placeholder:font-sans" 
                              />
                          </div>
                      </div>
                      
                      <div>
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Screenshot <span className="text-gray-600 font-normal normal-case tracking-normal">(Recommended)</span></label>
                           <label className={`relative block w-full rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer overflow-hidden group ${receiptFile ? 'bg-green-500/10 border-2 border-green-500/50 hover:border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/[0.05]'}`}>
                               <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) setReceiptFile(e.target.files[0]);
                                  }} 
                               />
                               {receiptFile ? (
                                   <div className="flex flex-col items-center justify-center animate-fade-in">
                                       <div className="p-3 bg-green-500/20 rounded-full mb-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                           <CheckCircle2 className="text-green-400" size={28}/>
                                       </div>
                                       <span className="text-sm text-green-400 font-bold truncate max-w-[200px]">{receiptFile.name}</span>
                                       <span className="text-xs text-green-600/70 mt-1 font-medium tracking-wide uppercase">Click to replace</span>
                                   </div>
                               ) : (
                                   <div className="flex flex-col items-center justify-center">
                                       <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                                           <Upload className="text-gray-400 group-hover:text-purple-400" size={24}/>
                                       </div>
                                       <span className="text-sm font-bold text-gray-300">Upload Receipt</span>
                                       <span className="text-xs text-gray-600 mt-1">JPG, PNG (Max 5MB)</span>
                                   </div>
                               )}
                           </label>
                      </div>

                      <button 
                          onClick={submitPaymentRequest} 
                          disabled={isSubmittingUtr || utrInput.length !== 12} 
                          className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold tracking-wide rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                      >
                          {isSubmittingUtr ? (
                              <><Loader2 className="animate-spin" size={22}/> Verifying Details...</>
                          ) : (
                              <>Submit Payment</>
                          )}
                      </button>
                      
                      <div className="flex items-center justify-center gap-4 mt-6 opacity-60">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              <Lock size={12} /> 256-Bit Encrypted
                          </div>
                          <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              <ShieldAlert size={12} /> Verified by Admin
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      )}

      {/* BACKGROUND GLOWS */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-900/20 to-[#050505] z-0"></div>
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* NAVBAR */}
      <nav className="relative z-10 px-6 py-4 flex items-center gap-4">
           <Link href="/dashboard" className="p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <span className="font-bold text-xl">My Profile</span>
      </nav>

      <main className="max-w-md mx-auto px-4 relative z-10 mt-4 space-y-6">
        
        {/* 1. MAIN PROFILE CARD */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/5 to-transparent"></div>

            <div className="relative w-28 h-28 mx-auto mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                
                {avatarUrl ? (
                    <img 
                        src={avatarUrl} 
                        alt="Profile"
                        onError={() => setAvatarUrl('')}
                        className="relative w-full h-full rounded-full border-4 border-[#050505] object-cover bg-neutral-900"
                    />
                ) : (
                    <div className="relative w-full h-full rounded-full border-4 border-[#050505] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-extrabold text-white tracking-widest shadow-inner select-none">
                        {getInitials(fullName)}
                    </div>
                )}
                
                <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-4 border-[#050505] text-white hover:scale-110 transition-transform disabled:opacity-50"
                >
                    {uploading ? <Loader2 size={16} className="animate-spin"/> : <Camera size={16}/>}
                </button>
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                {fullName}
            </h2>
            <p className="text-gray-400 text-sm mb-5 px-4 italic">"{bio || 'No bio set yet'}"</p>

            <div className="flex justify-center flex-wrap gap-2">
                <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-wider ${profile?.is_active ? 'bg-purple-900/30 border-purple-500/30 text-purple-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                    {profile?.is_active ? <><ShieldCheck size={14}/> Active Member</> : <><Lock size={14}/> Inactive Account</>}
                </div>

                {profile?.is_active && profile?.package_name?.includes('Pro') && profile?.payment_status === 'approved' && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-500/50 rounded-full text-xs font-extrabold uppercase tracking-wider text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                        <Crown size={14} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" fill="currentColor" /> Pro
                    </div>
                )}

                {profile?.package_name?.includes('Pro') && profile?.payment_status === 'pending' && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/50 rounded-full text-xs font-extrabold uppercase tracking-wider text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <Loader2 size={14} className="animate-spin text-orange-400" /> Upgrade Pending
                    </div>
                )}

                {profile?.is_active && (!profile?.package_name?.includes('Pro') || profile?.payment_status !== 'approved') && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/50 rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Zap size={14} className="text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" fill="currentColor" /> Starter
                    </div>
                )}
            </div>

            {profile?.is_active && (!profile?.package_name?.includes('Pro') || profile?.payment_status === 'rejected') && (
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3">Unlock Premium Earnings</p>
                    <button 
                        onClick={handleUpgradeToPro}
                        className="relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl hover:from-yellow-500 hover:to-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.4)] hover:shadow-[0_0_50px_rgba(217,119,6,0.6)] group overflow-hidden"
                    >
                        <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-20 rotate-12 group-hover:-translate-x-[400px] ease"></span>
                        <Crown size={20} className="mr-2 text-yellow-100 animate-bounce" />
                        <span className="drop-shadow-md">Upgrade to Pro — ₹499</span>
                    </button>
                    <p className="text-[10px] text-gray-500 mt-3">Get ₹300 per referral + Exclusive Course Access</p>
                </div>
            )}
        </div>

        {/* 2. AFFILIATE ASSETS */}
        {profile?.is_active ? (
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-xl">
                <h3 className="text-purple-400 font-bold mb-6 flex items-center gap-2">
                    <Share2 size={18}/> Affiliate Assets
                </h3>

                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Fingerprint size={12}/> My Unique ID
                    </label>
                    <div onClick={() => copyToClipboard(profile?.referral_code, 'ID')} className="bg-black/40 border border-white/5 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-purple-500/50 transition-colors group">
                        <span className="font-mono text-lg font-bold tracking-widest text-gray-300 group-hover:text-white"># {profile?.referral_code}</span>
                        <Copy size={18} className="text-gray-600 group-hover:text-purple-500"/>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Share2 size={12}/> My Referral Link
                    </label>
                    <div onClick={() => copyToClipboard(`${window.location.origin}/register?ref=${profile?.referral_code}`, 'Link')} className="bg-black/40 border border-white/5 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-purple-500/50 transition-colors group">
                        <span className="font-mono text-xs text-gray-400 truncate mr-4">{typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${profile?.referral_code}` : 'Loading...'}</span>
                        <div className="bg-white/10 p-2 rounded-lg group-hover:bg-purple-600 transition-colors"><Copy size={16} className="text-white"/></div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-red-900/10 backdrop-blur-2xl border border-red-500/20 rounded-[2rem] p-8 text-center shadow-xl relative overflow-hidden">
                 <Lock className="mx-auto text-red-500/50 mb-4" size={40} />
                 <h3 className="text-red-400 font-bold text-lg mb-2">Affiliate Tools Locked</h3>
                 <p className="text-gray-400 text-sm mb-6">You must activate a package to unlock your unique referral ID and start earning commissions.</p>
                 <Link href="/dashboard" className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-red-900/20">
                     Activate Account Now
                 </Link>
            </div>
        )}

        {/* 3. EDIT DETAILS FORM */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-xl">
             <h3 className="text-gray-400 font-bold mb-4 text-sm uppercase">Edit Details</h3>
             
             <form onSubmit={handleSave} className="space-y-4">
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all" placeholder="Full Name"/>
                </div>

                <div className="relative group">
                    <FileText className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20}/>
                    <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all" placeholder="Your Tagline (e.g. Digital Entrepreneur)"/>
                </div>

                <button 
                    type="submit" 
                    disabled={saving} 
                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg mt-2 ${
                        saving ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                    }`}
                >
                    {saving ? <><Check size={18}/> Saved!</> : <><Save size={18}/> Save Changes</>}
                </button>
            </form>
        </div>

      </main>
    </div>
  );
}