const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    console.log("Response:", res);

    if (!res.ok) {
      console.error("HeyGen API error:", res.status, res.statusText);
      const errorText = await res.text();
      console.error("Error details:", errorText);
      throw new Error(`HeyGen API returned ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("Token response data:", data);

    // Handle different response formats
    const token = data.token || data.data?.token || data.access_token;

    if (!token) {
      console.error("No token found in response:", data);
      throw new Error("Invalid token response from HeyGen API");
    }

    return new Response(token, {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}
