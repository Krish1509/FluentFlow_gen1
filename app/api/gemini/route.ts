import { NextRequest, NextResponse } from "next/server";

type GenerateBody = {
  text?: string;
};

// Simple in-memory cache to reduce API calls
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function buildTutorPrompt(userInput: string): string {
  return "You are a helpful AI assistant. Respond in a friendly, clear, and concise way. Keep responses natural and conversational. Do not include any promotional text, download instructions, or phone-related content. Just answer the user's question directly. User said: '" + userInput + "'";
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_API_KEY;
    if (!apiKey || apiKey === "your_google_gemini_api_key_here" || apiKey === "AIzaSyDummyKeyPleaseReplaceWithRealKey") {
      return NextResponse.json(
        { 
          error: "Please set up your Google Gemini API key",
          instructions: "1. Go to https://aistudio.google.com/app/apikey\n2. Create an API key\n3. Add it to .env.local as GOOGLE_GENERATIVE_API_KEY=your_actual_key"
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as GenerateBody;
    const userText = body?.text?.trim();
    if (!userText) {
      return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
    }

    // Check cache first to reduce API calls
    const cacheKey = userText.toLowerCase();
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ reply: cached.response });
    }

    const promptPayload = buildTutorPrompt(userText);

    // Gemini via Generative Language API: text-only generation endpoint
    // Using working model from available models list
    const model = "gemini-2.0-flash-001";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: promptPayload,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Gemini API error:", upstream.status, errText);
      
      // Handle specific API key errors
      if (upstream.status === 400 && errText.includes("API key not valid")) {
        return NextResponse.json(
          { 
            error: "Invalid Google Gemini API key",
            instructions: "Please check your API key at https://aistudio.google.com/app/apikey and update .env.local"
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: "Gemini API error", detail: errText, status: upstream.status },
        { status: 502 }
      );
    }

    const data = (await upstream.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Cache the response to reduce future API calls
    responseCache.set(cacheKey, {
      response: candidateText,
      timestamp: Date.now()
    });

    return NextResponse.json({ reply: candidateText });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Request failed", detail: String(error) },
      { status: 500 }
    );
  }
}
