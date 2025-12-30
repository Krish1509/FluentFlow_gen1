import { NextRequest, NextResponse } from "next/server";

type GenerateBody = {
  text?: string;
  userProfile?: any;
  scenario?: any;
};

// Enhanced in-memory cache to reduce API calls
const responseCache = new Map<string, { response: string; timestamp: number; userProfile?: any; scenario?: any }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - increased for development

function buildTutorPrompt(userInput: string, userProfile?: any): string {
  let systemPrompt = "You are FluentFlow, an AI communication coach. ";

  if (userProfile) {
    systemPrompt += `You are speaking with ${userProfile.name || 'the user'}. `;

    if (userProfile.age) {
      systemPrompt += `They are ${userProfile.age} years old. `;
    }

    if (userProfile.occupation) {
      systemPrompt += `Their occupation/role is: ${userProfile.occupation}. `;
    }

    if (userProfile.nativeLanguage) {
      systemPrompt += `Their native language is ${userProfile.nativeLanguage}. `;
    }

    if (userProfile.currentLanguages?.length > 0) {
      systemPrompt += `They know these languages: ${userProfile.currentLanguages.join(', ')}. `;
    }

    if (userProfile.targetLanguages?.length > 0) {
      systemPrompt += `They are learning/practicing: ${userProfile.targetLanguages.join(', ')}. `;
    }

    if (userProfile.proficiencyLevel) {
      systemPrompt += `Their current proficiency level is ${userProfile.proficiencyLevel}. `;
    }

    if (userProfile.learningGoals?.length > 0) {
      systemPrompt += `Their learning goals include: ${userProfile.learningGoals.join(', ')}. `;
    }

    if (userProfile.interests?.length > 0) {
      systemPrompt += `Their interests include: ${userProfile.interests.join(', ')}. `;
    }

    if (userProfile.personalityTraits?.length > 0) {
      systemPrompt += `Their personality traits: ${userProfile.personalityTraits.join(', ')}. `;
    }

    if (userProfile.communicationStyle) {
      systemPrompt += `Adapt your communication style to be ${userProfile.communicationStyle.toLowerCase()}. `;
    }

    if (userProfile.challenges?.length > 0) {
      systemPrompt += `Help them with these challenges: ${userProfile.challenges.join(', ')}. `;
    }
  }

  systemPrompt += "Respond in a friendly, clear, and concise way. Keep responses natural and conversational. ";

  if (userProfile?.name) {
    systemPrompt += `Address them by name (${userProfile.name}) when appropriate. `;
  }

  systemPrompt += "Focus on communication practice and improvement. Do not include any promotional text, download instructions, or phone-related content. Just engage in the conversation naturally. ";

  return systemPrompt + "User said: '" + userInput + "'";
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
    const userProfile = body?.userProfile;
    const scenario = body?.scenario;

    if (!userText) {
      return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
    }

    // Check cache first to reduce API calls - include personalization in cache key
    const cacheKey = `${userText.toLowerCase()}_${JSON.stringify(userProfile || {})}_${JSON.stringify(scenario || {})}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📋 Using cached response for:', userText.substring(0, 50) + '...');
      return NextResponse.json({ reply: cached.response });
    }

    const promptPayload = buildTutorPrompt(userText, userProfile);

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
      timestamp: Date.now(),
      userProfile: userProfile,
      scenario: scenario
    });

    // Clean up old cache entries periodically
    if (responseCache.size > 100) {
      const now = Date.now();
      const keysToDelete: string[] = [];
      responseCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => responseCache.delete(key));
    }

    return NextResponse.json({ reply: candidateText });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Request failed", detail: String(error) },
      { status: 500 }
    );
  }
}
