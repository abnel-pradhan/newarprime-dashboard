'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, DollarSign, Activity, CheckCircle, XCircle, 
  Search, Lock, AlertCircle, Calendar, ArrowUpRight ,Clock
} from 'lucide-react';

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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

    // Check if user is admin
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

    // 2. Fetch Withdrawals (Join with profiles to get names)
    // Note: If you haven't set up foreign keys, we will map user info manually
    const { data: withdrawalsData } = await supabase
      .from('withdrawals')
      .select('*, profiles(full_name, email, phone_number)')
      .order('created_at', { ascending: false });
    
    setWithdrawals(withdrawalsData || []);

    // 3. Calculate Stats
    const totalRev = usersData?.reduce((acc, user) => {
        if (!user.is_active) return acc;
        return acc + (user.package_name === 'NewarPrime Pro' ? 499 : 199);
    }, 0) || 0;

    const pendingCount = withdrawalsData?.filter(w => w.status === 'pending').length || 0;

    setStats({
        totalUsers: usersData?.length || 0,
        totalRevenue: totalRev,
        pendingWithdrawals: pendingCount
    });
  };

  const handleApproveWithdrawal = async (id: number) => {
    if(!confirm("Are you sure you have paid this user? This will mark the request as Paid.")) return;

    const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'paid' })
        .eq('id', id);

    if (error) alert(error.message);
    else {
        alert("✅ Marked as Paid!");
        fetchData(); // Refresh data
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
      
      {/* SIDEBAR & CONTENT LAYOUT */}
      <div className="flex flex-col md:flex-row min-h-screen">
          
          {/* SIDEBAR */}
          <aside className="w-full md:w-64 bg-neutral-900 border-r border-gray-800 p-6 flex-shrink-0">
              <div className="flex items-center gap-3 mb-10 text-red-500">
                  <Shield size={32} />
                  <span className="font-bold text-2xl text-white">Admin</span>
              </div>
              
              <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                      <Activity size={20}/> Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                      <Users size={20}/> User Management
                  </button>
                  <button 
                    onClick={() => setActiveTab('withdrawals')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'withdrawals' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                      <DollarSign size={20}/> 
                      Withdrawals
                      {stats.pendingWithdrawals > 0 && <span className="ml-auto bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pendingWithdrawals}</span>}
                  </button>
              </nav>

              <div className="mt-auto pt-10">
                  <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-white text-sm flex items-center gap-2">
                      &larr; Back to Dashboard
                  </button>
              </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                  <div className="space-y-8">
                      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Card 1 */}
                          <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={64} /></div>
                              <p className="text-gray-400 text-sm font-bold uppercase">Total Users</p>
                              <h3 className="text-4xl font-bold mt-2">{stats.totalUsers}</h3>
                          </div>
                          {/* Card 2 */}
                          <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={64} className="text-green-500"/></div>
                              <p className="text-gray-400 text-sm font-bold uppercase">Total Revenue (Est.)</p>
                              <h3 className="text-4xl font-bold mt-2 text-green-500">₹{stats.totalRevenue.toLocaleString()}</h3>
                          </div>
                          {/* Card 3 */}
                          <div className="p-6 bg-neutral-900 border border-gray-800 rounded-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={64} className="text-red-500"/></div>
                              <p className="text-gray-400 text-sm font-bold uppercase">Pending Requests</p>
                              <h3 className="text-4xl font-bold mt-2 text-red-500">{stats.pendingWithdrawals}</h3>
                          </div>
                      </div>
                  </div>
              )}

              {/* TAB: USERS */}
              {activeTab === 'users' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <h1 className="text-3xl font-bold">User Management</h1>
                          <div className="relative">
                              <Search className="absolute left-3 top-2.5 text-gray-500" size={18}/>
                              <input 
                                type="text" 
                                placeholder="Search by name..." 
                                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                                className="bg-neutral-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-red-500 outline-none w-64"
                              />
                          </div>
                      </div>

                      <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-black text-gray-400 uppercase text-xs font-bold border-b border-gray-800">
                                  <tr>
                                      <th className="p-4">User</th>
                                      <th className="p-4">Package</th>
                                      <th className="p-4">Wallet</th>
                                      <th className="p-4">Status</th>
                                      <th className="p-4">Joined</th>
                                      <th className="p-4 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                  {users.filter(u => u.full_name?.toLowerCase().includes(searchTerm)).map((user) => (
                                      <tr key={user.id} className="hover:bg-white/5">
                                          <td className="p-4 font-medium">
                                              <div>{user.full_name || 'No Name'}</div>
                                              <div className="text-xs text-gray-500">{user.username || user.id.slice(0,8)}</div>
                                          </td>
                                          <td className="p-4">
                                              <span className={`px-2 py-1 rounded text-xs border ${user.package_name?.includes('Pro') ? 'border-yellow-600 text-yellow-500' : 'border-gray-600 text-gray-400'}`}>
                                                  {user.package_name || 'Free'}
                                              </span>
                                          </td>
                                          <td className="p-4 font-mono">₹{user.wallet_balance}</td>
                                          <td className="p-4">
                                              {user.is_active ? <span className="text-green-500 text-xs font-bold">Active</span> : <span className="text-red-500 text-xs font-bold">Inactive</span>}
                                          </td>
                                          <td className="p-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                          <td className="p-4 text-right">
                                              <button 
                                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                                className={`text-xs px-3 py-1 rounded border ${user.is_active ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                              >
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

              {/* TAB: WITHDRAWALS */}
              {activeTab === 'withdrawals' && (
                  <div className="space-y-6">
                      <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
                      
                      <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-black text-gray-400 uppercase text-xs font-bold border-b border-gray-800">
                                  <tr>
                                      <th className="p-4">Request ID</th>
                                      <th className="p-4">User</th>
                                      <th className="p-4">Amount</th>
                                      <th className="p-4">UPI ID</th>
                                      <th className="p-4">Status</th>
                                      <th className="p-4 text-right">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                  {withdrawals.map((req) => (
                                      <tr key={req.id} className="hover:bg-white/5">
                                          <td className="p-4 text-gray-500 font-mono">#{req.id}</td>
                                          <td className="p-4">
                                              <div className="font-bold">{req.profiles?.full_name || 'Unknown'}</div>
                                              <div className="text-xs text-gray-500">{req.profiles?.phone_number || 'No Phone'}</div>
                                          </td>
                                          <td className="p-4 font-bold text-lg">₹{req.amount}</td>
                                          <td className="p-4 font-mono text-yellow-500 bg-yellow-900/10 rounded px-2 w-fit">{req.payout_upi}</td>
                                          <td className="p-4">
                                              {req.status === 'pending' ? (
                                                  <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>
                                              ) : (
                                                  <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Paid</span>
                                              )}
                                          </td>
                                          <td className="p-4 text-right">
                                              {req.status === 'pending' && (
                                                  <button 
                                                    onClick={() => handleApproveWithdrawal(req.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ml-auto shadow-lg shadow-green-900/20"
                                                  >
                                                      <CheckCircle size={14} /> Approve & Mark Paid
                                                  </button>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                                  {withdrawals.length === 0 && (
                                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">No withdrawal requests found.</td></tr>
                                  )}
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