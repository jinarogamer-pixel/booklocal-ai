// ai/search/embed.ts
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

export async function embed(text: string): Promise<number[]> {
  try {
    const client = getOpenAI();
    const response = await client.embeddings.create({ 
      model: "text-embedding-3-small", 
      input: text.slice(0, 8000) // OpenAI has token limits
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding error:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  try {
    const client = getOpenAI();
    const response = await client.embeddings.create({ 
      model: "text-embedding-3-small", 
      input: texts.map(text => text.slice(0, 8000))
    });
    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Batch embedding error:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}
