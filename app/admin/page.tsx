'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; 
import ConfirmModal from '@/components/ConfirmModal'; 
import { 
  Shield, Users, DollarSign, Activity, CheckCircle, XCircle, 
  Search, Clock, Ban, Landmark, CreditCard, User, Youtube, Plus, Trash2, 
  Radio, Send 
} from 'lucide-react';

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('withdrawals');
  
  // Data States
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, pendingWithdrawals: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]); 
  const [newCourse, setNewCourse] = useState({ title: '', desc: '', url: '', is_pro: false });

  // BROADCAST STATES
  const [pastBroadcasts, setPastBroadcasts] = useState<any[]>([]);
  const [newBroadcast, setNewBroadcast] = useState({ title: '', message: '', type: 'info', link: '' });

  // --- MODAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ 
    title: '', message: '', isDangerous: false, onConfirm: () => {} 
  });

  const router = useRouter();

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    
    // ✅ FIXED: Now fetching 'role' from the database instead of 'is_admin'
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    
    // ✅ FIXED: Checking if role equals 'admin'
    if (profile?.role === 'admin') { 
        setIsAdmin(true); 
        fetchData(); 
    } 
    else { 
        router.push('/dashboard'); 
    }
    setLoading(false);
  };

  const fetchData = async () => {
    const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(usersData || []);
    const { data: wData } = await supabase.from('withdrawals').select('*, profiles(full_name, email, phone_number, bank_account_no, ifsc_code, bank_holder_name)').order('created_at', { ascending: false });
    setWithdrawals(wData || []);
    const { data: cData } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(cData || []);
    const { data: nData } = await supabase.from('notifications').select('*').eq('is_global', true).order('created_at', { ascending: false });
    setPastBroadcasts(nData || []);

    const totalRev = usersData?.reduce((acc, user) => acc + (user.package_name?.includes('Pro') ? 499 : 199), 0) || 0;
    const pendingCount = wData?.filter(w => w.status === 'pending').length || 0;
    setStats({ totalUsers: usersData?.length || 0, totalRevenue: totalRev, pendingWithdrawals: pendingCount });
  };

  const triggerModal = (title: string, message: string, isDangerous: boolean, action: () => void) => {
      setModalConfig({ title, message, isDangerous, onConfirm: action });
      setModalOpen(true);
  };

  // --- HANDLERS ---
  
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcast.title || !newBroadcast.message) return toast.error("Title and Message are required");

    const { error } = await supabase.from('notifications').insert([{
        title: newBroadcast.title, message: newBroadcast.message, type: newBroadcast.type, link: newBroadcast.link || null, is_global: true
    }]);

    if (error) toast.error(error.message);
    else {
        toast.success("✅ Broadcast Sent to All Users!");
        setNewBroadcast({ title: '', message: '', type: 'info', link: '' }); 
        fetchData(); 
    }
  };

  const clickDeleteBroadcast = (id: string) => {
      triggerModal("Delete Broadcast?", "This will remove the notification from everyone's dashboard.", true, async () => {
          await supabase.from('notifications').delete().eq('id', id);
          toast.success("Broadcast removed.");
          fetchData();
      });
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = newCourse.url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return toast.error("❌ Invalid YouTube URL");

    const { error } = await supabase.from('courses').insert([{ title: newCourse.title, description: newCourse.desc, video_id: videoId, is_pro: newCourse.is_pro }]);
    if (error) toast.error(error.message);
    else { toast.success("✅ Course Added Successfully!"); setNewCourse({ title: '', desc: '', url: '', is_pro: false }); fetchData(); }
  };

  const clickDeleteCourse = (id: number) => {
      triggerModal("Delete Course?", "This cannot be undone. The video will be removed immediately.", true, async () => {
          await supabase.from('courses').delete().eq('id', id);
          toast.success("Trash emptied! Video deleted.");
          fetchData();
      });
  };

  // ✅ UPDATED APPROVE HANDLER
  const clickApprove = (id: number, amount: number, userId: string) => {
      // Find the user's details for the email
      const requestDetails = withdrawals.find(w => w.id === id);
      const userEmail = requestDetails?.profiles?.email;
      const userName = requestDetails?.profiles?.full_name;

      triggerModal("Approve Payout?", `This will mark ₹${amount} as PAID and deduct it from the user's wallet.`, false, async () => {
          await supabase.from('withdrawals').update({ status: 'paid' }).eq('id', id);
          const { data: user } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
          if (user) await supabase.from('profiles').update({ wallet_balance: (user.wallet_balance || 0) - amount }).eq('id', userId);
          
          await supabase.from('notifications').insert({
              user_id: userId, title: '💸 Withdrawal Approved!', message: `Your requested payout of ₹${amount} has been successfully processed.`, type: 'success'
          });

          // 📧 SEND EMAIL TRIGGER
          if (userEmail) {
             fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, userName: userName, type: 'withdrawal_approved', subject: '💸 Payment Sent: NewarPrime Payout', amount: amount })
             }).catch(console.error); // Catch silently so it doesn't break the admin UI
          }

          toast.success("Payout Approved! Email Sent.");
          fetchData();
      });
  };

  // ✅ UPDATED REJECT HANDLER
  const handleRejectWithdrawal = async (id: number) => {
    const reason = prompt("Enter Rejection Reason:"); 
    if (!reason) return;

    // Find the user's details for the email
    const requestDetails = withdrawals.find(w => w.id === id);
    const userEmail = requestDetails?.profiles?.email;
    const userName = requestDetails?.profiles?.full_name;
    const amount = requestDetails?.amount;

    await supabase.from('withdrawals').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
    
    // 📧 SEND EMAIL TRIGGER
    if (userEmail) {
        fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, userName: userName, type: 'withdrawal_rejected', subject: '⚠️ Action Required: NewarPrime Withdrawal', amount: amount, reason: reason })
        }).catch(console.error);
    }

    toast.error("Request Rejected. Email Sent to User.");
    fetchData();
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', userId);
    toast.success(currentStatus ? "User Deactivated" : "User Activated");
    fetchData();
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifying...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500 selection:text-white">
      <ConfirmModal isOpen={modalOpen} onClose={() => setModalOpen(false)} {...modalConfig} />
      <div className="flex flex-col md:flex-row min-h-screen">
          <aside className="w-full md:w-64 bg-neutral-900 border-r border-gray-800 p-6 flex-shrink-0">
              <div className="flex items-center gap-3 mb-10 text-red-500">
                  <Shield size={32} /> <span className="font-bold text-2xl text-white">Admin</span>
              </div>
              <nav className="space-y-2">
                  <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Activity size={20}/> Overview</button>
                  <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Users size={20}/> Users</button>
                  <button onClick={() => setActiveTab('withdrawals')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'withdrawals' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><DollarSign size={20}/> Withdrawals</button>
                  <button onClick={() => setActiveTab('courses')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'courses' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Youtube size={20}/> Courses</button>
                  <button onClick={() => setActiveTab('broadcasts')} className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'broadcasts' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Radio size={20}/> Broadcasts</button>
              </nav>
              <div className="mt-auto pt-10"><button onClick={() => router.push('/dashboard')} className="text-gray-500 text-sm hover:text-white">&larr; Back to Dashboard</button></div>
          </aside>

          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
              
              {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-neutral-900 rounded-2xl border border-gray-800"><h3 className="text-4xl font-bold">{stats.totalUsers}</h3><p className="text-gray-400 text-xs uppercase font-bold">Total Users</p></div>
                      <div className="p-6 bg-neutral-900 rounded-2xl border border-gray-800"><h3 className="text-4xl font-bold text-green-500">₹{stats.totalRevenue.toLocaleString()}</h3><p className="text-gray-400 text-xs uppercase font-bold">Total Revenue</p></div>
                      <div className="p-6 bg-neutral-900 rounded-2xl border border-gray-800"><h3 className="text-4xl font-bold text-red-500">{stats.pendingWithdrawals}</h3><p className="text-gray-400 text-xs uppercase font-bold">Pending Payouts</p></div>
                  </div>
              )}

               {activeTab === 'users' && (
                  <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-gray-800">
                      <table className="w-full text-left text-sm whitespace-nowrap"><tbody className="divide-y divide-gray-800">{users.map(u => (
                          <tr key={u.id} className="hover:bg-white/5">
                              <td className="p-4 font-bold">{u.full_name} <div className="text-xs text-gray-500 font-normal">{u.email}</div></td>
                              <td className="p-4">₹{u.wallet_balance}</td>
                              <td className="p-4"><button onClick={() => handleToggleUserStatus(u.id, u.is_active)} className={`border px-3 py-1 rounded text-xs font-bold ${u.is_active ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>{u.is_active ? 'Deactivate' : 'Activate'}</button></td>
                          </tr>
                      ))}</tbody></table>
                  </div>
              )}

              {activeTab === 'withdrawals' && (
                   <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-gray-800">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black text-gray-400 uppercase text-xs font-bold border-b border-gray-800">
                            <tr><th className="p-4">User</th><th className="p-4">Amount</th><th className="p-4">Bank Details</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {withdrawals.map(req => (
                                <tr key={req.id} className="hover:bg-white/5">
                                    <td className="p-4 font-bold">{req.profiles?.full_name} <br/><span className="text-xs text-gray-500 font-normal">{req.profiles?.phone_number}</span></td>
                                    <td className="p-4 text-green-400 font-bold text-lg">₹{req.amount}</td>
                                    <td className="p-4">
                                        <div className="space-y-1.5">
                                            {req.profiles?.bank_holder_name && <div className="flex items-center gap-1.5 text-white font-bold text-xs"><User size={12} className="text-purple-400"/> {req.profiles.bank_holder_name}</div>}
                                            {req.profiles?.bank_account_no && <div className="flex items-center gap-1.5 text-blue-300 text-xs"><Landmark size={12}/> {req.profiles.bank_account_no}</div>}
                                            {req.profiles?.ifsc_code && <div className="text-gray-500 text-xs pl-5 font-mono">IFSC: {req.profiles.ifsc_code}</div>}
                                            {req.payout_upi && <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-900/10 px-2 py-0.5 rounded w-fit font-mono text-xs mt-1"><CreditCard size={12}/> UPI: {req.payout_upi}</div>}
                                            {!req.payout_upi && !req.profiles?.bank_account_no && <span className="text-red-500 text-xs italic">No Details</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {req.status === 'pending' ? <span className="text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span> 
                                        : req.status === 'paid' ? <span className="text-green-500 bg-green-900/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Paid</span>
                                        : <div className="flex flex-col"><span className="text-red-500 bg-red-900/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Ban size={12}/> Rejected</span><span className="text-[10px] text-red-400 mt-1">{req.rejection_reason}</span></div>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleRejectWithdrawal(req.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><XCircle size={18}/></button>
                                                <button onClick={() => clickApprove(req.id, req.amount, req.user_id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-green-900/20"><CheckCircle size={14}/> Approve</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {withdrawals.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No requests found.</td></tr>}
                        </tbody>
                    </table>
               </div>
              )}

              {activeTab === 'courses' && (
                  <div className="space-y-8">
                      <h1 className="text-2xl font-bold">Course Manager</h1>
                      <form onSubmit={handleAddCourse} className="bg-neutral-900 border border-gray-800 p-6 rounded-2xl space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input type="text" placeholder="Video Title" required className="bg-black border border-gray-700 p-3 rounded-lg w-full outline-none text-white" onChange={e => setNewCourse({...newCourse, title: e.target.value})} value={newCourse.title}/>
                              <input type="text" placeholder="YouTube Link (e.g. https://youtu.be/...)" required className="bg-black border border-gray-700 p-3 rounded-lg w-full outline-none text-white" onChange={e => setNewCourse({...newCourse, url: e.target.value})} value={newCourse.url}/>
                          </div>
                          <textarea placeholder="Description" className="bg-black border border-gray-700 p-3 rounded-lg w-full outline-none text-white" onChange={e => setNewCourse({...newCourse, desc: e.target.value})} value={newCourse.desc}></textarea>
                          <div className="flex items-center gap-3">
                              <input type="checkbox" id="pro" className="w-5 h-5 accent-red-600 cursor-pointer" checked={newCourse.is_pro} onChange={e => setNewCourse({...newCourse, is_pro: e.target.checked})}/>
                              <label htmlFor="pro" className="text-gray-300 cursor-pointer select-none">Pro Users Only? (Lock for Starter)</label>
                          </div>
                          <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-red-900/20">Upload Course</button>
                      </form>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {courses.map(course => (
                              <div key={course.id} className="bg-neutral-900 border border-gray-800 p-4 rounded-xl flex gap-4 hover:border-gray-700 transition-colors">
                                  <img src={`https://img.youtube.com/vi/${course.video_id}/mqdefault.jpg`} className="w-32 h-20 rounded-lg object-cover"/>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="font-bold line-clamp-1 text-white">{course.title}</h4>
                                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{course.description}</p>
                                      <div className="flex justify-between items-center mt-3">
                                          {course.is_pro && <span className="bg-yellow-900/30 text-yellow-500 text-[10px] px-2 py-0.5 rounded border border-yellow-700 font-bold">PRO ONLY</span>}
                                          <button onClick={() => clickDeleteCourse(course.id)} className="text-red-500 hover:text-white p-1 hover:bg-red-600/20 rounded transition-colors" title="Delete Video"><Trash2 size={16}/></button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {courses.length === 0 && <div className="text-gray-500 col-span-2 text-center py-10">No courses uploaded yet.</div>}
                      </div>
                  </div>
              )}

              {activeTab === 'broadcasts' && (
                  <div className="space-y-8">
                      <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="text-blue-500"/> Broadcast Hub</h1>
                      <p className="text-gray-400 text-sm mb-6">Send instant notifications to all active users on the platform.</p>
                      
                      <form onSubmit={handleSendBroadcast} className="bg-neutral-900 border border-gray-800 p-6 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                              <input type="text" placeholder="Notification Title (e.g., 🚨 Flash Sale!)" required className="bg-black border border-gray-700 p-3 rounded-lg w-full outline-none text-white focus:border-blue-500 transition-colors" onChange={e => setNewBroadcast({...newBroadcast, title: e.target.value})} value={newBroadcast.title}/>
                              
                              <select className="bg-black border border-gray-700 p-3 rounded-lg w-full outline-none text-white focus:border-blue-500 transition-colors" onChange={e => setNewBroadcast({...newBroadcast, type: e.target.value})} value={newBroadcast.type}>
                                  <option value="info">ℹ️ General Info</option>
                                  <option value="event">📅 Event / Webinar</option>
                                  <option value="offer">💰 Special Offer</option>
                                  <option value="success">✅ Good News</option>
                                  <option value="alert">⚠️ Urgent Alert</option>
                              </select>
                          </div>
                          
                          <textarea placeholder="Write your message here..." required rows={3} className="bg-black border border-gray-700 p-3 rounded-lg w-full outline-none text-white focus:border-blue-500 transition-colors relative z-10" onChange={e => setNewBroadcast({...newBroadcast, message: e.target.value})} value={newBroadcast.message}></textarea>
                          
                          <input type="url" placeholder="Optional Link (e.g., Google Meet URL or Promo Page)" className="bg-black border border-gray-700 p-3 rounded-lg w-full outline-none text-white focus:border-blue-500 transition-colors relative z-10 text-sm" onChange={e => setNewBroadcast({...newBroadcast, link: e.target.value})} value={newBroadcast.link}/>
                          
                          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 relative z-10 transition-colors">
                              <Send size={18}/> Send Broadcast Now
                          </button>
                      </form>

                      <div className="mt-10">
                          <h3 className="text-lg font-bold mb-4 text-gray-300">Recent Broadcasts</h3>
                          <div className="grid grid-cols-1 gap-4">
                              {pastBroadcasts.map(b => (
                                  <div key={b.id} className="bg-black/50 border border-gray-800 p-4 rounded-xl flex justify-between items-start hover:border-gray-700 transition-colors">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider
                                                  ${b.type === 'offer' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                                                    b.type === 'event' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' :
                                                    b.type === 'alert' ? 'bg-red-900/30 text-red-400 border border-red-800' : 
                                                    'bg-blue-900/30 text-blue-400 border border-blue-800'}`}>
                                                  {b.type}
                                              </span>
                                              <span className="text-xs text-gray-600">{new Date(b.created_at).toLocaleString()}</span>
                                          </div>
                                          <h4 className="font-bold text-white text-sm">{b.title}</h4>
                                          <p className="text-xs text-gray-400 mt-1">{b.message}</p>
                                          {b.link && <a href={b.link} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline mt-2 inline-block">Attached Link: {b.link}</a>}
                                      </div>
                                      <button onClick={() => clickDeleteBroadcast(b.id)} className="text-red-500/50 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-all" title="Delete from everyone's dashboard">
                                          <Trash2 size={16}/>
                                      </button>
                                  </div>
                              ))}
                              {pastBroadcasts.length === 0 && <div className="text-gray-600 text-sm text-center py-6 border border-dashed border-gray-800 rounded-xl">No broadcasts sent yet.</div>}
                          </div>
                      </div>
                  </div>
              )}

          </main>
      </div>
    </div>
  );
}