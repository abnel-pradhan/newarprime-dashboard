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

    if (rpcError) {
        console.error("Database Error:", rpcError);
        return NextResponse.json({ success: false, error: "Database activation failed" }, { status: 500 });
    }

    // 5. THE AUTOMATION: Smart Notifications
    if (!rpcError && buyerProfile?.referred_by) {
        const sponsorId = buyerProfile.referred_by;
        const buyerName = buyerProfile.full_name?.split(' ')[0] || 'A new user';
        
        // 5a. Send In-App Bell Notification
        await supabase.from('notifications').insert({
            user_id: sponsorId,
            title: '🎉 Commission Earned!',
            message: `${buyerName} just activated their account. ₹${commission} has been added to your wallet!`,
            type: 'success',
            is_global: false
        });

        // 5b. Fetch Sponsor Details & Count their active referrals
        const { data: sponsorProfile } = await supabase
            .from('profiles')
            .select('full_name, email, alert_new_referral')
            .eq('id', sponsorId)
            .single();

        // Count how many ACTIVE users this sponsor has referred
        const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('referred_by', sponsorId)
            .eq('is_active', true);

        // 5c. Trigger the specific email (If they haven't disabled it in settings)
        if (sponsorProfile?.email && sponsorProfile.alert_new_referral !== false) {
            
            // If count is exactly 1, this was their very first sale!
            const isFirst = count === 1; 
            
            // Because this runs on the server, we have to tell it the exact website URL
            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://newarprime.in';

            fetch(`${baseUrl}/api/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: sponsorProfile.email,
                    userName: sponsorProfile.full_name,
                    type: isFirst ? 'first_referral' : 'new_referral',
                    subject: isFirst ? '🎉 You Got Your FIRST Referral!' : 'Cha-ching! 💸 New Referral Earned!'
                })
            }).catch(console.error); // We catch this silently so a failed email doesn't block the user's purchase
        }
    }

    // 6. Return Absolute Success
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("API Crash:", error);
    return NextResponse.json({ success: false, error: "Server verification failed" }, { status: 500 });
  }
}