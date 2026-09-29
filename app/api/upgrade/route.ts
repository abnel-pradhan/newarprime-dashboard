import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with the ADMIN key to bypass RLS for secure backend updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming request from your frontend or payment gateway
    // buyerId = User B (the one upgrading), amountPaid = 199 or 499, newPlan = 'starter'
    const { buyerId, amountPaid, newPlan } = await req.json();

    // 2. Fetch User B's details to see if someone referred them
    const { data: userB, error: userBError } = await supabaseAdmin
      .from('users')
      .select('referred_by')
      .eq('id', buyerId)
      .single();

    if (userBError) throw new Error('User not found');

    const referrerId = userB.referred_by; // This is User A

    // 3. Upgrade User B's account
    await supabaseAdmin
      .from('users')
      .update({ current_plan: newPlan, plan_expires_at: null }) // Remove expiration for paid tiers
      .eq('id', buyerId);

    // 4. Process Delayed Commission for User A (if they exist)
    if (referrerId) {
      // Fetch User A's current status
      const { data: userA } = await supabaseAdmin
        .from('users')
        .select('current_plan, plan_expires_at')
        .eq('id', referrerId)
        .single();

      if (userA) {
        let commissionRate = 0;
        let isEligible = true;

        // Check tier and expiration logic
        if (userA.current_plan === 'free') {
          const expirationDate = new Date(userA.plan_expires_at);
          const now = new Date();
          
          if (expirationDate < now) {
            isEligible = false; // User A's free trial expired, they lose the commission
          } else {
            commissionRate = 0.50; // 50% for active free users
          }
        } else if (userA.current_plan === 'starter') {
          commissionRate = 0.60;
        } else if (userA.current_plan === 'growth') {
          commissionRate = 0.70;
        }

        // 5. Credit the commission if eligible
        if (isEligible && commissionRate > 0) {
          const commissionAmount = amountPaid * commissionRate;

          // Insert the earnings record into your commissions table
          await supabaseAdmin
            .from('commissions')
            .insert({
              referrer_id: referrerId,
              buyer_id: buyerId,
              package_bought: newPlan,
              amount: commissionAmount,
              status: 'pending_payout'
            });

          // Optional: You can also call a Supabase RPC here to increment User A's total wallet balance atomically.
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Upgrade and commission processed' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}