import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AppSettings {
  storeName: string;
  storeCurrency: string;
  lowStockAlertEnabled: boolean;
  lowStockCheckInterval: number;
  expiryAlertDays: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  storeName: "Clinton Store",
  storeCurrency: "GHS",
  lowStockAlertEnabled: true,
  lowStockCheckInterval: 24,
  expiryAlertDays: 7,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const allSettings = await db
      .select({
        key: settings.key,
        value: settings.value,
      })
      .from(settings);

    if (!allSettings || allSettings.length === 0) {
      return DEFAULT_SETTINGS;
    }

    const settingsMap = new Map(allSettings.map((s) => [s.key, s.value]));

    return {
      storeName: settingsMap.get("store_name") || DEFAULT_SETTINGS.storeName,
      storeCurrency:
        settingsMap.get("store_currency") || DEFAULT_SETTINGS.storeCurrency,
      lowStockAlertEnabled:
        settingsMap.get("low_stock_alert_enabled") !== "false",
      lowStockCheckInterval:
        parseInt(settingsMap.get("low_stock_check_interval") || "") ||
        DEFAULT_SETTINGS.lowStockCheckInterval,
      expiryAlertDays:
        parseInt(settingsMap.get("expiry_alert_days") || "") ||
        DEFAULT_SETTINGS.expiryAlertDays,
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults if table doesn't exist yet
    return DEFAULT_SETTINGS;
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    // Check if setting exists
    const [existing] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existing) {
      // Update existing
      await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key));
    } else {
      // Insert new
      await db.insert(settings).values({
        key,
        value,
      });
    }
  } catch (error) {
    console.error("Error updating setting:", error);
    throw error;
  }
}

export async function updateSettings(updates: Record<string, string>) {
  for (const [key, value] of Object.entries(updates)) {
    await updateSetting(key, value);
  }
}
