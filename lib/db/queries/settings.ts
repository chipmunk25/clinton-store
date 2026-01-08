import { db } from '@/db';
import { settings, SETTINGS_KEYS } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AppSettings {
  storeName: string;
  storeCurrency: string;
  lowStockAlertEnabled: boolean;
  lowStockCheckInterval: number;
  expiryAlertDays: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'Clinton Store',
  storeCurrency: 'USD',
  lowStockAlertEnabled: true,
  lowStockCheckInterval: 24,
  expiryAlertDays: 7,
};

export async function getSettings(): Promise<AppSettings> {
  const allSettings = await db.select().from(settings);

  const settingsMap = new Map(allSettings.map((s) => [s.key, s. value]));

  return {
    storeName: settingsMap.get(SETTINGS_KEYS.STORE_NAME) || DEFAULT_SETTINGS.storeName,
    storeCurrency: settingsMap.get(SETTINGS_KEYS.STORE_CURRENCY) || DEFAULT_SETTINGS.storeCurrency,
    lowStockAlertEnabled: 
      settingsMap.get(SETTINGS_KEYS.LOW_STOCK_ALERT_ENABLED) !== 'false',
    lowStockCheckInterval:
      parseInt(settingsMap.get(SETTINGS_KEYS.LOW_STOCK_CHECK_INTERVAL) || '') ||
      DEFAULT_SETTINGS.lowStockCheckInterval,
    expiryAlertDays: 
      parseInt(settingsMap. get(SETTINGS_KEYS. EXPIRY_ALERT_DAYS) || '') ||
      DEFAULT_SETTINGS.expiryAlertDays,
  };
}

export async function updateSetting(key: string, value:  string) {
  const [existing] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing) {
    await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}