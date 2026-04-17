import { Request, Response, NextFunction } from 'express';
import { SettingsUseCases } from '../../application/use-cases/SettingsUseCases';
import { AiAccount, ISettings } from '../../domain/entities/Settings';

// Repo returns decrypted (plaintext) keys. This masks them for wire transport.
function maskPlaintext(plaintext: string): string {
  if (!plaintext) return '';
  if (plaintext.length <= 12) return '****';
  return `${plaintext.slice(0, 4)}${'*'.repeat(Math.min(20, plaintext.length - 8))}${plaintext.slice(-4)}`;
}

function maskAccounts(accounts: AiAccount[]): AiAccount[] {
  return accounts.map((a) => ({ ...a, apiKey: maskPlaintext(a.apiKey) }));
}

function computeReady(settings: ISettings): boolean {
  if (!settings.primaryAccountId) return false;
  const primary = settings.accounts.find((a) => a.id === settings.primaryAccountId);
  return Boolean(primary && primary.apiKey);
}

function serialize(settings: ISettings) {
  return {
    accounts: maskAccounts(settings.accounts),
    primaryAccountId: settings.primaryAccountId,
    fallbackAccountIds: settings.fallbackAccountIds,
    ready: computeReady(settings),
  };
}

export class SettingsController {
  constructor(private settingsUseCases: SettingsUseCases) {}

  get = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.settingsUseCases.getSettings();
      res.json({ success: true, data: serialize(settings) });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as Partial<ISettings>;
      const settings = await this.settingsUseCases.updateSettings(body);
      res.json({ success: true, data: serialize(settings) });
    } catch (err) { next(err); }
  };
}
