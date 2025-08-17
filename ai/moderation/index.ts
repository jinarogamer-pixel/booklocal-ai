// ai/moderation/index.ts
import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function isAllowedText(text: string): Promise<boolean> {
  try {
    if (!text || text.trim().length === 0) return true;
    
    const client = getOpenAI();
    const response = await client.moderations.create({ 
      model: "text-moderation-latest", 
      input: text
    });
    
    const result = response.results?.[0];
    return !result?.flagged;
  } catch (error) {
    console.error('Moderation error:', error);
    // Fail open - allow content if moderation fails
    return true;
  }
}

export async function getModerationDetails(text: string) {
  try {
    const client = getOpenAI();
    const response = await client.moderations.create({ 
      model: "text-moderation-latest", 
      input: text
    });
    
    return response.results?.[0];
  } catch (error) {
    console.error('Moderation details error:', error);
    return null;
  }
}
