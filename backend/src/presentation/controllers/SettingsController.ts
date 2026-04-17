import { Request, Response, NextFunction } from 'express';
import { SettingsUseCases } from '../../application/use-cases/SettingsUseCases';
import { maskApiKey } from '../../infrastructure/crypto/encryption';

export class SettingsController {
  constructor(private settingsUseCases: SettingsUseCases) {}

  get = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.settingsUseCases.getSettings();
      // Mask API keys for frontend display
      res.json({
        success: true,
        data: {
          ...settings,
          openaiApiKey: maskApiKey(settings.openaiApiKey),
          geminiApiKey: maskApiKey(settings.geminiApiKey),
          grokApiKey: maskApiKey(settings.grokApiKey),
          // Tell FE which keys are configured
          hasOpenaiKey: Boolean(settings.openaiApiKey),
          hasGeminiKey: Boolean(settings.geminiApiKey),
          hasGrokKey: Boolean(settings.grokApiKey),
        },
      });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only update keys that are not masked (user changed them)
      const body = { ...req.body };
      if (body.openaiApiKey && body.openaiApiKey.includes('****')) delete body.openaiApiKey;
      if (body.geminiApiKey && body.geminiApiKey.includes('****')) delete body.geminiApiKey;
      if (body.grokApiKey && body.grokApiKey.includes('****')) delete body.grokApiKey;

      const settings = await this.settingsUseCases.updateSettings(body);
      res.json({
        success: true,
        data: {
          ...settings,
          openaiApiKey: maskApiKey(settings.openaiApiKey),
          geminiApiKey: maskApiKey(settings.geminiApiKey),
          grokApiKey: maskApiKey(settings.grokApiKey),
          hasOpenaiKey: Boolean(settings.openaiApiKey),
          hasGeminiKey: Boolean(settings.geminiApiKey),
          hasGrokKey: Boolean(settings.grokApiKey),
        },
      });
    } catch (err) { next(err); }
  };
}
