import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="relative py-20 bg-neutral-900/30 border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-bold tracking-widest uppercase mb-6">
                <Shield size={14} /> Official Policy
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Policy</span>
            </h1>
            <p className="text-gray-400">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        
        {/* Section 1 */}
        <div className="p-8 bg-neutral-900/50 border border-gray-800 rounded-3xl hover:border-green-500/30 transition-colors">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><Eye size={20} /></div>
                1. Information We Collect
            </h2>
            <p className="text-gray-400 leading-relaxed pl-14">
                We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you register for an account. We believe in transparency and only ask for what is strictly necessary.
            </p>
        </div>

        {/* Section 2 */}
        <div className="p-8 bg-neutral-900/50 border border-gray-800 rounded-3xl hover:border-green-500/30 transition-colors">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><FileText size={20} /></div>
                2. How We Use Data
            </h2>
            <p className="text-gray-400 leading-relaxed pl-14">
                We use your information to facilitate payments, track affiliate commissions, and provide customer support. Your data helps us improve the NewarPrime experience and ensure you get paid on time.
            </p>
        </div>

        {/* Section 3 */}
        <div className="p-8 bg-neutral-900/50 border border-gray-800 rounded-3xl hover:border-green-500/30 transition-colors">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><Lock size={20} /></div>
                3. Security & Protection
            </h2>
            <p className="text-gray-400 leading-relaxed pl-14">
                We use industry-standard security measures (like SSL encryption) to protect your data. We do not sell, trade, or rent your personal identification information to others. Your privacy is our priority.
            </p>
        </div>

      </div>
    </div>
  );
}