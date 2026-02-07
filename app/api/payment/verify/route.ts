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

    // 1. Verify Signature (Security Check)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    // 2. Calculate Commission (Logic: Pro = 300, Starter = 120)
    // Note: Ensure your frontend sends the correct package price (e.g., 499 or 199)
    let commission = 0;
    if (amount > 400) commission = 300; 
    else commission = 120; 

    // 3. CALL THE SECURE DATABASE FUNCTION
    // We send the data to Supabase. Supabase handles the locking and receipts.
    const { data, error } = await supabase
      .rpc('handle_activation', {
        p_target_user_id: user_id,
        p_new_package_name: package_name,
        p_rzp_payment_id: razorpay_payment_id,
        p_commission_amount: commission
      });

    if (error) {
        console.error("Payment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Return Success
    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
