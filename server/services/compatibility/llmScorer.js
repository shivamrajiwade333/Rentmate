const { calculateFallbackScore } = require('./fallbackScorer');

exports.calculateLLMScore = async (tenantProfile, listing) => {
  const provider = process.env.LLM_PROVIDER || 'gemini';
  
  if (provider === 'gemini') {
    return await callGemini(tenantProfile, listing);
  }
  
  // Default to fallback if no provider configured
  return calculateFallbackScore(tenantProfile, listing);
};

const callGemini = async (tenantProfile, listing) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.LLM_MODEL || 'gemini-1.5-flash';
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `
SYSTEM:
You are a room compatibility scoring engine. Return only valid JSON.
Do not include markdown or additional text.
Score primarily according to budget and location.
Use move-in date, room type, furnishing, and optional lifestyle preferences as secondary factors.
The score must be an integer from 0 to 100.
The explanation must be concise, neutral, and based only on the supplied data.

USER:
Given this room listing:
${JSON.stringify({
  location: listing.normalizedLocation,
  rent: listing.rent,
  deposit: listing.deposit,
  availableFrom: listing.availableFrom,
  roomType: listing.roomType,
  furnishingStatus: listing.furnishingStatus,
  amenities: listing.amenities,
  preferredTenantType: listing.preferredTenantType,
})}

And this tenant profile:
${JSON.stringify({
  preferredLocations: tenantProfile.preferredLocations,
  minBudget: tenantProfile.minBudget,
  maxBudget: tenantProfile.maxBudget,
  moveInDate: tenantProfile.moveInDate,
  preferredRoomTypes: tenantProfile.preferredRoomTypes,
  furnishingPreference: tenantProfile.furnishingPreference,
  lifestyle: tenantProfile.lifestyle,
})}

Return:
{
  "score": 0,
  "explanation": "brief explanation",
  "breakdown": {
    "locationScore": 0,
    "budgetScore": 0,
    "moveInScore": 0,
    "roomTypeScore": 0,
    "furnishingScore": 0,
    "lifestyleScore": 0
  }
}
`;

  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS) || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Deterministic
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean markdown if present
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const result = JSON.parse(text);

    // Validate result
    if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
      throw new Error('Invalid score returned by LLM');
    }

    return {
      score: Math.round(result.score),
      explanation: result.explanation || 'No explanation provided.',
      breakdown: result.breakdown || {},
      method: 'llm',
      rawProviderResponse: null // do not store raw response to save DB space
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LLM scoring failed, falling back to rule-based:', error.message);
    throw error;
  }
};
