import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({ userName }) => (
  <div style={{
    fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
    backgroundColor: '#050505',
    color: '#ffffff',
    padding: '40px 20px',
    textAlign: 'center',
  }}>
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#0a0a0a',
      borderRadius: '24px',
      border: '1px solid #333',
      padding: '40px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    }}>
      {/* Logo Placeholder - You can add your logo URL here later */}
      <div style={{ marginBottom: '30px' }}>
        <span style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          letterSpacing: '1px',
          color: '#9333ea' 
        }}>NEWARPRIME</span>
      </div>

      <h1 style={{ 
        color: '#ffffff', 
        fontSize: '32px', 
        fontWeight: '800', 
        marginBottom: '20px',
        lineHeight: '1.2'
      }}>
        Welcome to the <span style={{ color: '#9333ea' }}>Elite</span>, {userName}! 🚀
      </h1>

      <p style={{ 
        fontSize: '16px', 
        lineHeight: '1.6', 
        color: '#a1a1aa',
        marginBottom: '30px' 
      }}>
        You’ve just taken the first step toward mastering high-income digital skills. We’re excited to have you in the NewarPrime community.
      </p>

      <div style={{
        backgroundColor: '#161616',
        borderRadius: '16px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid #9333ea33'
      }}>
        <h3 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '18px' }}>Next Steps:</h3>
        <ul style={{ 
          textAlign: 'left', 
          color: '#a1a1aa', 
          fontSize: '14px',
          paddingLeft: '20px',
          margin: 0
        }}>
          <li style={{ marginBottom: '8px' }}>Complete your <strong>Payout Details</strong> in Settings.</li>
          <li style={{ marginBottom: '8px' }}>Access your <strong>Learning Hub</strong> to start training.</li>
          <li style={{ marginBottom: '8px' }}>Share your affiliate link to start earning.</li>
        </ul>
      </div>

      <a href="https://newarprime.in/dashboard" style={{
        display: 'inline-block',
        backgroundColor: '#9333ea',
        color: '#ffffff',
        padding: '16px 40px',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
        boxShadow: '0 10px 20px rgba(147, 51, 234, 0.3)'
      }}>
        Launch Dashboard
      </a>

      <p style={{ 
        fontSize: '12px', 
        color: '#555', 
        marginTop: '40px',
        borderTop: '1px solid #222',
        paddingTop: '20px'
      }}>
        If you have any questions, simply reply to this email. We're here to help you grow.<br />
        © 2026 NewarPrime • India's Elite E-Learning Platform
      </p>
    </div>
  </div>
);