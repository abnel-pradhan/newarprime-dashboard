import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient'; // Make sure this path is correct for your project

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      user_id, 
      amount, 
      package_name 
    } = body;

    // 1. Verify Signature (Security Check)
    const secret = process.env.RAZORPAY_KEY_SECRET; // Ensure this is in your .env.local
    if (!secret) return NextResponse.json({ error: "Server Misconfiguration: No Secret Key" }, { status: 500 });

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid Payment Signature" }, { status: 400 });
    }

    // 2. Activate the User
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_active: true, 
        package_name: package_name 
      })
      .eq('id', user_id);

    if (updateError) throw updateError;

    // 3. Find the Sponsor (Who referred this user?)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('referred_by')
      .eq('id', user_id)
      .single();

    if (userProfile?.referred_by) {
      // 4. Calculate Commission (60%)
      // If package is 499 -> Comm is 300. If 199 -> Comm is 120.
      const commission = amount > 400 ? 300 : 120;

      // 5. Pay the Sponsor (Atomic Update)
      // We assume the sponsor has columns: wallet_balance, total_earnings
      
      // First, get current balance
      const { data: sponsor } = await supabase
        .from('profiles')
        .select('wallet_balance, total_earnings, id')
        .eq('id', userProfile.referred_by)
        .single();
      
      if (sponsor) {
        const newWallet = (sponsor.wallet_balance || 0) + commission;
        const newTotal = (sponsor.total_earnings || 0) + commission;

        await supabase
          .from('profiles')
          .update({ 
            wallet_balance: newWallet, 
            total_earnings: newTotal 
          })
          .eq('id', sponsor.id);
          
        console.log(`✅ Commission of ₹${commission} sent to Sponsor: ${sponsor.id}`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}