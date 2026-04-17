import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiProvider } from '../../domain/interfaces/IAiProvider';

export class GeminiProvider implements IAiProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model || 'gemini-1.5-flash';
  }

  async generateMockData(
    responseStructure: string,
    itemCount: number,
    aiPrompt?: string,
    isList?: boolean,
    idField?: string,
  ): Promise<unknown> {
    const model = this.genAI.getGenerativeModel({ model: this.model });

    const isArrayTemplate = responseStructure.trim().startsWith('[');

    const idInstruction = idField
      ? `- Use "${idField}" as the ID field name, with sequential integers starting from 1`
      : `- Auto-detect the ID field from the structure. Use sequential integers starting from 1`;

    const listRules = isList
      ? isArrayTemplate
        ? `- This is a LIST endpoint. The template is a JSON array. Return a JSON array with exactly ${itemCount} items. Do NOT wrap in an object.
- ${idInstruction}`
        : `- This is a LIST endpoint. Generate exactly ${itemCount} items for the data array.
- If there is a pagination/meta object in the template, set its total to ${itemCount}. Do NOT add pagination if not in template.
- ${idInstruction}`
      : `- This is a SINGLE item endpoint. Generate new, realistic mock data following the exact same JSON structure and keys
- Replace ALL values with new realistic data. Do NOT keep the original template values
- Do NOT wrap in array or add pagination`;

    const prompt = `You are a mock data generator.

CRITICAL RULES:
- The output JSON must contain ONLY the keys that exist in the input template. Do NOT add any extra keys.
- Do NOT invent new top-level keys like "data", "meta", "pagination" unless they exist in the template.
- The output must have the EXACT same top-level keys, nesting, and field names as the template.
- ${listRules}
- Generate realistic, varied data matching the field semantics
- Keep data types exactly as shown
- Return ONLY valid JSON, no markdown, no explanation, no code blocks
- Images should use placeholder URLs like https://picsum.photos/200/300?random=N

JSON Response Structure Template:
${responseStructure}
${aiPrompt ? `\nAdditional context: ${aiPrompt}` : ''}

Generate mock data matching this exact structure. Return only the complete JSON response with NO extra keys.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }
}
