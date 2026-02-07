import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      user_id, 
      amount, 
      package_name 
    } = await req.json();

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    // Commission calculation (dynamic)
    const commission = Math.round(amount * 0.6);

    console.log("Payment route called:", razorpay_payment_id, user_id);

    // Call Supabase function
    const { data, error } = await supabase.rpc('handle_activation', {
      p_target_user_id: user_id,
      p_new_package_name: package_name,
      p_rzp_payment_id: razorpay_payment_id,
      p_commission_amount: commission
    });

    if (error) {
      console.error("Payment Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return Supabase function’s response (success or duplicate_skipped)
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
