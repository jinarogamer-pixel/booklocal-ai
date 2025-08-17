// ai/assist/brief.ts
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

export interface ProjectBrief {
  scope: string;
  materials: string[];
  timeline_weeks: number;
  budget_low: number;
  budget_high: number;
  questions: string[];
}

export async function generateProjectBrief(
  title: string, 
  notes: string, 
  sqft?: number, 
  location?: string
): Promise<ProjectBrief> {
  const systemPrompt = `You are BookLocal's expert project estimator. Analyze project requests and output realistic estimates for US home services.

Output JSON with exactly these keys:
- scope: Clear 2-3 sentence project description
- materials: Array of key materials/supplies needed
- timeline_weeks: Realistic completion time in weeks
- budget_low: Conservative cost estimate (USD)
- budget_high: Higher-end cost estimate (USD)
- questions: Array of 3-4 clarifying questions for the homeowner

Keep estimates realistic for US labor costs. Factor in location (higher costs for expensive cities).`;

  const userPrompt = `Project Title: ${title}
Notes: ${notes}
Square Feet: ${sqft || 'Not specified'}
Location: ${location || 'Not specified'}`;

  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as ProjectBrief;
  } catch (error) {
    console.error('Project brief generation error:', error);
    throw new Error('Failed to generate project brief');
  }
}
