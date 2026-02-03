'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Settings, Wallet, TrendingUp, Users, CreditCard, 
  PlayCircle, Zap, CheckCircle, Clock, Copy, Home, ShieldAlert, 
  Trophy, Menu, X, User, Bell, Gift, AlertCircle, CheckCircle2, Info, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Dashboard() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState(''); 
  const [hasPendingRequest, setHasPendingRequest] = useState(false); 
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);

  // Referral State
  const [referrals, setReferrals] = useState<any[]>([]);

  // UI States (Popups & Menus)
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 🌟 Unified Menu State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Notification System
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ show: false, amount: 0, fee: 0, final: 0 });

  const router = useRouter();

  // --- DATA FETCHING (CRASH PROOF) ---
  useEffect(() => {
    let isMounted = true; 

    const getData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        // 1. Get Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (isMounted) setProfile(profileData);

        // 2. Check Pending Withdrawal
        const { data: pendingReq } = await supabase.from('withdrawals').select('id').eq('user_id', user.id).eq('status', 'pending').maybeSingle();
        if (isMounted && pendingReq) setHasPendingRequest(true);

        // 3. Fetch Referrals
        const { data: myRefs } = await supabase
          .from('profiles')
          .select('*')
          .eq('referred_by', user.id)
          .order('created_at', { ascending: false });
          
        if (isMounted) setReferrals(myRefs || []);

        // 4. Calculate Lifetime Earnings
        const { data: paidWithdrawals } = await supabase.from('withdrawals').select('amount').eq('user_id', user.id).eq('status', 'paid');
        const totalWithdrawn = paidWithdrawals?.reduce((sum, item) => sum + item.amount, 0) || 0;
        
        if (isMounted) {
            setLifetimeEarnings((profileData?.wallet_balance || 0) + totalWithdrawn);
            setLoading(false);
        }

        // 5. Trigger Welcome Popup
        const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
        if (!hasSeenPopup && isMounted) {
          setTimeout(() => {
              if (isMounted) setShowWelcomePopup(true);
          }, 1500);
        }

      } catch (err) {
        console.error("Dashboard Loading Error:", err);
        if (isMounted) setLoading(false);
      }
    };

    getData();

    return () => { isMounted = false; };
  }, []);

  // --- HELPER FUNCTIONS ---
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setNotification({ show: true, title, message, type });
      if (type === 'success') {
          setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
      }
  };

  const closeToast = () => setNotification(prev => ({ ...prev, show: false }));

  const closeWelcomePopup = () => {
      setShowWelcomePopup(false);
      sessionStorage.setItem('hasSeenPopup', 'true');
  };

  const getCommission = (pkg: string) => {
    if (!pkg) return 0;
    if (pkg.includes('Pro')) return 300; 
    return 120; 
  };

  // --- ACTIONS ---
  const copyLink = () => {
    const code = profile?.referral_code || user?.id;
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    showToast("Link Copied!", "Your affiliate link is now in your clipboard.", "success");
  };

  const handleWithdrawClick = () => {
    const amount = parseFloat(withdrawAmount);
    const balance = profile?.wallet_balance || 0;
    
    if (!amount || isNaN(amount)) return showToast("Invalid Amount", "Please enter a valid amount.", "error");
    if (amount < 500) return showToast("Minimum Limit", "Minimum withdrawal is ₹500.", "error");
    if (amount > balance) return showToast("Insufficient Funds", "You do not have enough wallet balance.", "error");
    if (!profile?.payout_upi_id) {
        showToast("Missing Details", "Please add your UPI ID in Settings first.", "error");
        setTimeout(() => router.push('/settings'), 2000);
        return;
    }

    const fee = Math.floor(amount * 0.03); 
    const finalPayout = amount - fee;
    setConfirmModal({ show: true, amount, fee, final: finalPayout });
  };

  const confirmWithdrawal = async () => {
      setConfirmModal(prev => ({ ...prev, show: false }));
      
      const { error } = await supabase.from('withdrawals').insert([{
        user_id: profile.id,
        amount: confirmModal.amount,
        payout_upi: profile.payout_upi_id
      }]);

      if (error) {
          showToast("Error", error.message, "error");
      } else {
          showToast("Request Sent", "Your withdrawal request has been submitted successfully!", "success");
          setHasPendingRequest(true);
          setWithdrawAmount('');
      }
  };

  // --- PAYMENT ---
  const handleRazorpayPayment = async (pkgName: string, price: number) => {
    if (!user) return showToast("Login Required", "Please login to purchase.", "error");

    const loadRazorpayScript = () => new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    const res = await loadRazorpayScript();
    if (!res) return showToast("Error", "Razorpay SDK failed to load.", "error");

    const orderData = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: price }),
    });
    const order = await orderData.json();

    if (order.error) return showToast("Server Error", order.error, "error");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      amount: order.amount,
      currency: order.currency,
      name: "NewarPrime",
      description: `Purchase ${pkgName}`,
      order_id: order.id,
      handler: async function (response: any) {
        showToast("Verifying...", "Payment successful, verifying status...", "info");
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
        if (verifyData.success) {
           showToast("Success!", "Account Activated. Welcome to the team!", "success");
           setTimeout(() => window.location.reload(), 2000);
        } else {
           showToast("Verification Failed", verifyData.error, "error");
        }
      },
      theme: { color: "#9333ea" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      
      {/* 🌟 1. WELCOME POPUP */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={closeWelcomePopup}></div>
            <div className="bg-neutral-900 border border-purple-500/50 p-6 rounded-3xl max-w-sm w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-scale-up">
                <button onClick={closeWelcomePopup} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <div className="flex justify-center mb-6"><div className="p-4 bg-purple-600/20 rounded-full text-purple-400 border border-purple-500/20 animate-bounce"><Gift size={32} /></div></div>
                <h3 className="text-2xl font-bold text-center mb-2 text-white">Welcome to <span className="text-purple-500">NewarPrime</span></h3>
                <p className="text-gray-400 text-center text-sm mb-8">🚀 <strong>Special Offer:</strong> Refer 5 friends this week and get a <strong>₹500 Bonus</strong>!</p>
                <button onClick={closeWelcomePopup} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg">Start Earning</button>
            </div>
        </div>
      )}

      {/* 🌟 2. NOTIFICATION POPUP */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-[110] animate-slide-in-right">
            <div className={`flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm ${
                notification.type === 'error' ? 'bg-red-900/40 border-red-500/50' : 
                notification.type === 'success' ? 'bg-green-900/40 border-green-500/50' : 
                'bg-neutral-800/80 border-gray-700'
            }`}>
                <div className={`p-2 rounded-full ${
                    notification.type === 'error' ? 'bg-red-500/20 text-red-400' : 
                    notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 
                    'bg-blue-500/20 text-blue-400'
                }`}>
                    {notification.type === 'error' ? <AlertCircle size={20}/> : 
                     notification.type === 'success' ? <CheckCircle2 size={20}/> : <Info size={20}/>}
                </div>
                <div>
                    <h4 className={`font-bold ${
                         notification.type === 'error' ? 'text-red-400' : 
                         notification.type === 'success' ? 'text-green-400' : 'text-white'
                    }`}>{notification.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                </div>
                <button onClick={closeToast} className="text-gray-400 hover:text-white"><X size={16}/></button>
            </div>
        </div>
      )}

      {/* 🌟 3. WITHDRAWAL CONFIRMATION MODAL */}
      {confirmModal.show && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmModal(prev => ({...prev, show: false}))}></div>
            <div className="bg-neutral-900 border border-gray-700 p-6 rounded-3xl max-w-sm w-full relative z-10 shadow-2xl animate-scale-up">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Wallet className="text-green-500"/> Confirm Withdrawal</h3>
                
                <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-gray-800 mb-6">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Requested Amount</span>
                        <span className="text-white">₹{confirmModal.amount}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Gateway Fee (3%)</span>
                        <span className="text-red-400">- ₹{confirmModal.fee}</span>
                    </div>
                    <div className="h-px bg-gray-700 my-2"></div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>You Receive</span>
                        <span className="text-green-400">₹{confirmModal.final}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setConfirmModal(prev => ({...prev, show: false}))} className="py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors">Cancel</button>
                    <button onClick={confirmWithdrawal} className="py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20">Confirm</button>
                </div>
            </div>
         </div>
      )}

      {/* 🌟 4. THE SIDEBAR DRAWER (Works on Laptop & Mobile) */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          
          {/* Sidebar Content */}
          <div className={`absolute top-0 right-0 h-full w-[300px] bg-[#0a0a0a] border-l border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400 font-bold tracking-widest text-sm uppercase">Menu</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-neutral-900 rounded-full text-white hover:bg-neutral-800 transition-colors">
                      <X size={20} />
                  </button>
              </div>

              {/* User Profile Summary */}
              <div className="p-6 pb-2">
                  <div className="flex items-center gap-4 mb-6">
                       <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`} className="w-12 h-12 rounded-full border border-purple-500 shadow-lg shadow-purple-900/20" />
                       <div>
                           <p className="font-bold text-white text-lg">{profile?.full_name?.split(' ')[0] || 'User'}</p>
                           <p className="text-xs text-purple-400 font-mono bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/20">ID: {profile?.username || '---'}</p>
                       </div>
                  </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-4 space-y-2">
                   {profile?.is_admin && (
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl bg-red-900/10 text-red-400 border border-red-500/10 hover:bg-red-900/20 transition-all group">
                         <span className="flex items-center gap-3"><ShieldAlert size={20} /> Admin Panel</span>
                         <ChevronRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform"/>
                      </Link>
                   )}
                   
                   <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-900 text-gray-300 hover:text-yellow-400 transition-all group">
                        <span className="flex items-center gap-3"><Trophy size={20} /> Leaderboard</span>
                        <ChevronRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform"/>
                   </Link>

                   <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-900 text-gray-300 hover:text-white transition-all group">
                        <span className="flex items-center gap-3"><User size={20} /> My Profile</span>
                        <ChevronRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform"/>
                   </Link>

                   <Link href="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-900 text-gray-300 hover:text-white transition-all group">
                        <span className="flex items-center gap-3"><Settings size={20} /> Settings</span>
                        <ChevronRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform"/>
                   </Link>

                   <div className="h-px bg-gray-800 my-2"></div>

                   <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-900 text-gray-400 hover:text-white transition-all group">
                        <span className="flex items-center gap-3"><Home size={20} /> Back to Website</span>
                   </Link>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-800">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-900/20">
                      <LogOut size={20} /> Logout
                  </button>
                  <p className="text-center text-[10px] text-gray-600 mt-4">v1.2.0 • NewarPrime Secure</p>
              </div>
          </div>
      </div>


      {/* --- CLEAN NAVBAR (Same on Laptop & Mobile) --- */}
      <nav className="border-b border-gray-800 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
          
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
             <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full border border-gray-700" />
             <span className="font-bold text-xl bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">NewarPrime</span>
          </Link>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-4">
              
              {/* Notification Bell (Optional Polish) */}
              <div className="hidden md:block p-2 text-gray-400 hover:text-white cursor-pointer transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </div>

              {/* UNIFIED HAMBURGER BUTTON (Visible on ALL Screens) */}
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="flex items-center gap-3 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-gray-800 rounded-full transition-all group"
              >
                  <span className="hidden md:block text-sm font-bold text-gray-300 group-hover:text-white">Menu</span>
                  <Menu size={20} className="text-white"/>
              </button>
          </div>

        </div>
      </nav>

      {/* --- DASHBOARD CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{profile?.full_name?.split(' ')[0] || 'Earner'}</span>! 👋</h1>
            <p className="text-gray-400">Here is your performance overview for today.</p>
        </div>

        {/* Activation Section (Only if not active) */}
        {!profile?.is_active && (
           <div className="mb-12">
               <div className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-gray-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
                   <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Zap className="text-yellow-400" fill="currentColor"/> Activate Your Account</h2>
                   <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                     <div className="p-6 rounded-2xl bg-neutral-900/80 border border-gray-700 hover:border-purple-500 transition-all group">
                       <h3 className="text-xl font-bold text-gray-200">NewarPrime Starter</h3>
                       <div className="text-4xl font-bold text-white mb-4 mt-2">₹199</div>
                       <ul className="text-sm text-gray-400 mb-6 space-y-2">
                           <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> Basic Affiliate Access</li>
                           <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> 60% Commission</li>
                       </ul>
                       <button onClick={() => handleRazorpayPayment('NewarPrime', 199)} className="w-full py-3 bg-gray-700 group-hover:bg-purple-600 text-white font-bold rounded-xl transition-all">Activate Now</button>
                     </div>
                     <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-900/30 to-neutral-900/80 border border-purple-500/50 relative">
                       <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                       <h3 className="text-xl font-bold text-white">NewarPrime Pro <Zap className="inline text-yellow-400" size={18}/></h3>
                       <div className="text-4xl font-bold text-white mb-4 mt-2">₹499</div>
                       <ul className="text-sm text-gray-300 mb-6 space-y-2">
                           <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400"/> Higher Commission (₹300)</li>
                           <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400"/> Premium Video Courses</li>
                           <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400"/> Priority Support</li>
                       </ul>
                       <button onClick={() => handleRazorpayPayment('NewarPrime Pro', 499)} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg">Activate Pro</button>
                     </div>
                   </div>
               </div>
           </div>
        )}

        {/* Active Dashboard */}
        <div className={`transition-all duration-500 ${profile?.is_active ? 'opacity-100' : 'opacity-40 pointer-events-none blur-sm select-none'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Wallet Widget */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900/50 border border-gray-800 relative group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/20 rounded-xl"><Wallet className="text-green-500" size={24} /></div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-bold">Wallet Balance</p>
                                <h3 className="text-3xl font-bold">₹{(profile?.wallet_balance || 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800/50">
                        {hasPendingRequest ? (
                            <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-500 text-sm text-center flex items-center justify-center gap-2">
                                <Clock size={16} className="animate-pulse"/> Withdrawal Processing...
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                                    <input 
                                        type="number" 
                                        placeholder="Enter Amount" 
                                        value={withdrawAmount} 
                                        onChange={(e) => setWithdrawAmount(e.target.value)} 
                                        className="w-full bg-neutral-900 border border-gray-700 rounded-lg py-2.5 pl-8 pr-3 text-white focus:border-green-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <button onClick={handleWithdrawClick} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm transition-colors shadow-lg">
                                    Withdraw
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] text-gray-500 mt-2 text-center md:text-left">* Minimum withdrawal ₹500. 3% Gateway Fee applies.</p>
                        {!profile?.payout_upi_id && <Link href="/settings" className="text-xs text-red-400 hover:underline mt-2 block text-center md:text-left">⚠ Add UPI/Bank Details in Settings</Link>}
                    </div>
                </div>

                {/* Earnings Widget */}
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-gray-800 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64} className="text-blue-500" /></div>
                    <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4 text-blue-400"><TrendingUp size={24} /></div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Earned</p>
                    <h3 className="text-3xl font-bold text-white mt-1">₹{lifetimeEarnings.toFixed(2)}</h3>
                    <p className="text-xs text-gray-500 mt-2">Lifetime Income</p>
                </div>

                {/* Referrals Widget */}
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-gray-800 hover:border-purple-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={64} className="text-purple-500" /></div>
                    <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4 text-purple-400"><Users size={24} /></div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Referrals</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{referrals.length}</h3>
                    <p className="text-xs text-purple-400 mt-2">Active Team Members</p>
                </div>
            </div>

            {/* Affiliate Link Section */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 mb-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-white flex items-center gap-2"><Zap size={20} className="text-yellow-400"/> Your Affiliate Link</h3>
                        <p className="text-purple-200 text-sm">Share this link to earn 60% commission on every active referral.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="bg-black/50 border border-gray-600 rounded-xl p-3 px-4 text-gray-300 font-mono text-sm truncate flex-1 md:w-80 flex items-center">
                            {profile ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${profile.referral_code || user?.id}` : 'Loading...'}
                        </div>
                        <button onClick={copyLink} className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2">
                            <Copy size={16} /> Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Team Table */}
            <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><Users className="text-purple-500"/> My Team Performance</h2>
                <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"> 
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-black text-gray-400 uppercase text-xs font-bold tracking-wider border-b border-gray-800">
                                <tr>
                                    <th className="p-5">Name</th>
                                    <th className="p-5">Email</th>
                                    <th className="p-5">Joined Date</th>
                                    <th className="p-5">Phone</th>
                                    <th className="p-5">Package</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {referrals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Users size={40} className="opacity-20"/>
                                                <p>No referrals yet. Start sharing your link!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    referrals.map(r => (
                                        <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5 font-bold text-white flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs text-white">{r.full_name?.[0] || 'U'}</div>
                                                {r.full_name || 'User'}
                                            </td>
                                            <td className="p-5 text-gray-500">{r.email || '-'}</td>
                                            <td className="p-5 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                                            <td className="p-5 text-gray-500 font-mono">{r.phone_number || '-'}</td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${r.package_name?.includes('Pro') ? 'bg-yellow-900/20 border-yellow-600 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                                    {r.package_name || 'Starter'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                {r.is_active ? 
                                                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active</span> 
                                                    : <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-red-500"></span> Pending</span>
                                                }
                                            </td>
                                            <td className="p-5 text-right font-mono font-bold text-green-400">
                                                {r.is_active ? `+ ₹${getCommission(r.package_name)}` : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-center pb-12">
                <Link href="/courses" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                    <PlayCircle size={24} /> Start Watching Courses
                </Link>
            </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </div>
  );
}