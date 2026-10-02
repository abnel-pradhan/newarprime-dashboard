import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Updated to the new Gemini 3 series models to prevent 404s on new API keys
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

    let lastError: any = null;

    // Failover loop with Exponential Backoff
    for (const modelName of MODEL_CANDIDATES) {
      let retries = 2; // Try each model twice before giving up
      
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: 
                "You are PrimeBot, the official AI assistant for NewarPrime. You help users understand affiliate marketing, navigate their dashboard, and learn how to upgrade their tiers (Starter ₹199, Pro ₹499). Keep your answers helpful, motivating, concise, and format using markdown."
            }
          });

          if (response.text) {
            return NextResponse.json({ text: response.text }); // Success! Exit immediately.
          }
        } catch (err: any) {
          lastError = err;
          
          // If it's a 503 capacity error, wait 2.5 seconds and retry silently
          if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.status === 503) {
            retries--;
            if (retries > 0) {
              console.warn(`[503 Traffic Spike] ${modelName} is busy. Retrying in 2.5 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 2500));
            }
          } else {
            // If it's a 404 or 400, retrying won't help. Break out of the while loop and try the next model.
            break; 
          }
        }
      }
    }

    // If every model failed all retries
    throw lastError || new Error('All models are currently overloaded.');

  } catch (error: any) {
    console.error('Gemini API Error:', error.message);
    
    // Pass the actual error down if it's not a generic overload so we can debug
    return NextResponse.json({ 
      error: error.message?.includes('503') 
        ? 'PrimeBot is handling extremely high traffic right now! Please wait 10 seconds and try again.' 
        : error.message 
    }, { status: 503 });
  }
}