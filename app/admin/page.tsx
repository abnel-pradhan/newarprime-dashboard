'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Check, X, LogOut, Wallet, UserPlus } from 'lucide-react';

// Replace with your email!
const ADMIN_EMAILS = ["abnelpradhan7@gmail.com"]; 

export default function AdminPanel() {
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    fetchData();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      alert("Access Denied: You are not an Admin!");
      router.push('/dashboard');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch User Approvals
    const { data: payData } = await supabase
      .from('payments')
      .select(`*, profiles:user_id (full_name, email, referral_code, referred_by)`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (payData) setPayments(payData);

    // 2. Fetch Withdrawal Requests (Added payout_upi_id to the list)
    const { data: withData } = await supabase
      .from('withdrawals')
      .select(`*, profiles:user_id (full_name, email, phone_number, bank_account_no, bank_ifsc, bank_holder_name, payout_upi_id)`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (withData) setWithdrawals(withData);
    
    setLoading(false);
  };

  const handlePayWithdrawal = async (withdrawalId: string, userId: string, amount: number) => {
      if (!window.confirm(`Have you manually sent ₹${amount} to the user?`)) return;

      await supabase.from('withdrawals').update({ status: 'paid' }).eq('id', withdrawalId);

      const { data: user } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
      if (user) {
          const newBalance = (user.wallet_balance || 0) - amount;
          await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
      }

      alert("Withdrawal Marked as Paid!");
      fetchData();
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
      if (!window.confirm("Reject this withdrawal request?")) return;
      await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', withdrawalId);
      fetchData();
  };

  const handleApproveUser = async (paymentId: string, userId: string) => {
    if (!window.confirm("Approve this user?")) return;
    await supabase.from('payments').update({ status: 'paid' }).eq('id', paymentId);
    await supabase.from('profiles').update({ is_active: true }).eq('id', userId);
    alert("User Approved!");
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors">
                <LogOut size={16}/> Exit
            </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            
            {/* SECTION 1: WITHDRAWAL REQUESTS */}
            <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-fit">
                <div className="p-6 border-b border-gray-800 bg-red-900/10">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-red-400">
                        <Wallet size={24}/> Withdrawal Requests <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{withdrawals.length}</span>
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/50 text-gray-400 uppercase text-xs">
                            <tr><th className="p-4">User Details</th><th className="p-4">Payout To</th><th className="p-4">Amount</th><th className="p-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {withdrawals.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">No pending withdrawals.</td></tr> : withdrawals.map(w => (
                                <tr key={w.id} className="hover:bg-gray-800/30">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{w.profiles?.full_name}</div>
                                        <div className="text-xs text-gray-500">{w.profiles?.phone_number}</div>
                                    </td>
                                    
                                    {/* UPDATED PAYOUT COLUMN */}
                                    <td className="p-4">
                                        {/* SHOW UPI ID (Smart Check) */}
                                        {(w.payout_upi || w.profiles?.payout_upi_id) ? (
                                            <div className="text-blue-400 font-mono mb-2 bg-blue-900/20 px-2 py-1 rounded inline-block">
                                                {w.payout_upi || w.profiles?.payout_upi_id}
                                            </div>
                                        ) : (
                                            <div className="text-red-500 text-xs mb-2 font-bold">⚠ No UPI Found</div>
                                        )}
                                        
                                        {/* SHOW BANK DETAILS */}
                                        {w.profiles?.bank_account_no && (
                                            <div className="text-[10px] text-gray-400 bg-black/40 p-2 rounded border border-gray-700">
                                                <div><span className="text-gray-500 font-bold">A/C:</span> {w.profiles.bank_account_no}</div>
                                                <div><span className="text-gray-500 font-bold">IFSC:</span> <span className="text-yellow-500 font-mono">{w.profiles.bank_ifsc || 'N/A'}</span></div>
                                                <div><span className="text-gray-500 font-bold">Name:</span> {w.profiles.bank_holder_name || '-'}</div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-4 font-bold text-xl text-green-400">₹{w.amount}</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button onClick={() => handlePayWithdrawal(w.id, w.user_id, w.amount)} className="p-2 bg-green-600 hover:bg-green-500 rounded text-white" title="Mark Paid"><Check size={16}/></button>
                                        <button onClick={() => handleRejectWithdrawal(w.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded text-white" title="Reject"><X size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 2: NEW USER APPROVALS */}
            <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-fit">
                <div className="p-6 border-b border-gray-800 bg-green-900/10">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-green-400">
                        <UserPlus size={24}/> New User Requests <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{payments.length}</span>
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/50 text-gray-400 uppercase text-xs">
                            <tr><th className="p-4">User</th><th className="p-4">Amount</th><th className="p-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {payments.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-gray-500">No pending approvals.</td></tr> : payments.map(p => (
                                <tr key={p.id} className="hover:bg-gray-800/30">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{p.profiles?.full_name}</div>
                                    </td>
                                    <td className="p-4 font-mono text-green-400">₹{p.amount}</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button onClick={() => handleApproveUser(p.id, p.user_id)} className="p-2 bg-green-600 hover:bg-green-500 rounded text-white"><Check size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}