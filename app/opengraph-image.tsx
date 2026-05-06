import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NewarPrime | Elite Affiliate Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #4c1d95 0%, #000000 70%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Glow Effect Top Left */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: '#9333ea', filter: 'blur(100px)', opacity: 0.5, borderRadius: '50%' }} />
        {/* Glow Effect Bottom Right */}
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: '#2563eb', filter: 'blur(100px)', opacity: 0.5, borderRadius: '50%' }} />

        {/* Logo Text (Since we can't easily load your image file here, we use styled text) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', zIndex: 10 }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(to right, #9333ea, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '30px', fontWeight: 'bold' }}>
            NP
          </div>
          <span style={{ fontSize: '50px', fontWeight: 'bold', color: 'white', letterSpacing: '-1px' }}>
            NewarPrime
          </span>
        </div>

        {/* Main Headline */}
        <div style={{ fontSize: '75px', fontWeight: '900', color: 'white', textAlign: 'center', letterSpacing: '-2px', lineHeight: '1.1', zIndex: 10 }}>
          Start Learning. <br />
          <span style={{ backgroundImage: 'linear-gradient(to right, #c084fc, #60a5fa)', backgroundClip: 'text', color: 'transparent' }}>
            Start Earning.
          </span>
        </div>

        {/* Subtitle / Trust Badge */}
        <div style={{ marginTop: '40px', padding: '15px 30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', color: '#d1d5db', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', zIndex: 10 }}>
          India's Elite Affiliate Hub
        </div>
      </div>
    ),
    { ...size }
  );
}