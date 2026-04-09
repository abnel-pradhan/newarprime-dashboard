'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  User, Camera, Save, ArrowLeft, Loader2, Copy, 
  ShieldCheck, Fingerprint, Share2, FileText, Check, Lock, Crown, Zap 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

// ✅ Tell TypeScript that Razorpay exists on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

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

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Select an image.');

      const originalFile = event.target.files[0];

      if (originalFile.size > 10 * 1024 * 1024) {
          throw new Error('File is too massive (over 10MB). Please choose a smaller photo.');
      }

      toast.loading("Optimizing image...", { id: "compressToast" });

      const options = {
        maxSizeMB: 0.15,          
        maxWidthOrHeight: 800,    
        useWebWorker: true        
      };

      const compressedFile = await imageCompression(originalFile, options);
      toast.dismiss("compressToast"); 

      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      toast.loading("Uploading securely...", { id: "uploadToast" });

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, compressedFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

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
    
    const { error } = await supabase
        .from('profiles')
        .update({ 
            full_name: fullName,
            bio: bio 
        }) 
        .eq('id', user.id);

    if (error) {
        toast.error(error.message);
        setSaving(false);
    } else {
        toast.success("Saved! Redirecting...");
        setTimeout(() => {
            router.push('/dashboard');
        }, 1500);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      toast.success(`${label} Copied!`);
  };

  // ✅ UPGRADE TO PRO LOGIC (RAZORPAY)
  const handleUpgradeToPro = async () => {
    if (!user) return toast.error("Please login to purchase.");

    const loadRazorpayScript = () => new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    const res = await loadRazorpayScript();
    if (!res) return toast.error("Razorpay SDK failed to load.");

    const price = 499;
    const pkgName = 'NewarPrime Pro';

    toast.loading("Initiating upgrade...", { id: 'upgrade' });

    const orderData = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: price }),
    });
    const order = await orderData.json();

    toast.dismiss('upgrade');

    if (order.error) return toast.error(order.error);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      amount: order.amount,
      currency: order.currency,
      name: "NewarPrime",
      description: `Upgrade to ${pkgName}`,
      image: "https://newarprime.in/logo.png", 
      order_id: order.id,
      handler: async function (response: any) {
        toast.loading("Verifying payment...", { id: 'verify' });
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            user_id: user.id,
            amount: price,
            package_name: pkgName
          }),
        });

        const verifyData = await verifyRes.json();
        toast.dismiss('verify');
        if (verifyData.success) {
           toast.success("✨ Upgrade Successful! Welcome to Pro.");
           setTimeout(() => window.location.reload(), 2000);
        } else {
           toast.error(verifyData.error || "Verification Failed");
        }
      },
      theme: { color: "#eab308" }, // Gold theme for Pro
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={32}/></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden pb-20">
      
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
                <img 
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${fullName}&background=0d0d0d&color=fff&size=128`} 
                    alt="Profile"
                    className="relative w-full h-full rounded-full border-4 border-[#050505] object-cover"
                />
                
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
                {/* Standard Active Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-wider ${profile?.is_active ? 'bg-purple-900/30 border-purple-500/30 text-purple-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                    {profile?.is_active ? <><ShieldCheck size={14}/> Active Member</> : <><Lock size={14}/> Inactive Account</>}
                </div>

                {/* THE GOLDEN PRO BADGE */}
                {profile?.is_active && profile?.package_name?.includes('Pro') && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-500/50 rounded-full text-xs font-extrabold uppercase tracking-wider text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                        <Crown size={14} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" fill="currentColor" /> Pro
                    </div>
                )}

                {/* THE BLUE STARTER BADGE */}
                {profile?.is_active && !profile?.package_name?.includes('Pro') && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/50 rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Zap size={14} className="text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" fill="currentColor" /> Starter
                    </div>
                )}
            </div>

            {/* ✅ GLOWING UPGRADE BUTTON (Only shows if they are Starter) */}
            {profile?.is_active && !profile?.package_name?.includes('Pro') && (
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3">Unlock Premium Earnings</p>
                    <button 
                        onClick={handleUpgradeToPro}
                        className="relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl hover:from-yellow-500 hover:to-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.4)] hover:shadow-[0_0_50px_rgba(217,119,6,0.6)] group overflow-hidden"
                    >
                        {/* Shimmer Effect */}
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
                        saving 
                        ? 'bg-green-600 text-white'  
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
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