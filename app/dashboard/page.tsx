'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Settings, Wallet, TrendingUp, Users, CreditCard, 
  PlayCircle, Zap, CheckCircle, Clock, Copy, Home, ShieldAlert, 
  Trophy, Menu, X, User // ✅ Added Menu, X, and User Icons
} from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState(''); 
  const [hasPendingRequest, setHasPendingRequest] = useState(false); 
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);

  // Referral State
  const [referrals, setReferrals] = useState<any[]>([]);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // 1. Get Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // 2. Check Pending Withdrawal
      const { data: pendingReq } = await supabase.from('withdrawals').select('id').eq('user_id', user.id).eq('status', 'pending').maybeSingle();
      if (pendingReq) setHasPendingRequest(true);

      // 3. Fetch Referrals
      const { data: myRefs } = await supabase
        .from('profiles')
        .select('*')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });
        
      setReferrals(myRefs || []);

      // 4. Calculate Lifetime Earnings
      const { data: paidWithdrawals } = await supabase.from('withdrawals').select('amount').eq('user_id', user.id).eq('status', 'paid');
      const totalWithdrawn = paidWithdrawals?.reduce((sum, item) => sum + item.amount, 0) || 0;
      setLifetimeEarnings((profileData?.wallet_balance || 0) + totalWithdrawn);

      setLoading(false);
    };

    getData();
  }, []);

  // --- RAZORPAY HANDLER ---
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => { resolve(true); };
      script.onerror = () => { resolve(false); };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (pkgName: string, price: number) => {
    if (!user) return alert("Please login first");

    const res = await loadRazorpayScript();
    if (!res) return alert('Razorpay SDK failed to load.');

    const orderData = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: price }),
    });
    const order = await orderData.json();

    if (order.error) return alert("Server Error: " + order.error);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      amount: order.amount,
      currency: order.currency,
      name: "NewarPrime",
      description: `Purchase ${pkgName}`,
      order_id: order.id,
      handler: async function (response: any) {
        alert("Payment Successful! Verifying...");
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
           alert("Account Activated! Commission Distributed.");
           window.location.reload();
        } else {
           alert("Verification Failed: " + verifyData.error);
        }
      },
      prefill: {
        name: profile?.full_name,
        email: user.email,
        contact: profile?.phone_number,
      },
      theme: { color: "#9333ea" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };
  
  const copyLink = () => {
    const code = profile?.referral_code || user?.id;
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    alert("✅ Affiliate Link Copied!");
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    const balance = profile?.wallet_balance || 0;
    if (!amount || amount < 500) return alert("Minimum withdrawal is ₹500");
    if (amount > balance) return alert("Insufficient Balance!");
    if (!profile?.payout_upi_id) return router.push('/settings');
    const fee = Math.floor(amount * 0.03); 
    const finalPayout = amount - fee;
    if (!window.confirm(`Withdraw ₹${amount}?\n(Fee: ₹${fee}, You get: ₹${finalPayout})`)) return;
    const { error } = await supabase.from('withdrawals').insert([{
        user_id: profile.id,
        amount: amount,
        payout_upi: profile.payout_upi_id
    }]);
    if (error) alert(error.message);
    else { alert("Request Sent!"); setHasPendingRequest(true); setWithdrawAmount(''); }
  };

  const getCommission = (pkg: string) => {
    if (!pkg) return 0;
    if (pkg.includes('Pro')) return 300; 
    return 120; 
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* --- RESPONSIVE NAVIGATION BAR --- */}
      <nav className="border-b border-gray-800 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
             <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full border border-gray-700" />
             <span className="font-bold text-xl bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
               NewarPrime
             </span>
          </Link>

          {/* DESKTOP MENU (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-6">
             {profile?.is_admin && (
                <Link href="/admin" className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-500/50 rounded-lg text-red-500 text-sm font-bold hover:bg-red-600 hover:text-white transition-all animate-pulse">
                    <ShieldAlert size={16} /> Admin Panel
                </Link>
             )}
             <Link href="/leaderboard" className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-full transition-all" title="Leaderboard">
                <Trophy size={20} />
             </Link>
             <Link href="/" className="p-2 text-gray-400 hover:text-purple-400 transition-colors" title="Go to Website">
                <Home size={20} />
             </Link>
             <Link href="/settings" className="p-2 text-gray-400 hover:text-white transition-colors" title="Settings">
                <Settings size={20} />
             </Link>
             
             {/* Profile & Logout */}
             <div className="flex items-center gap-3 pl-6 border-l border-gray-800">
                <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="text-right">
                        <p className="text-sm font-bold text-white">{profile?.full_name?.split(' ')[0] || 'Member'}</p>
                        <p className="text-xs text-gray-400">ID: {profile?.username || '---'}</p>
                    </div>
                    <img 
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                    />
                </Link>
                <button onClick={handleLogout} className="p-2 bg-neutral-800 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors ml-2" title="Logout">
                    <LogOut size={18} />
                </button>
             </div>
          </div>

          {/* MOBILE MENU BUTTON (Visible only on Mobile) */}
          <button 
            className="md:hidden p-2 text-white bg-neutral-800 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* MOBILE DROPDOWN MENU */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-neutral-900 border-b border-gray-800 shadow-2xl md:hidden flex flex-col p-4 space-y-3 animate-fade-in-down z-50">
               
               {/* User Info (Mobile) */}
               <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                  <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-white">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">ID: {profile?.username || '---'}</p>
                  </div>
               </div>

               {/* Links */}
               {profile?.is_admin && (
                  <Link href="/admin" className="flex items-center gap-3 p-3 bg-red-900/20 text-red-400 rounded-xl">
                     <ShieldAlert size={20} /> Admin Panel
                  </Link>
               )}
               <Link href="/leaderboard" className="flex items-center gap-3 p-3 text-yellow-400 hover:bg-white/5 rounded-xl">
                   <Trophy size={20} /> Leaderboard
               </Link>
               <Link href="/" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/5 rounded-xl">
                   <Home size={20} /> Website Home
               </Link>
               <Link href="/profile" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/5 rounded-xl">
                   <User size={20} /> My Profile
               </Link>
               <Link href="/settings" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/5 rounded-xl">
                   <Settings size={20} /> Settings
               </Link>
               
               {/* Logout (Mobile) */}
               <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-400 bg-red-500/10 rounded-xl w-full">
                   <LogOut size={20} /> Logout
               </button>
            </div>
          )}
        </div>
      </nav>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Welcome Section */}
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{profile?.full_name?.split(' ')[0] || 'Earner'}</span>! 👋
            </h1>
            <p className="text-gray-400">Here is your performance overview for today.</p>
        </div>

        {/* Activation Section (If Inactive) */}
        {!profile?.is_active && (
           <div className="mb-12">
               <div className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-gray-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
                   <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                       <Zap className="text-yellow-400" fill="currentColor"/> Activate Your Account
                   </h2>
                   <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                     {/* Starter */}
                     <div className="p-6 rounded-2xl bg-neutral-900/80 border border-gray-700 hover:border-purple-500 transition-all group">
                       <h3 className="text-xl font-bold text-gray-200">NewarPrime Starter</h3>
                       <div className="text-4xl font-bold text-white mb-4 mt-2">₹199</div>
                       <ul className="text-sm text-gray-400 mb-6 space-y-2">
                           <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> Basic Affiliate Access</li>
                           <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> 60% Commission</li>
                       </ul>
                       <button onClick={() => handleRazorpayPayment('NewarPrime', 199)} className="w-full py-3 bg-gray-700 group-hover:bg-purple-600 text-white font-bold rounded-xl transition-all">
                           Activate Now
                       </button>
                     </div>
                     {/* Pro */}
                     <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-900/30 to-neutral-900/80 border border-purple-500/50 relative">
                       <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                       <h3 className="text-xl font-bold text-white">NewarPrime Pro <Zap className="inline text-yellow-400" size={18}/></h3>
                       <div className="text-4xl font-bold text-white mb-4 mt-2">₹499</div>
                       <ul className="text-sm text-gray-300 mb-6 space-y-2">
                           <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400"/> Higher Commission (₹300)</li>
                           <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400"/> Premium Video Courses</li>
                           <li className="flex gap-2"><CheckCircle size={16} className="text-yellow-400"/> Priority Support</li>
                       </ul>
                       <button onClick={() => handleRazorpayPayment('NewarPrime Pro', 499)} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg">
                           Activate Pro
                       </button>
                     </div>
                   </div>
               </div>
           </div>
        )}

        {/* Active Dashboard */}
        <div className={`transition-all duration-500 ${profile?.is_active ? 'opacity-100' : 'opacity-40 pointer-events-none blur-sm select-none'}`}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Wallet */}
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
                                <button onClick={handleWithdraw} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm transition-colors shadow-lg">
                                    Withdraw
                                </button>
                            </div>
                        )}
                         <p className="text-[10px] text-gray-500 mt-2 text-center md:text-left">* Minimum withdrawal ₹500. 3% Gateway Fee applies.</p>
                         {!profile?.payout_upi_id && <Link href="/settings" className="text-xs text-red-400 hover:underline mt-2 block text-center md:text-left">⚠ Add UPI/Bank Details in Settings</Link>}
                    </div>
                </div>

                {/* Lifetime Earnings */}
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-gray-800 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64} className="text-blue-500" /></div>
                    <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4 text-blue-400"><TrendingUp size={24} /></div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Earned</p>
                    <h3 className="text-3xl font-bold text-white mt-1">₹{lifetimeEarnings.toFixed(2)}</h3>
                    <p className="text-xs text-gray-500 mt-2">Lifetime Income</p>
                </div>

                {/* Team Stats */}
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-gray-800 hover:border-purple-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={64} className="text-purple-500" /></div>
                    <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4 text-purple-400"><Users size={24} /></div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Referrals</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{referrals.length}</h3>
                    <p className="text-xs text-purple-400 mt-2">Active Team Members</p>
                </div>
            </div>

            {/* Referral Link */}
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
                                <tr><th className="p-5">Name</th><th className="p-5">Email</th><th className="p-5">Joined Date</th><th className="p-5">Phone</th><th className="p-5">Package</th><th className="p-5">Status</th><th className="p-5 text-right">Commission</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {referrals.length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-gray-500"><div className="flex flex-col items-center gap-3"><Users size={40} className="opacity-20"/><p>No referrals yet. Start sharing your link!</p></div></td></tr>
                                ) : (
                                    referrals.map(r => (
                                        <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5 font-bold text-white flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs text-white">{r.full_name?.[0] || 'U'}</div>{r.full_name || 'User'}</td>
                                            <td className="p-5 text-gray-500">{r.email || '-'}</td>
                                            <td className="p-5 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                                            <td className="p-5 text-gray-500 font-mono">{r.phone_number || '-'}</td>
                                            <td className="p-5"><span className={`px-3 py-1 rounded-full border text-xs font-bold ${r.package_name?.includes('Pro') ? 'bg-yellow-900/20 border-yellow-600 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>{r.package_name || 'Starter'}</span></td>
                                            <td className="p-5">{r.is_active ? <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active</span> : <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-red-500"></span> Pending</span>}</td>
                                            <td className="p-5 text-right font-mono font-bold text-green-400">{r.is_active ? `+ ₹${getCommission(r.package_name)}` : '-'}</td>
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
    </div>
  );
}