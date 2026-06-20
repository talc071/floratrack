const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sendSuccess, sendError } = require('../src/utils/response');

const MOCK_SPECIES = [
  {
    commonName: 'Swiss Cheese Plant',
    species: 'Monstera deliciosa',
    confidence: 0.92,
    wateringFrequencyDays: 7,
    careInstructions: 'Water when the top inch of soil is dry. Prefers bright, indirect light.'
  },
  {
    commonName: 'Snake Plant',
    species: 'Dracaena trifasciata',
    confidence: 0.88,
    wateringFrequencyDays: 14,
    careInstructions: 'Allow soil to dry completely between waterings. Tolerates low light.'
  },
  {
    commonName: 'Peace Lily',
    species: 'Spathiphyllum wallisii',
    confidence: 0.85,
    wateringFrequencyDays: 5,
    careInstructions: 'Keep soil lightly moist. Drooping leaves indicate it needs water.'
  }
];

const parseGeminiResponse = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response was not valid JSON.');
  return JSON.parse(jsonMatch[0]);
};

const identifyWithGemini = async (imageBuffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a plant identification expert for a home gardening app called FloraTrack.
Analyze this plant image and respond with ONLY a JSON object (no markdown) in this exact shape:
{
  "commonName": "string",
  "species": "scientific name string",
  "confidence": 0.0 to 1.0 number,
  "wateringFrequencyDays": integer between 1 and 30,
  "careInstructions": "brief care advice string"
}`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType || 'image/jpeg'
      }
    }
  ]);

  const text = result.response.text();
  return parseGeminiResponse(text);
};

const identifyPlant = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'An image file is required.', { field: 'image' });
    }

    let identification = null;
    let source = 'mock';

    try {
      identification = await identifyWithGemini(req.file.buffer, req.file.mimetype);
      if (identification) source = 'gemini';
    } catch (aiErr) {
      console.warn('[AI] Gemini call failed, using fallback:', aiErr.message);
    }

    if (!identification) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return sendError(res, 503, 'AI_UNAVAILABLE', 'AI service is not configured. Set GEMINI_API_KEY in backend .env.', {});
      }
      identification = MOCK_SPECIES[Math.floor(Math.random() * MOCK_SPECIES.length)];
      source = 'fallback';
    }

    sendSuccess(res, { identification, source });
  } catch (err) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message);
  }
};

module.exports = { identifyPlant };
