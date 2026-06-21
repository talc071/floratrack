const Anthropic = require('@anthropic-ai/sdk');
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

const PLANT_ID_PROMPT = `You are a plant identification expert for a home gardening app called FloraTrack.
Analyze this plant image and respond with ONLY a JSON object (no markdown) in this exact shape:
{
  "commonName": "string",
  "species": "scientific name string",
  "confidence": 0.0 to 1.0 number,
  "wateringFrequencyDays": integer between 1 and 30,
  "careInstructions": "brief care advice string"
}`;

const parseAIResponse = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response was not valid JSON.');
  return JSON.parse(jsonMatch[0]);
};

const identifyWithClaude = async (imageBuffer, mimeType) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return null;
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType || 'image/jpeg',
              data: imageBuffer.toString('base64')
            }
          },
          {
            type: 'text',
            text: PLANT_ID_PROMPT
          }
        ]
      }
    ]
  });

  const text = response.content[0].text;
  return parseAIResponse(text);
};

const identifyWithGemini = async (imageBuffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent([
    PLANT_ID_PROMPT,
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType || 'image/jpeg'
      }
    }
  ]);

  const text = result.response.text();
  return parseAIResponse(text);
};

const identifyPlant = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'An image file is required.', { field: 'image' });
    }

    let identification = null;
    let source = 'mock';

    try {
      identification = await identifyWithClaude(req.file.buffer, req.file.mimetype);
      if (identification) source = 'claude';
    } catch (err) {
      console.warn('[AI] Claude call failed, trying Gemini:', err.message);
    }

    if (!identification) {
      try {
        identification = await identifyWithGemini(req.file.buffer, req.file.mimetype);
        if (identification) source = 'gemini';
      } catch (err) {
        console.warn('[AI] Gemini call failed, using fallback:', err.message);
      }
    }

    if (!identification) {
      const claudeConfigured = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';
      const geminiConfigured = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
      if (!claudeConfigured && !geminiConfigured) {
        return sendError(res, 503, 'AI_UNAVAILABLE', 'AI service is not configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in backend .env.', {});
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
