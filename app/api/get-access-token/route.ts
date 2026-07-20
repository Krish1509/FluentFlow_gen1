import { NextRequest } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const AVATAR_NAME_ALIASES: Record<string, string> = {
  Ann_Therapist_public: "Ann Therapist",
  Shawn_Therapist_public: "Shawn Therapist",
  Dexter_Doctor_Standing2_public: "Dexter Doctor Standing",
  Emma_public: "Emma",
  Elenora_IT_Sitting_public: "Elenora IT Sitting",
  Bryan_FitnessCoach_public: "Bryan Fitness Coach",
};

async function resolveAvatarId(rawAvatarName: string, apiKey: string): Promise<string> {
  // If UI already sends a UUID, pass it through directly.
  if (UUID_REGEX.test(rawAvatarName)) {
    return rawAvatarName;
  }

  const searchName = AVATAR_NAME_ALIASES[rawAvatarName] ?? rawAvatarName;
  const normalizedSearch = searchName.toLowerCase().replace(/[_\s]+/g, " ").trim();

  const avatarsRes = await fetch("https://api.liveavatar.com/v1/avatars/public", {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!avatarsRes.ok) {
    const text = await avatarsRes.text();
    throw new Error(`Failed to fetch public avatars: ${avatarsRes.status} ${text}`);
  }

  const avatarsJson = await avatarsRes.json();
  const avatars = Array.isArray(avatarsJson?.data?.results)
    ? avatarsJson.data.results
    : Array.isArray(avatarsJson?.data?.avatars)
    ? avatarsJson.data.avatars
    : Array.isArray(avatarsJson?.data)
    ? avatarsJson.data
    : [];

  const match = avatars.find((avatar: any) => {
    const candidates = [
      avatar?.name,
      avatar?.avatar_name,
      avatar?.title,
      avatar?.display_name,
    ]
      .filter(Boolean)
      .map((value: string) => value.toLowerCase().replace(/[_\s]+/g, " ").trim());

    return candidates.some((candidate: string) => candidate === normalizedSearch);
  });

  const resolvedId = match?.avatar_id ?? match?.id;

  if (!resolvedId || !UUID_REGEX.test(resolvedId)) {
    throw new Error(
      `No valid avatar UUID found for "${rawAvatarName}". Verify avatar name mapping.`
    );
  }

  return resolvedId;
}

export async function POST(req: NextRequest) {
  try {
    const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    const config = await req.json();
    const avatarId = await resolveAvatarId(config.avatarName, HEYGEN_API_KEY);

    const payload = {
      avatar_id: avatarId,
      avatar_persona: {
        language: config.language || "en",
        voice_settings: config.voice ? {
          model: config.voice.model
        } : undefined,
        stt_config: {
          provider: config.sttSettings?.provider || "deepgram",
          language: config.language === "en" ? "en-US" : 
                    config.language === "es" ? "es-ES" :
                    config.language === "fr" ? "fr-FR" :
                    config.language === "de" ? "de-DE" :
                    config.language === "zh" ? "zh-CN" :
                    config.language === "ja" ? "ja-JP" :
                    config.language === "hi" ? "hi-IN" : "en-US"
        }
      },
      mode: "FULL",
      video_settings: {
        quality: config.quality === "low" ? "low" : "high"
      }
    };

    const res = await fetch(`https://api.liveavatar.com/v1/sessions/token`, {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("LiveAvatar API error:", res.status, errorText);
      return new Response(errorText, { status: res.status });
    }

    const data = await res.json();
    console.log("Token response data:", data);

    // LiveAvatar API returns 100 or 1000 for success, but checking token presence is safer
    if (data.code && !data.data?.session_token) {
      console.error("LiveAvatar API business error:", data);
      return new Response(JSON.stringify(data), { status: 400 });
    }

    const token = data.data?.session_token;

    if (!token) {
      console.error("No token found in response:", data);
      return new Response("Invalid token response from LiveAvatar API", { status: 500 });
    }

    return new Response(token, {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error retrieving access token:", error);
    return new Response(error.message || "Failed to retrieve access token", {
      status: 500,
    });
  }
}
