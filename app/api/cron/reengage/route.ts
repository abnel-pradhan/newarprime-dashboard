import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  try {
    // 1. SECURITY: Ensure only Vercel can trigger this route
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized - Invalid Cron Secret', { status: 401 });
    }

    // 2. TIME WINDOW: Find exactly 7 days ago (Start to End of that day)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 7);
    
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

    // 3. FETCH TARGETS: Users who joined exactly 7 days ago
    const { data: usersToCheck, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (error || !usersToCheck || usersToCheck.length === 0) {
      return NextResponse.json({ message: "No target users found for today." });
    }

    let emailsSent = 0;
    const baseUrl = process.env.NODE_PUBLIC_SITE_URL || 'https://newarprime.in';

    // 4. CHECK REFERRALS & SEND
    for (const user of usersToCheck) {
      // Check if this specific user has 0 referrals
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', user.id);

      // If they have 0 referrals, shoot the Re-engagement email!
      if (count === 0 && user.email) {
        await fetch(`${baseUrl}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            userName: user.full_name?.split(' ')[0] || 'Partner',
            type: 'reengagement',
            subject: 'We miss you! 👋 Start earning today.'
          })
        }).catch(console.error);
        
        emailsSent++;
      }
    }

    return NextResponse.json({ success: true, targetsChecked: usersToCheck.length, emailsSent });

  } catch (error: any) {
    console.error("Cron Crash:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}