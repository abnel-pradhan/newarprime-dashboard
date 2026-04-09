'use client';
import { 
  ArrowLeft, Users, Briefcase, Mail, Linkedin, Instagram 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ✅ Imported useRouter
import { toast } from 'react-hot-toast'; 

// --- TEAM MEMBER CARD COMPONENT ---
interface TeamMember {
  name: string;
  title: string;
  imageUrl: string; 
  bio: string;
  socials?: {
    email?: string;
    linkedin?: string;
    instagram?: string; 
  };
}

function TeamCard({ member }: { member: TeamMember }) {
  
  // Copy email to clipboard instead of opening Outlook
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard!");
  };

  return (
    <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 text-center shadow-xl flex flex-col items-center hover:border-purple-500 transition-colors group">
      {/* Team Photo */}
      <img 
        src={member.imageUrl} 
        alt={member.name} 
        className="w-40 h-40 rounded-xl object-cover grayscale mb-6 group-hover:grayscale-0 transition-all shadow-md shadow-black/20" 
      />
      
      {/* Name and Title */}
      <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1">{member.name}</h3>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6 flex items-center gap-1.5 justify-center">
        <Briefcase size={14}/> {member.title}
      </p>
      
      {/* Short Bio */}
      <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 px-4">
        {member.bio}
      </p>
      
      {/* Social Links */}
      {member.socials && (
        <div className="flex gap-4 justify-center pt-4 border-t border-gray-800 w-full mt-auto">
          {member.socials.email && (
            <button 
              onClick={() => handleCopyEmail(member.socials!.email!)} 
              className="text-gray-600 hover:text-white transition-colors"
              title="Copy Email Address"
            >
              <Mail size={20}/>
            </button>
          )}
          {member.socials.linkedin && (
            <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-white transition-colors">
              <Linkedin size={20}/>
            </a>
          )}
          {member.socials.instagram && (
            <a href={member.socials.instagram} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-white transition-colors">
              <Instagram size={20}/>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const router = useRouter(); // ✅ Initialized the router

  // --- TEAM DATA ---
  const teamMembers: TeamMember[] = [
    {
      name: 'ABNEL PRADHAN',
      title: 'FOUNDER AND CHIEF TECH OFFICER',
      imageUrl: '/team/abnel.png', 
      bio: 'Abnel is the technical visionary behind NewarPrime, building the platform from scratch with a passion for clean code and secure architecture. He leads our engineering efforts to deliver a seamless user experience.',
      socials: { email: 'abnelpradhan7@gmail.com', linkedin: 'https://www.linkedin.com/in/abnel-pradhan' }
    },
    {
      name: 'UTAM PRADHAN',
      title: 'CO-FOUNDER & CHIEF EXECUTIVE OFFICER',
      imageUrl: '/team/utam.jpeg', 
      bio: 'Utam is the driving force behind NewarPrime\'s business strategy and growth. With a keen eye for market trends, he leads the company towards achieving its mission of empowering people through digital skills.',
      socials: { email: 'Utampradhan535@gmail.com', linkedin: 'https://www.linkedin.com/in/utam-pradhan-5557243ba?utm_source=share_via&utm_content=profile&utm_medium=member_android' }
    },
    {
      name: 'SHARWAN SUBBA',
      title: 'CHIEF MARKETING OFFICER AND LEAD TRAINER',
      imageUrl: '/team/sharwan.jpeg', 
      bio: 'Sharwan is a master of digital marketing and sales. He leads our marketing campaigns and is the principal instructor for our premium e-learning courses, sharing his years of field experience.',
      socials: { email: 'Xrawanlimbu21@gmail.com', linkedin: 'https://www.linkedin.com/in/xrawan-limbu-370206402?utm_source=share_via&utm_content=profile&utm_medium=member_android' }
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden pb-20">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/15 to-black -z-10"></div>
      
      {/* NAVBAR */}
      <nav className="relative px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-black/50 backdrop-blur-md">
          {/* ✅ Swapped <Link> for a dynamic <button> */}
          <button onClick={() => router.back()} className="p-2 bg-neutral-900 border border-gray-800 rounded-full text-white hover:bg-neutral-800 transition-colors">
              <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-gray-800" />
            <span className="font-bold text-lg">My Team</span>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wide mb-3 shadow-lg">
            <Users size={14} /> MEET OUR TEAM
          </div>
          <h1 className="text-5xl font-black mb-6 text-white tracking-tighter">NEWAR PRIME</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
             We are a passionate team dedicated to empowering individuals across India to achieve financial independence through digital skill-building and a robust affiliate ecosystem.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </main>
    </div>
  );
}