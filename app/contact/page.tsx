import { Mail, MapPin, Instagram, Youtube, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="relative py-24 bg-neutral-900/30 border-b border-gray-800">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-widest uppercase mb-6">
                <MessageCircle size={14} /> 24/7 Support
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Touch</span>
            </h1>
            <p className="text-xl text-gray-400">Have questions? We'd love to hear from you.</p>
        </div>
      </div>

      {/* CONTACT GRID */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Email Card */}
            <div className="p-8 bg-neutral-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl hover:border-purple-500 transition-all group">
                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                    <Mail size={24} className="text-gray-300 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Support</h3>
                <p className="text-gray-400 text-sm mb-4">For general inquiries & account help.</p>
                <a href="mailto:support@newarprime.com" className="text-purple-400 font-bold hover:underline">newarprime@gmail.com</a>
            </div>

            {/* 2. Instagram Card */}
            <a href="https://www.instagram.com/newarprime?igsh=NGllb2hrdDdlOWlj" target="_blank" className="p-8 bg-neutral-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl hover:border-pink-500 transition-all group">
                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-tr group-hover:from-purple-500 group-hover:to-pink-500 transition-all">
                    <Instagram size={24} className="text-gray-300 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instagram</h3>
                <p className="text-gray-400 text-sm mb-4">Follow us for daily updates & tips.</p>
                <span className="text-pink-400 font-bold group-hover:text-pink-300">@NewarPrimeOfficial &rarr;</span>
            </a>

            {/* 3. YouTube Card */}
            <a href="https://youtube.com/@YOUR_CHANNEL" target="_blank" className="p-8 bg-neutral-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl hover:border-red-500 transition-all group">
                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                    <Youtube size={24} className="text-gray-300 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">YouTube</h3>
                <p className="text-gray-400 text-sm mb-4">Watch free training videos.</p>
                <span className="text-red-400 font-bold group-hover:text-red-300">Subscribe Now &rarr;</span>
            </a>
            
        </div>

        {/* Bottom Address Section */}
        <div className="mt-12 p-8 rounded-3xl bg-neutral-900/30 border border-gray-800 flex items-start gap-4">
            <MapPin className="text-gray-500 mt-1" size={24} />
            <div>
                <h3 className="text-lg font-bold mb-1">Headquarters</h3>
                <p className="text-gray-400">NewarPrime HQ, Gangtok, Sikkim, India</p>
            </div>
        </div>

      </div>
    </div>
  );
}