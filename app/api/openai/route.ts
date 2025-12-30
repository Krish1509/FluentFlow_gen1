import { NextRequest, NextResponse } from "next/server";

// Enhanced in-memory cache for OpenAI API calls
const responseCache = new Map<string, { response: string; timestamp: number; userProfile?: any; scenario?: any }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes - longer for OpenAI

type GenerateBody = {
  text?: string;
  userProfile?: any;
  scenario?: any;
};

function buildOpenAIPrompt(userInput: string, userProfile?: any, scenario?: any): string {
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

    if (userProfile.communicationStyle) {
      systemPrompt += `Adapt your communication style to be ${userProfile.communicationStyle.toLowerCase()}. `;
    }

    if (userProfile.challenges?.length > 0) {
      systemPrompt += `Help them with these challenges: ${userProfile.challenges.join(', ')}. `;
    }
  }

  if (scenario) {
    systemPrompt += `Current scenario: ${scenario.name}. ${scenario.description || ''}. `;
  }

  systemPrompt += "Respond in a friendly, clear, and concise way. Keep responses natural and conversational. Focus on communication practice and improvement. ";

  if (userProfile?.name) {
    systemPrompt += `Address them by name (${userProfile.name}) when appropriate. `;
  }

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          instructions: "1. Visit https://platform.openai.com/api-keys\n2. Create an API key\n3. Add it to .env.local as OPENAI_API_KEY=sk-your-key-here"
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as GenerateBody;
    const userText = body?.text?.trim();
    const userProfile = body?.userProfile;
    const scenario = body?.scenario;

    if (!userText) {
      return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `${userText.toLowerCase()}_${JSON.stringify(userProfile || {})}_${JSON.stringify(scenario || {})}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📋 Using cached OpenAI response');
      return NextResponse.json({ reply: cached.response });
    }

    const systemPrompt = buildOpenAIPrompt(userText, userProfile, scenario);

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Best free tier model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userText
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', openaiResponse.status, errorData);

      if (openaiResponse.status === 429) {
        return NextResponse.json(
          {
            error: "OpenAI API quota exceeded",
            instructions: "Your free tier limit has been reached. Visit https://platform.openai.com/account/billing to upgrade or wait for quota reset."
          },
          { status: 429 }
        );
      }

      if (openaiResponse.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid OpenAI API key",
            instructions: "Check your OPENAI_API_KEY in .env.local file"
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: "OpenAI API error",
          details: errorData.error?.message || 'Unknown error'
        },
        { status: 502 }
      );
    }

    const data = await openaiResponse.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json({ error: "No response from OpenAI" }, { status: 502 });
    }

    // Cache the response
    responseCache.set(cacheKey, {
      response: aiResponse,
      timestamp: Date.now(),
      userProfile: userProfile,
      scenario: scenario
    });

    // Clean up old cache entries
    if (responseCache.size > 200) {
      const now = Date.now();
      const keysToDelete: string[] = [];
      responseCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => responseCache.delete(key));
    }

    console.log('✅ OpenAI API call successful');
    return NextResponse.json({ reply: aiResponse });

  } catch (error: any) {
    console.error('OpenAI API request failed:', error);
    return NextResponse.json(
      {
        error: "Failed to communicate with OpenAI",
        details: error.message
      },
      { status: 500 }
    );
  }
}
