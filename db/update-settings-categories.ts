
import { db } from "./index";
import { settings } from "@shared/schema";
import { sql } from "drizzle-orm";

async function updateSettingsCategories() {
  try {
    await db.execute(sql`
      UPDATE settings 
      SET category = 'notifications' 
      WHERE key IN ('popup_notification', 'popup_enabled', 'popup_duration', 'popup_title')
    `);
    console.log("Successfully updated settings categories");
  } catch (error) {
    console.error("Error updating settings categories:", error);
  } finally {
    process.exit();
  }
}

updateSettingsCategories();
