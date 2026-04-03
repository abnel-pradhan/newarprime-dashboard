import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient'; 

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const data = JSON.parse(bodyText);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, amount, package_name } = data;

    // 1. Verify Signature (Security Check)
    const secret = process.env.RAZORPAY_KEY_SECRET; 
    if (!secret) return NextResponse.json({ success: false, error: "Server Misconfiguration: No Secret Key" }, { status: 500 });

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Fetch Buyer Details (To figure out who referred them)
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('full_name, referred_by')
      .eq('id', user_id)
      .single();

    // 3. Calculate exact commission
    const commission = amount > 400 ? 300 : 120; 

    // 4. CALL THE SECURE DATABASE FUNCTION (The Safety Lock)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('handle_activation', {
        p_target_user_id: user_id,
        p_new_package_name: package_name,
        p_rzp_payment_id: razorpay_payment_id,
        p_commission_amount: commission
      });

    // If the database complains, catch it cleanly
    if (rpcError) {
        console.error("Database Error:", rpcError);
        return NextResponse.json({ success: false, error: "Database activation failed" }, { status: 500 });
    }

    // 5. THE AUTOMATION: Send Notification to the Referrer
    // If the database update succeeded AND this user was referred by someone...
    if (!rpcError && buyerProfile?.referred_by) {
        // Grab their first name so it looks personal
        const buyerName = buyerProfile.full_name?.split(' ')[0] || 'A new user';
        
        await supabase.from('notifications').insert({
            user_id: buyerProfile.referred_by,
            title: '🎉 Commission Earned!',
            message: `${buyerName} just activated their account. ₹${commission} has been added to your wallet!`,
            type: 'success',
            is_global: false
        });
    }

    // 6. Return Absolute Success
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("API Crash:", error);
    return NextResponse.json({ success: false, error: "Server verification failed" }, { status: 500 });
  }
}