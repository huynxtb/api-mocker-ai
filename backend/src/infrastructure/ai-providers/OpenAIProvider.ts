import OpenAI from 'openai';
import { IAiProvider } from '../../domain/interfaces/IAiProvider';

export class OpenAIProvider implements IAiProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model || 'gpt-4o-mini';
  }

  async generateMockData(
    responseStructure: string,
    itemCount: number,
    aiPrompt?: string,
    isList?: boolean,
    idField?: string,
  ): Promise<unknown> {
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

    const systemPrompt = `You are a mock data generator. You receive a JSON response structure template and must generate realistic mock data that matches the EXACT same structure.

CRITICAL RULES:
- The output JSON must contain ONLY the keys that exist in the input template. Do NOT add any extra keys.
- Do NOT invent new top-level keys like "data", "meta", "pagination" unless they exist in the template.
- The output must have the EXACT same top-level structure, keys, nesting, and field names as the template.
- ${listRules}
- Generate realistic, varied data matching the field semantics (names for name fields, emails for email fields, etc.)
- Keep data types exactly as shown in the template
- Return ONLY valid JSON, no markdown, no explanation, no code blocks
- If there are nested objects, generate varied nested data too
- Images should use placeholder URLs like https://picsum.photos/200/300?random=N`;

    const userPrompt = `JSON Response Structure Template:
\`\`\`json
${responseStructure}
\`\`\`
${aiPrompt ? `\nAdditional context: ${aiPrompt}` : ''}

Generate mock data matching this exact structure. Return only the complete JSON response with NO extra keys.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      ...(isArrayTemplate ? {} : { response_format: { type: 'json_object' as const } }),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }
}
