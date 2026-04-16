import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function detectFraud(userLocation: any, weatherStation: any, triggerType: string) {
  const prompt = `
    You are the Zensure AI Fraud Auditor. Analyze this claim:
    - User Location: ${JSON.stringify(userLocation)}
    - Weather Station: ${JSON.stringify(weatherStation)}
    - Trigger: ${triggerType}

    Analyze Proximity (flag if >20km) and behavioral patterns.
    Return ONLY a JSON object:
    {
      "fraudScore": number,
      "isSuspicious": boolean,
      "auditorReasoning": "string"
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a strict insurance auditor. Output JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Audit failed, defaulting to low risk", error);
    return { fraudScore: 10, isSuspicious: false, auditorReasoning: "Fallback: Standard verification." };
  }
}