import { ScrollText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="relative py-20 bg-neutral-900/30 border-b border-gray-800">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
                <Scale size={14} /> Legal Agreement
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Conditions</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">Please read these terms carefully before using our platform.</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        
        {/* Card 1 */}
        <div className="p-8 bg-neutral-900/50 border border-gray-800 rounded-3xl border-l-4 border-l-blue-500">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-3">
                <CheckCircle className="text-blue-500" size={20} /> 1. Acceptance of Terms
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
                By accessing NewarPrime, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
            </p>
        </div>

        {/* Card 2 */}
        <div className="p-8 bg-neutral-900/50 border border-gray-800 rounded-3xl border-l-4 border-l-purple-500">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-3">
                <ScrollText className="text-purple-500" size={20} /> 2. Affiliate Program Rules
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
                Users can earn commissions by referring others. However, unethical practices such as spamming, misleading claims, or self-referrals (using your own link to buy) are strictly prohibited and will result in an immediate account ban.
            </p>
        </div>

        {/* Card 3 (Warning Style) */}
        <div className="p-8 bg-red-900/10 border border-red-900/30 rounded-3xl border-l-4 border-l-red-500">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-3 text-white">
                <AlertTriangle className="text-red-500" size={20} /> 3. Refund Policy
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
                All sales are final. Since we provide digital access to courses and software immediately upon purchase, we do not offer refunds. Please ensure you are committed before making a payment.
            </p>
        </div>

      </div>
    </div>
  );
}