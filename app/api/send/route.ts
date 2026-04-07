import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userName, type, subject } = body;

    if (!email) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
    }

    let finalHtml = '';
    
    if (type === 'new_referral') {
      finalHtml = `
        <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; border: 1px solid #333; border-radius: 20px;">
          <h1 style="color: #9333ea;">Cha-ching! 💸</h1>
          <p>Hello ${userName || 'Partner'},</p>
          <p>Great news! Someone just joined NewarPrime using your referral link.</p>
          <a href="https://newarprime.in/dashboard" style="color: #9333ea; font-weight: bold;">View your earnings</a>
        </div>
      `;
    } else {
      const welcomeComponent = await WelcomeEmail({ userName: userName || 'User' });
      finalHtml = await render(welcomeComponent);
    }

    const { data, error } = await resend.emails.send({
      from: 'NewarPrime <updates@newarprime.in>',
      to: [email],
      subject: subject || 'Welcome to NewarPrime! 🚀',
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