'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Wallet, TrendingUp, Users, CreditCard, PlayCircle, Zap, X, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{name: string, price: string} | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState(''); 
  const [hasPendingRequest, setHasPendingRequest] = useState(false); 
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);

  // Referral State
  const [referrals, setReferrals] = useState<any[]>([]);

  const router = useRouter();

  // --- CONFIG: YOUR UPI DETAILS ---
  const UPI_ID = "abnelpradhan7@okaxis"; 
  const PAYEE_NAME = "NewarPrime Business"; 

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

      // 2. Check existing payment
      const { data: paymentData } = await supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      if (paymentData) setPaymentStatus(paymentData.status);

      // 3. Check Pending Withdrawal
      const { data: pendingReq } = await supabase.from('withdrawals').select('id').eq('user_id', user.id).eq('status', 'pending').maybeSingle();
      if (pendingReq) setHasPendingRequest(true);

      // 4. Fetch Referrals
      const { data: myRefs } = await supabase.from('profiles').select('*').eq('referred_by', user.id).order('created_at', { ascending: false });
      setReferrals(myRefs || []);

      // 5. CALCULATE LIFETIME EARNINGS
      const { data: paidWithdrawals } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid');
      
      const totalWithdrawn = paidWithdrawals?.reduce((sum, item) => sum + item.amount, 0) || 0;
      setLifetimeEarnings((profileData?.wallet_balance || 0) + totalWithdrawn);

      setLoading(false);
    };

    getData();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const copyLink = () => {
    const code = profile?.referral_code || user?.id;
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    alert("Affiliate Link Copied!");
  };

  const openPaymentModal = (pkgName: string, pkgPrice: string) => {
    setSelectedPackage({ name: pkgName, price: pkgPrice });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return alert("Please enter Transaction ID");
    setSubmitting(true);

    const { error } = await supabase.from('payments').insert([{
        user_id: user.id,
        amount: Number(selectedPackage?.price),
        transaction_id: transactionId,
        status: 'pending'
    }]);

    if (error) { alert("Error: " + error.message); } 
    else {
      await supabase.from('profiles').update({ package_name: selectedPackage?.name }).eq('id', user.id);
      setPaymentStatus('pending');
      setShowPaymentModal(false);
      alert("Payment Submitted! Wait for admin approval.");
      window.location.reload();
    }
    setSubmitting(false);
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
    else {
        alert("Request Sent!");
        setHasPendingRequest(true); 
        setWithdrawAmount('');
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      
      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-neutral-900 border border-gray-700 p-6 rounded-2xl max-w-sm w-full">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
            <h3 className="text-xl font-bold mb-1 text-center">Pay ₹{selectedPackage.price}</h3>
            <p className="text-purple-400 text-sm text-center mb-6">{selectedPackage.name}</p>
            <div className="bg-white p-4 rounded-xl mb-6 mx-auto w-fit shadow-lg shadow-purple-500/20">
               <QRCodeSVG value={`upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${selectedPackage.price}&cu=INR`} size={200} />
            </div>
            <div className="text-center text-sm mb-6 text-gray-300 bg-gray-800 p-3 rounded-lg border border-gray-700">UPI: <span className="text-white font-mono ml-1">{UPI_ID}</span></div>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <input type="text" placeholder="Enter Transaction ID" className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white outline-none" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
              <button disabled={submitting} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">{submitting ? 'Verifying...' : 'Submit Payment'}</button>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full"></div>
             <span className="font-bold text-xl">NewarPrime</span>
          </div>
          
          <div className="flex items-center gap-3">
              <Link href="/settings" className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-gray-200 border border-gray-700 rounded-lg hover:bg-neutral-700 text-sm font-medium transition-all">
                  <Settings size={16} /> <span className="hidden sm:inline">Settings</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-sm font-medium transition-all">
                  <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
              </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* STATUS CARD */}
        <div className="mb-10">
           {profile?.is_active ? (
             <div className="p-6 rounded-2xl bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-full text-black"><CheckCircle size={24} /></div>
                <div><h2 className="text-2xl font-bold text-green-400">Active Affiliate</h2><p className="text-gray-300">Package: <span className="text-white font-semibold">{profile?.package_name || 'Standard'}</span></p></div>
             </div>
           ) : paymentStatus === 'pending' ? (
             <div className="p-6 rounded-2xl bg-yellow-900/30 border border-yellow-500/30 flex items-center gap-4">
                <div className="p-3 bg-yellow-500 rounded-full text-black"><Clock size={24} /></div>
                <div><h2 className="text-2xl font-bold text-yellow-400">Payment Pending</h2><p className="text-gray-300">Admin verification in progress.</p></div>
             </div>
           ) : (
             <div className="text-center md:text-left">
               <h2 className="text-3xl font-bold mb-2">Choose Your Package</h2>
               <div className="grid md:grid-cols-2 gap-6 max-w-4xl mt-8">
                 {/* Starter */}
                 <div className="p-6 rounded-3xl bg-neutral-900 border border-gray-800 hover:border-purple-500 transition-all">
                   <h3 className="text-xl font-bold text-gray-200">NewarPrime</h3>
                   <div className="text-4xl font-bold text-white mb-6">₹199</div>
                   <button onClick={() => openPaymentModal('NewarPrime', '199')} className="w-full py-3 bg-gray-800 hover:bg-purple-600 hover:text-white font-bold rounded-xl transition-all">Choose Starter</button>
                 </div>
                 {/* Pro */}
                 <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-900/20 to-neutral-900 border border-purple-500">
                   <h3 className="text-xl font-bold text-white">NewarPrime Pro <Zap className="inline text-yellow-400"/></h3>
                   <div className="text-4xl font-bold text-white mb-6">₹499</div>
                   <button onClick={() => openPaymentModal('NewarPrime Pro', '499')} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">Unlock Pro</button>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* ACTIVE DASHBOARD CONTENT */}
        <div className={`transition-opacity duration-500 ${profile?.is_active ? 'opacity-100' : 'opacity-50 pointer-events-none filter blur-sm'}`}>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              
              {/* CARD 1: WALLET & WITHDRAW */}
              <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl"><Wallet className="text-green-500" size={24} /></div>
                  <div className="text-right">
                     <p className="text-gray-400 text-xs mb-1">Available Balance</p>
                     <h3 className="text-3xl font-bold">₹{profile?.wallet_balance || 0}</h3>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-800">
                    {hasPendingRequest ? (
                        <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-500 text-sm text-center">
                            <Clock size={16} className="inline mb-1 mr-1"/> Withdrawal Pending...
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <input type="number" placeholder="Amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-white focus:border-green-500 outline-none text-sm"/>
                            </div>
                            <button onClick={handleWithdraw} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm transition-colors">Withdraw Money</button>
                            <p className="text-[10px] text-gray-500 text-center">3% Platform Fee applies.</p>
                        </div>
                    )}
                </div>
                {!profile?.payout_upi_id && <Link href="/settings" className="text-xs text-red-400 hover:underline mt-4 block text-center">⚠ Add Bank Details first</Link>}
              </div>

              {/* CARD 2: LIFETIME EARNINGS */}
              <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl"><TrendingUp className="text-blue-500" size={24} /></div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Lifetime</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Earned</p>
                <h3 className="text-3xl font-bold">₹{lifetimeEarnings}</h3>
              </div>

              {/* CARD 3: NEXT PAYOUT */}
              <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl"><CreditCard className="text-purple-500" size={24} /></div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Schedule</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">Next Payout</p>
                <h3 className="text-xl font-bold">
                    {hasPendingRequest ? "Processing..." : "Within 24 Hours"}
                </h3>
              </div>
            </div>

            {/* REFERRAL LINK */}
            <div className="p-8 bg-neutral-900 border border-gray-800 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div>
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Users size={20} className="text-purple-500"/> Referral Link</h3>
                    <p className="text-gray-400 text-sm">Share to earn 60% commission.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <code className="bg-black p-3 rounded-lg text-gray-300 text-sm border border-gray-700 truncate flex-1">
                        {profile ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${profile.referral_code || user?.id}` : 'Loading...'}
                    </code>
                    <button onClick={copyLink} className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg font-medium text-sm">Copy</button>
                </div>
            </div>

            {/* REFERRAL TEAM TABLE */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="text-blue-500"/> My Team</h2>
                <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-gray-400 uppercase"><tr className="text-xs"><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Date</th></tr></thead>
                        <tbody className="divide-y divide-gray-800">
                            {referrals.length === 0 ? <tr><td colSpan={3} className="p-6 text-center text-gray-500">No referrals yet.</td></tr> : referrals.map(r => (
                                <tr key={r.id} className="hover:bg-gray-800/50"><td className="p-4">{r.full_name || 'User'}</td><td className="p-4">{r.is_active ? <span className="text-green-400">Active</span> : <span className="text-yellow-500">Pending</span>}</td><td className="p-4 text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Link href="/training" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg text-white hover:shadow-lg transition-all flex items-center gap-2"><PlayCircle size={24} /> Start Watching Courses</Link>
            </div>
        </div>

      </main>
    </div>
  );
}