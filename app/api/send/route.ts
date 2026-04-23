import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userName, type, subject, amount, reason } = body;

    let htmlContent = '';

    // 1. WELCOME EMAIL TEMPLATE
    if (type === 'welcome') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #9333ea;">Welcome to NewarPrime, ${userName}! 🚀</h2>
            <p>We are thrilled to have you join our elite affiliate platform.</p>
            <p>To get started, simply log in to your dashboard, activate your package, and start sharing your unique referral link to earn daily commissions!</p>
            <br/>
            <p>Happy Earning,</p>
            <p><strong>The NewarPrime Team</strong></p>
        </div>
      `;
    } 
    
    // 2. WITHDRAWAL APPROVED TEMPLATE
    else if (type === 'withdrawal_approved') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #16a34a;">Payment Approved! 💸</h2>
            <p>Hi ${userName},</p>
            <p>Great news! Your withdrawal request for <strong>₹${amount}</strong> has been successfully verified and processed by our admin team.</p>
            <p>The funds should reflect in your bank/UPI account shortly.</p>
            <br/>
            <p>Keep up the great work,</p>
            <p><strong>The NewarPrime Team</strong></p>
        </div>
      `;
    } 
    
    // 3. WITHDRAWAL REJECTED TEMPLATE
    else if (type === 'withdrawal_rejected') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #dc2626;">Action Required ⚠️</h2>
            <p>Hi ${userName},</p>
            <p>Unfortunately, your recent withdrawal request for <strong>₹${amount}</strong> has been declined.</p>
            <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0;">
                <p style="margin: 0; color: #991b1b;"><strong>Reason from Admin:</strong> ${reason}</p>
            </div>
            <p>Please log in to your dashboard to review your account details or contact support if you need assistance.</p>
            <br/>
            <p>Regards,</p>
            <p><strong>The NewarPrime Team</strong></p>
        </div>
      `;
    }

    // Send the email using Resend
    const data = await resend.emails.send({
      from: 'NewarPrime <support@newarprime.in>', // ⚠️ SEE STEP 2 BELOW!
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}