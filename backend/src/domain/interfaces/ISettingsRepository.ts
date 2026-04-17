import { ISettings } from '../entities/Settings';

export interface ISettingsRepository {
  get(): Promise<ISettings>;
  update(settings: Partial<ISettings>): Promise<ISettings>;
}
