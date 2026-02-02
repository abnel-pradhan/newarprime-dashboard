'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, DollarSign, Activity, CheckCircle, XCircle, 
  Search, Clock, Ban, Landmark, CreditCard, User
} from 'lucide-react';

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('withdrawals'); 
  
  // Data States
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, pendingWithdrawals: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin) {
      setIsAdmin(true);
      fetchData();
    } else {
      alert("⛔ ACCESS DENIED: Admins only.");
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const fetchData = async () => {
    // 1. Fetch Users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    setUsers(usersData || []);

    // 2. Fetch Withdrawals 
    // 🔥 CRITICAL FIX: Added 'bank_holder_name' to the select list below
    const { data: withdrawalsData } = await supabase
      .from('withdrawals')
      .select('*, profiles(full_name, email, phone_number, bank_account_no, ifsc_code, bank_holder_name)')
      .order('created_at', { ascending: false });
    
    setWithdrawals(withdrawalsData || []);

    // 3. Calculate Stats
    const totalRev = usersData?.reduce((acc, user) => {
        if (!user.is_active) return acc;
        return acc + (user.package_name?.includes('Pro') ? 499 : 199);
    }, 0) || 0;

    const pendingCount = withdrawalsData?.filter(w => w.status === 'pending').length || 0;

    setStats({
        totalUsers: usersData?.length || 0,
        totalRevenue: totalRev,
        pendingWithdrawals: pendingCount
    });
  };

  // --- APPROVE LOGIC ---
  const handleApproveWithdrawal = async (id: number, amount: number, userId: string) => {
    if(!confirm("Confirm Payment? This will mark it as PAID and deduct from user wallet.")) return;

    // 1. Mark as Paid
    const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'paid' })
        .eq('id', id);

    // 2. Deduct from Wallet
    if (!error) {
        const { data: user } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
        if (user) {
            const newBalance = (user.wallet_balance || 0) - amount;
            await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
        }
        alert("✅ Request Approved!");
        fetchData();
    } else {
        alert(error.message);
    }
  };

  // --- REJECT LOGIC ---
  const handleRejectWithdrawal = async (id: number) => {
    // 1. Ask for Reason
    const reason = prompt("Please enter the reason for rejection (e.g., 'Name Mismatch', 'Invalid IFSC'):");
    if (!reason) return; // Stop if cancelled

    // 2. Update Status & Save Reason
    const { error } = await supabase
        .from('withdrawals')
        .update({ 
            status: 'rejected', 
            rejection_reason: reason 
        })
        .eq('id', id);

    if (error) alert(error.message);
    else {
        alert("❌ Request Rejected.");
        fetchData();
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);
      
      if(!error) fetchData();
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifying Admin Access...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500 selection:text-white">
      
      <div className="flex flex-col md:flex-row min-h-screen">
          
          {/* SIDEBAR */}
          <aside className="w-full md:w-64 bg-neutral-900 border-r border-gray-800 p-6 flex-shrink-0">
              <div className="flex items-center gap-3 mb-10 text-red-500">
                  <Shield size={32} />
                  <span className="font-bold text-2xl text-white">Admin</span>
              </div>
              
              <nav className="space-y-2">
                  <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                      <Activity size={20}/> Overview
                  </button>
                  <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                      <Users size={20}/> Users
                  </button>
                  <button onClick={() => setActiveTab('withdrawals')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'withdrawals' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                      <DollarSign size={20}/> Withdrawals
                      {stats.pendingWithdrawals > 0 && <span className="ml-auto bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pendingWithdrawals}</span>}
                  </button>
              </nav>

              <div className="mt-auto pt-10">
                  <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-white text-sm flex items-center gap-2">
                      &larr; Back to Dashboard
                  </button>
              </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl">
                          <p className="text-gray-400 text-xs font-bold uppercase">Total Users</p>
                          <h3 className="text-4xl font-bold mt-2">{stats.totalUsers}</h3>
                      </div>
                      <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl">
                          <p className="text-gray-400 text-xs font-bold uppercase">Revenue</p>
                          <h3 className="text-4xl font-bold mt-2 text-green-500">₹{stats.totalRevenue.toLocaleString()}</h3>
                      </div>
                      <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl">
                          <p className="text-gray-400 text-xs font-bold uppercase">Pending Payouts</p>
                          <h3 className="text-4xl font-bold mt-2 text-red-500">{stats.pendingWithdrawals}</h3>
                      </div>
                  </div>
              )}

              {/* TAB: USERS */}
              {activeTab === 'users' && (
                  <div className="space-y-6">
                      <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <input type="text" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} className="bg-neutral-900 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-red-500 outline-none"/>
                      </div>
                      <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-black text-gray-400 uppercase text-xs font-bold border-b border-gray-800">
                                  <tr><th className="p-4">User</th><th className="p-4">Wallet</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                  {users.filter(u => u.full_name?.toLowerCase().includes(searchTerm)).map((user) => (
                                      <tr key={user.id} className="hover:bg-white/5">
                                          <td className="p-4 font-medium">{user.full_name} <br/><span className="text-xs text-gray-500">{user.email}</span></td>
                                          <td className="p-4">₹{user.wallet_balance}</td>
                                          <td className="p-4">{user.is_active ? <span className="text-green-500">Active</span> : <span className="text-red-500">Inactive</span>}</td>
                                          <td className="p-4 text-right">
                                              <button onClick={() => handleToggleUserStatus(user.id, user.is_active)} className="text-xs px-3 py-1 rounded border border-gray-600 hover:bg-white/10">
                                                  {user.is_active ? 'Deactivate' : 'Activate'}
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* TAB: WITHDRAWALS (FIXED) */}
              {activeTab === 'withdrawals' && (
                  <div className="space-y-6">
                      <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
                      
                      <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-black text-gray-400 uppercase text-xs font-bold border-b border-gray-800">
                                  <tr>
                                      <th className="p-4">User</th>
                                      <th className="p-4">Amount</th>
                                      <th className="p-4">Bank Details</th>
                                      <th className="p-4">Status</th>
                                      <th className="p-4 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                  {withdrawals.map((req) => (
                                      <tr key={req.id} className="hover:bg-white/5">
                                          <td className="p-4">
                                              <div className="font-bold">{req.profiles?.full_name || 'Unknown'}</div>
                                              <div className="text-xs text-gray-500">{req.profiles?.phone_number}</div>
                                          </td>
                                          <td className="p-4 font-bold text-lg text-white">₹{req.amount}</td>
                                          
                                          {/* BANK DETAILS COLUMN (FIXED) */}
                                          <td className="p-4">
                                              <div className="space-y-1.5">
                                                  {/* Holder Name */}
                                                  {req.profiles?.bank_holder_name && (
                                                      <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                                                          <User size={12} className="text-purple-400"/> {req.profiles.bank_holder_name}
                                                      </div>
                                                  )}

                                                  {/* Bank Account */}
                                                  {req.profiles?.bank_account_no && (
                                                      <div className="flex items-center gap-1.5 text-blue-300 text-xs">
                                                          <Landmark size={12}/> {req.profiles.bank_account_no}
                                                      </div>
                                                  )}

                                                  {/* IFSC */}
                                                  {req.profiles?.ifsc_code && (
                                                      <div className="text-gray-500 text-xs pl-5">
                                                          IFSC: {req.profiles.ifsc_code}
                                                      </div>
                                                  )}

                                                  {/* UPI */}
                                                  {req.payout_upi && (
                                                      <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-900/10 px-2 py-0.5 rounded w-fit font-mono text-xs mt-1">
                                                          <CreditCard size={12}/> UPI: {req.payout_upi}
                                                      </div>
                                                  )}

                                                  {/* Empty State */}
                                                  {!req.payout_upi && !req.profiles?.bank_account_no && (
                                                      <span className="text-red-500 text-xs italic">No Details Provided</span>
                                                  )}
                                              </div>
                                          </td>

                                          <td className="p-4">
                                              {req.status === 'pending' ? (
                                                  <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                    <Clock size={12}/> Pending
                                                  </span>
                                              ) : req.status === 'paid' ? (
                                                  <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                    <CheckCircle size={12}/> Paid
                                                  </span>
                                              ) : (
                                                  <div className="flex flex-col">
                                                      <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                        <Ban size={12}/> Rejected
                                                      </span>
                                                      <span className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate" title={req.rejection_reason}>
                                                          Reason: {req.rejection_reason || 'N/A'}
                                                      </span>
                                                  </div>
                                              )}
                                          </td>

                                          {/* ACTIONS COLUMN */}
                                          <td className="p-4 text-right">
                                              {req.status === 'pending' && (
                                                  <div className="flex justify-end gap-2">
                                                      {/* REJECT BUTTON (With Prompt) */}
                                                      <button 
                                                        onClick={() => handleRejectWithdrawal(req.id)}
                                                        className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg transition-all"
                                                        title="Reject Request"
                                                      >
                                                          <XCircle size={18} />
                                                      </button>

                                                      {/* APPROVE BUTTON */}
                                                      <button 
                                                        onClick={() => handleApproveWithdrawal(req.id, req.amount, req.user_id)}
                                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-green-900/20"
                                                      >
                                                          <CheckCircle size={14} /> Approve
                                                      </button>
                                                  </div>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                                  {withdrawals.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No requests found.</td></tr>}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

          </main>
      </div>
    </div>
  );
}