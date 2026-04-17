import { ISettings } from '../../domain/entities/Settings';
import { ISettingsRepository } from '../../domain/interfaces/ISettingsRepository';

export class SettingsUseCases {
  constructor(private settingsRepo: ISettingsRepository) {}

  async getSettings(): Promise<ISettings> {
    return this.settingsRepo.get();
  }

  async updateSettings(data: Partial<ISettings>): Promise<ISettings> {
    return this.settingsRepo.update(data);
  }
}
