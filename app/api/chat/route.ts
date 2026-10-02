import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const MODEL_CANDIDATES = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite'
];

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing in .env.local.' }, 
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const formattedContents = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 🌟 THIS IS THE AI'S BRAIN. YOU CAN ADD ANY NEW FACTS HERE!
    const systemPrompt = `You are PrimeBot, the official smart assistant for NewarPrime (newarprime.in), India's premier Learn & Earn affiliate community.

TONE & FORMATTING RULES:
- Be highly professional, helpful, and concise.
- STRICT RULE: Limit yourself to a maximum of 1 or 2 emojis per response. Do not overuse them.
- STRICT RULE: Use ** for bold text and - for bullet points.
- Keep paragraphs short (1-2 sentences maximum) so it is easy to read.

COMPANY KNOWLEDGE BASE (CRITICAL FACTS):
- Founders & Leadership Team:
  1. Abnel Pradhan: Founder and Chief Tech Officer (CTO). Built the platform from scratch[cite: 21].
  2. Utam Pradhan: Co-Founder and Chief Executive Officer (CEO). Drives business strategy and growth[cite: 21].
  3. Prajwal Pradhan: Social Media Director. Leads content, engagement, and brand growth[cite: 21].

- Packages & Pricing: 
  1. Free Trial (₹0): 2-month access, orientation masterclass, no earning capability.
  2. Starter Package (₹199): Permanent access, 60% commission (~₹120/sale), core courses.
  3. Pro Package (₹499): Permanent access, flat ₹300 commission/sale, all advanced courses, priority support.
  
If asked something outside this knowledge base, politely state that you only handle NewarPrime-related queries.`;

    let lastError: any = null;

    for (const modelName of MODEL_CANDIDATES) {
      let retries = 2;
      
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: systemPrompt
            }
          });

          if (response.text) {
            return NextResponse.json({ text: response.text });
          }
        } catch (err: any) {
          lastError = err;
          if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.status === 503) {
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } else {
            break;
          }
        }
      }
    }

    throw lastError || new Error('All models busy.');

  } catch (error: any) {
    console.error('Gemini API Error:', error.message);
    return NextResponse.json({ 
      error: 'PrimeBot is busy right now! Please try again in a few seconds.' 
    }, { status: 503 });
  }
}