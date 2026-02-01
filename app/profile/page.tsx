'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Camera, Copy, Edit2, Shield, Zap, Save, ArrowLeft, Lock, Loader2, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editable Fields
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  // Non-editable field
  const [username, setUsername] = useState(''); 

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch Profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If username is missing, generate one on the fly (failsafe)
      if (data && !data.username) {
         const newCode = `USER${Math.floor(1000 + Math.random() * 9000)}`;
         await supabase.from('profiles').update({ username: newCode }).eq('id', user.id);
         data.username = newCode;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setUsername(data.username || 'Generating...'); // Should be fixed now
        setBio(data.bio || '');
      }
      setLoading(false);
    };

    getData();
  }, []);

  // 1. Handle Image Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile({ ...profile, avatar_url: publicUrl });
      alert('✅ Profile photo updated!');
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };


  // 2. Handle Text Save
  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      // username is NOT updated here. It's fixed.
      bio: bio,
    }).eq('id', user.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✅ Profile details updated successfully!");
      setProfile({ ...profile, full_name: fullName, bio: bio });
    }
    setSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! 📋");
  };

  // Loading Skeleton
  if (loading) return (
    <div className="min-h-screen bg-black text-white p-8 flex justify-center">
        <div className="max-w-4xl w-full animate-pulse space-y-8">
            <div className="h-8 bg-neutral-800 w-1/3 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-96 bg-neutral-900 rounded-3xl"></div>
                <div className="md:col-span-2 space-y-6">
                    <div className="h-64 bg-neutral-900 rounded-3xl"></div>
                    <div className="h-64 bg-neutral-900 rounded-3xl"></div>
                </div>
            </div>
        </div>
    </div>
  );

  // Determine Package Color
  const isPro = profile?.package_name?.includes('Pro');

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-neutral-800/50 backdrop-blur-md rounded-full hover:bg-neutral-700 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Identity Card */}
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl group">
            {/* Background decoration */}
            <div className={`absolute top-0 left-0 w-full h-40 ${isPro ? 'bg-gradient-to-b from-yellow-600/30' : 'bg-gradient-to-b from-blue-600/30'} to-transparent opacity-50 transition-all group-hover:opacity-70`}></div>
            
            <div className="relative mt-4">
               {/* Avatar Circle */}
               <div className="w-40 h-40 mx-auto bg-gradient-to-br from-gray-700 via-gray-900 to-black rounded-full p-1 shadow-2xl relative group-hover:scale-[1.02] transition-transform">
                  <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden relative">
                     {uploading ? (
                         <Loader2 size={40} className="animate-spin text-purple-500" />
                     ) : profile?.avatar_url ? (
                         <img src={profile.avatar_url + '?t=' + Date.now()} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                         <span className="text-5xl font-bold text-gray-600">{fullName.charAt(0) || 'U'}</span>
                     )}
                     
                  </div>
                  
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {/* Edit Photo Button (Working!) */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-1 right-1 p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg border-4 border-neutral-900 disabled:opacity-50"
                  >
                      {uploading ? <UploadCloud size={18} className="animate-pulse"/> : <Camera size={18} />}
                  </button>
               </div>
            </div>

            <h2 className="text-2xl font-bold mt-6 truncate">{fullName || 'Member'}</h2>
            <p className="text-gray-400 text-sm truncate">{user.email}</p>

            {/* PACKAGE BADGE */}
            <div className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-md shadow-lg ${isPro ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400' : 'bg-blue-900/30 border-blue-500/50 text-blue-400'}`}>
                {isPro ? <Zap size={18} fill="currentColor" /> : <Shield size={18} />}
                <span className="font-bold tracking-wider text-sm">{profile?.package_name || 'Standard'} Member</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings & Short Code */}
          <div className="md:col-span-2 space-y-8">
            
            {/* 1. THE LOCKED SHORT CODE SECTION */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-purple-400">
                    <Zap size={24} /> Affiliate Assets
                </h3>
                
                <div className="grid gap-6">
                    {/* Unique Referral Code (LOCKED) */}
                    <div>
                        <label className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                            <Lock size={14} className="text-purple-500" /> My Unique ID (Fixed)
                        </label>
                        <div className="flex gap-2 relative group">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-4 text-purple-500 font-bold">#</span>
                                <input 
                                    type="text" 
                                    value={username}
                                    readOnly // Cannot edit
                                    className="w-full bg-black/60 border border-purple-500/30 rounded-xl p-4 pl-10 font-mono text-xl tracking-[0.2em] text-white focus:border-purple-500 outline-none uppercase cursor-not-allowed shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                                />
                                <div className="absolute right-4 top-4 text-gray-600 group-hover:text-purple-400 transition-colors">
                                    <Lock size={20} />
                                </div>
                            </div>
                            <button onClick={() => copyToClipboard(username)} className="p-4 bg-neutral-800/80 border border-gray-700 rounded-xl hover:bg-purple-600/20 hover:border-purple-500/50 transition-all active:scale-95">
                                <Copy size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Referral Link Display */}
                    <div>
                        <label className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-3 block">My Referral Link</label>
                        <div className="flex gap-2 items-center bg-black/60 border border-gray-700 rounded-xl p-2 pl-4">
                            <p className="flex-1 text-gray-400 text-sm truncate font-mono">
                                {typeof window !== 'undefined' ? window.location.origin : ''}/register?ref={username}
                            </p>
                            <button onClick={() => copyToClipboard(`${window.location.origin}/register?ref=${username}`)} className="py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-500 hover:to-blue-500 text-sm font-bold shadow-lg active:scale-95 transition-all">
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PERSONAL DETAILS FORM */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                 <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Edit2 size={24} /> Edit Profile
                </h3>
                
                <div className="space-y-5">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Full Name</label>
                        <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-black/60 border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all focus:ring-2 focus:ring-purple-500/20"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Bio / Tagline</label>
                        <input 
                            type="text" 
                            value={bio}
                            placeholder="e.g. Digital Entrepreneur 🚀"
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-black/60 border border-gray-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}