import { IAiProvider } from '../../domain/interfaces/IAiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { GrokProvider } from './GrokProvider';

export class AiProviderFactory {
  static create(provider: string, apiKey: string, model?: string): IAiProvider {
    switch (provider) {
      case 'openai':
        return new OpenAIProvider(apiKey, model);
      case 'gemini':
        return new GeminiProvider(apiKey, model);
      case 'grok':
        return new GrokProvider(apiKey, model);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
}
