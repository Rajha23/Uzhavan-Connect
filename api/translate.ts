export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const USER_ID = process.env.BHASHINI_USER_ID;
  const API_KEY = process.env.BHASHINI_API_KEY;
  const PIPELINE_ID = process.env.BHASHINI_PIPELINE_ID;

  if (!USER_ID || !API_KEY || !PIPELINE_ID) {
    return res.status(500).json({ error: 'Bhashini API credentials not configured.' });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing text or targetLanguage' });
    }

    if (sourceLanguage === targetLanguage) {
      return res.status(200).json({ translatedContent: text });
    }

    // Typical Bhashini Inference Request Payload
    const payload = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: sourceLanguage === 'auto' ? "en" : sourceLanguage,
              targetLanguage: targetLanguage
            }
          }
        }
      ],
      inputData: {
        input: [
          {
            source: text
          }
        ]
      }
    };

    const response = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "userID": USER_ID,
        "ulcaApiKey": API_KEY,
        "Authorization": API_KEY // Sometimes used depending on the specific Dhruva endpoint
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Bhashini API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract translation from standard Dhruva response
    const translatedContent = data?.pipelineResponse?.[0]?.output?.[0]?.target || text;

    return res.status(200).json({ translatedContent });
  } catch (error: any) {
    console.error('Serverless API Error (Bhashini):', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
