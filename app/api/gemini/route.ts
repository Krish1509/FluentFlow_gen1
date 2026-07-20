import { NextRequest, NextResponse } from "next/server";

type GenerateBody = {
  text?: string;
  userProfile?: any;
  scenario?: any;
  language?: string;
};

// In-memory cache to reduce redundant API calls
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function buildSystemPrompt(userProfile?: any, scenario?: any, language?: string): string {
  let systemPrompt = "You are FluentFlow, an empathetic and professional AI communication and language coach. CRITICAL VOICE CALL MODE: You are interacting via a REAL-TIME SPOKEN VOICE CALL with the user. The user is SPEAKING out loud into their microphone. You can HEAR them clearly. NEVER say things like 'I can understand what you're typing', 'I see what you wrote', or refer to text/typing. Speak naturally as a real human spoken partner over a live video/audio call. ";

  if (language && language !== "en") {
    const langMap: Record<string, string> = {
      hi: "Hindi",
      "hi-IN": "Hindi",
      es: "Spanish",
      "es-ES": "Spanish",
      fr: "French",
      "fr-FR": "French",
      de: "German",
      "de-DE": "German",
      zh: "Chinese",
      "zh-CN": "Chinese",
      ja: "Japanese",
      "ja-JP": "Japanese"
    };
    const langName = langMap[language] || language;
    systemPrompt += `CRITICAL LANGUAGE REQUIREMENT: The user has selected ${langName} (${language}). You MUST speak, respond, and conduct the entire conversation in ${langName}. Do NOT use English unless translating or explaining a word upon request. `;
  }

  if (scenario) {
    systemPrompt += `Current Scenario/Roleplay: ${scenario.name}. Description: ${scenario.description}. `;
    
    const isInterview = scenario.name?.toLowerCase().includes("interview") || 
                        scenario.id?.toLowerCase().includes("interview") ||
                        scenario.name?.toLowerCase().includes("practice") ||
                        scenario.id?.toLowerCase().includes("practice");
                        
    if (isInterview) {
      systemPrompt += `Roleplay Instruction: You are the interviewer/coach conducting a professional one-by-one practice interview. Ask exactly ONE interview question or follow-up question at a time. Wait for the user to respond before asking the next question. Provide very brief, actionable feedback (under 1 sentence) on their communication if necessary, then proceed to the next question. Do NOT list multiple questions at once. `;
    } else {
      systemPrompt += `Roleplay Instruction: Actively play your role in this scenario. Respond in character according to the scenario description. Keep the interaction flow natural, and reply with one conversational turn at a time. `;
    }
  } else {
    systemPrompt += "We are doing a General Conversation practice. Act as a friendly, engaging, and supportive language partner. Keep the conversation open-ended, ask engaging questions, and help the user express themselves. ";
  }

  if (userProfile) {
    if (userProfile.name) systemPrompt += `User's name: ${userProfile.name}. `;
    if (userProfile.age) systemPrompt += `Age: ${userProfile.age}. `;
    if (userProfile.occupation) systemPrompt += `Occupation/Role: ${userProfile.occupation}. `;
    if (userProfile.nativeLanguage) systemPrompt += `Native language: ${userProfile.nativeLanguage}. `;
    if (userProfile.targetLanguages?.length > 0) systemPrompt += `Practicing: ${userProfile.targetLanguages.join(', ')}. `;
    if (userProfile.proficiencyLevel) systemPrompt += `Proficiency level: ${userProfile.proficiencyLevel}. `;
    if (userProfile.learningGoals?.length > 0) systemPrompt += `Goals: ${userProfile.learningGoals.join(', ')}. `;
    if (userProfile.interests?.length > 0) systemPrompt += `Interests: ${userProfile.interests.join(', ')}. `;
    if (userProfile.communicationStyle) systemPrompt += `Style: ${userProfile.communicationStyle}. `;
  }

  systemPrompt += "CRITICAL STT INSTRUCTION: The user is speaking live via speech recognition. STT may occasionally output minor phonetic misreadings. NEVER mention, repeat, or question weird STT misheard words like 'fresh', 'chris', 'frame', or 'fish'. ALWAYS respond naturally with a warm greeting or answer their core intent directly in 1-2 concise sentences.";

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_API_KEY;

    if (!groqApiKey && (!geminiApiKey || geminiApiKey.includes("your_google_gemini_api_key"))) {
      return NextResponse.json(
        {
          error: "Please set GROQ_API_KEY or GOOGLE_GENERATIVE_API_KEY in .env",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as any;
    let userText = body?.text?.trim() || "";
    const userProfile = body?.userProfile;
    const scenario = body?.scenario;
    const language = body?.language;
    const history = body?.history || [];

    if (!userText) {
      return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
    }

    // Clean common Speech Recognition (STT) phonetic mishearings
    const cleanLower = userText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    if (
      cleanLower === "hello fresh" ||
      cleanLower === "hello chris" ||
      cleanLower === "hello frame" ||
      cleanLower === "hello fish" ||
      cleanLower === "hello coach"
    ) {
      userText = "Hello";
    }

    // Cache check includes history and language to ensure uniqueness
    const cacheKey = `${userText.toLowerCase()}_${JSON.stringify(userProfile || {})}_${JSON.stringify(scenario || {})}_${language}_${JSON.stringify(history)}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("📋 Using cached response for user text");
      return NextResponse.json({ reply: cached.response });
    }

    const systemPrompt = buildSystemPrompt(userProfile, scenario, language);
    let replyText = "";

    // 1. Try Groq API if key is available (Llama 3.3 70B - fast & high accuracy)
    if (groqApiKey) {
      try {
        console.log("⚡ Calling Groq API with model llama-3.3-70b-versatile...");
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...history,
              { role: "user", content: userText },
            ],
            temperature: 0.6,
            max_tokens: 120,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          replyText = groqData?.choices?.[0]?.message?.content ?? "";
          console.log("✅ Groq API response received successfully!");
        } else {
          const errText = await groqRes.text();
          console.warn("Groq API status error:", groqRes.status, errText);
        }
      } catch (groqErr) {
        console.error("Groq API request error:", groqErr);
      }
    }

    // 2. Fallback to Gemini if Groq is unavailable or failed
    if (!replyText && geminiApiKey) {
      console.log("🤖 Falling back to Gemini API...");
      const model = "gemini-flash-latest";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

      const geminiRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...history.map((h: any) => ({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: h.content }],
            })),
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\nUser said: '${userText}'` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
    }

    if (!replyText) {
      return NextResponse.json({ error: "Failed to generate response from AI providers" }, { status: 502 });
    }

    // Save response to cache
    responseCache.set(cacheKey, { response: replyText, timestamp: Date.now() });

    return NextResponse.json({ reply: replyText });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Request failed", detail: String(error) },
      { status: 500 }
    );
  }
}
