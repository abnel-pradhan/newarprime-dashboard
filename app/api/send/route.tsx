import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userName, type, subject, amount, reason } = body;

    if (!email) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
    }

    let finalHtml = '';
    
    // ✅ 1. FIRST REFERRAL CELEBRATION
    if (type === 'first_referral') {
      finalHtml = `
        <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; border: 1px solid #9333ea; border-radius: 20px;">
          <h1 style="color: #9333ea;">🎉 You Got Your FIRST Referral!</h1>
          <p>Congratulations ${userName || 'Partner'}!</p>
          <p>You have officially made your first successful referral on NewarPrime. This is a massive milestone.</p>
          <p style="background: #1a1a1a; padding: 15px; border-radius: 10px; border: 1px solid #333;">
            You now know the system works. Keep sharing your link and watch your daily income grow!
          </p>
          <a href="https://newarprime.in/dashboard" style="display: inline-block; background: #9333ea; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 20px;">View Your Earnings</a>
        </div>
      `;
    } 
    // ✅ 2. RE-ENGAGEMENT / CALLBACK EMAIL
    else if (type === 'reengagement') {
      finalHtml = `
        <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; border: 1px solid #3b82f6; border-radius: 20px;">
          <h1 style="color: #3b82f6;">We miss you, ${userName}! 👋</h1>
          <p>We noticed you haven't gotten your first referral yet, and we want to help you start earning.</p>
          <p>Thousands of students are making a daily income using NewarPrime. All it takes is sharing your link with the right strategy.</p>
          <ul style="color: #a1a1aa; line-height: 1.6;">
            <li>Log in and watch the training courses.</li>
            <li>Share your link on Instagram and WhatsApp status.</li>
            <li>Consistency is key!</li>
          </ul>
          <a href="https://newarprime.in/dashboard" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 20px;">Log In & Learn</a>
        </div>
      `;
    }
    // 3. APPROVED TEMPLATE
    else if (type === 'withdrawal_approved') {
      finalHtml = `
        <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; border: 1px solid #22c55e; border-radius: 20px;">
          <h1 style="color: #22c55e;">Payment Sent! 💸</h1>
          <p>Hello ${userName},</p>
          <p>Good news! Your withdrawal request for <strong>₹${amount}</strong> has been approved and successfully processed.</p>
          <p style="color: #a1a1aa; font-size: 14px;">Please check your bank account or UPI app. It may take a few hours to reflect depending on your bank.</p>
        </div>
      `;
    } 
    // 4. REJECTED TEMPLATE
    else if (type === 'withdrawal_rejected') {
      finalHtml = `
        <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; border: 1px solid #ef4444; border-radius: 20px;">
          <h1 style="color: #ef4444;">Action Required: Withdrawal Issue ⚠️</h1>
          <p>Hello ${userName},</p>
          <p>Unfortunately, your recent withdrawal request for <strong>₹${amount}</strong> could not be processed.</p>
          <div style="background-color: #1a1a1a; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #ff8a8a; font-weight: bold;">Reason for Rejection:</p>
            <p style="margin: 5px 0 0 0;">${reason}</p>
          </div>
          <p style="color: #a1a1aa; font-size: 14px;">Please correct the issue and submit a new withdrawal request from your dashboard.</p>
        </div>
      `;
    } 
    else {
      finalHtml = await render(<WelcomeEmail userName={userName || 'User'} />);
    }

    const { data, error } = await resend.emails.send({
      from: 'NewarPrime <updates@newarprime.in>',
      to: [email],
      subject: subject || 'NewarPrime Update',
      html: finalHtml,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, id: data?.id });

  } catch (error: any) {
    console.error("Route Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}