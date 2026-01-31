import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, amount, package_name } = await request.json();

    // 1. Verify Signature (Security Check)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    // 2. Mark Payment as Paid in Database
    const { error: paymentError } = await supabase.from('payments').insert([{
      user_id: user_id,
      amount: amount,
      transaction_id: razorpay_payment_id,
      status: 'paid'
    }]);

    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 });

    // 3. Activate User Profile
    await supabase.from('profiles').update({ 
      is_active: true, 
      package_name: package_name 
    }).eq('id', user_id);

    // 4. DISTRIBUTE COMMISSION (The Missing Part!)
    // Get the new user's referrer
    const { data: newUser } = await supabase.from('profiles').select('referred_by').eq('id', user_id).single();

    if (newUser && newUser.referred_by) {
      const referrerId = newUser.referred_by;
      const commissionAmount = amount * 0.60; // 60% Commission

      // Get Referrer's Current Balance
      const { data: referrerWallet } = await supabase.from('profiles').select('wallet_balance').eq('id', referrerId).single();

      if (referrerWallet) {
        const newBalance = (referrerWallet.wallet_balance || 0) + commissionAmount;
        
        // Update Referrer's Wallet
        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', referrerId);
        
        console.log(`Commission of ₹${commissionAmount} sent to ${referrerId}`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
  }
}