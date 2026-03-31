'use client';
import { Code, Briefcase, PlaySquare, TrendingUp, Linkedin, Twitter, Mail } from 'lucide-react';

export default function TeamSection() {
  const teamMembers = [
    {
      name: "Abnel Pradhan",
      role: "Founder & CEO",
      description: "The architectural mind behind NewarPrime. Abnel leads the technical development, platform security, and overall strategic vision of the company, ensuring a flawless, high-speed experience.",
      icon: Code,
      glowColor: "group-hover:shadow-[0_0_30px_rgba(147,51,234,0.3)]",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      image: "https://ui-avatars.com/api/?name=Abnel+Pradhan&background=0d0d0d&color=a855f7&size=256" 
    },
    {
      name: "Your Friend", // Replace with real name
      role: "Co-Founder & COO",
      description: "The operational engine of the platform. Conceptualized the NewarPrime model and currently manages our financial infrastructure, payment gateways, and seamless payout systems.",
      icon: Briefcase,
      glowColor: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      image: "https://ui-avatars.com/api/?name=Co+Founder&background=0d0d0d&color=3b82f6&size=256"
    },
    {
      name: "Content Lead", // Replace with real name
      role: "Chief Content Officer",
      description: "The voice and educator of our community. Designs and produces all premium training materials, guiding our users from beginners to top-tier affiliate marketers with high-conversion strategies.",
      icon: PlaySquare,
      glowColor: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]",
      iconColor: "text-pink-400",
      iconBg: "bg-pink-500/10 border-pink-500/20",
      image: "https://ui-avatars.com/api/?name=Content+Lead&background=0d0d0d&color=ec4899&size=256"
    },
    {
      name: "Lead Investor", // Replace with real name
      role: "Strategic Advisor",
      description: "The financial force accelerating our growth. Drives our user acquisition strategy and oversees our marketing capital, ensuring NewarPrime scales rapidly across the digital landscape.",
      icon: TrendingUp,
      glowColor: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      image: "https://ui-avatars.com/api/?name=Lead+Investor&background=0d0d0d&color=10b981&size=256"
    }
  ];

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold tracking-wider text-purple-400 uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            The Core Team
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Meet the minds behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">NewarPrime.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            A dedicated team of developers, marketers, and strategists working around the clock to build India's most powerful affiliate network.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => {
            const Icon = member.icon;
            return (
              <div 
                key={index} 
                className={`group relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04] ${member.glowColor}`}
              >
                {/* Image Container */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="relative w-full h-full object-cover rounded-2xl border border-white/10 shadow-xl grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                  />
                  {/* Floating Icon */}
                  <div className={`absolute -bottom-3 -right-3 p-2 rounded-xl border backdrop-blur-md ${member.iconBg}`}>
                    <Icon size={16} className={member.iconColor} />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className={`text-sm font-bold uppercase tracking-wider mb-4 ${member.iconColor}`}>
                    {member.role}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 h-28 overflow-hidden">
                    {member.description}
                  </p>

                  {/* Social Links (Optional placeholders) */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/5">
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Twitter size={16} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Linkedin size={16} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Mail size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}