import { db } from "./index";
import { historicalFigures, periods } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Script di chuyển dữ liệu từ periodText sang periodId
 */
async function migrateHistoricalFigures() {
  console.log("Bắt đầu di chuyển dữ liệu nhân vật lịch sử");
  
  try {
    // Lấy tất cả thời kỳ
    const allPeriods = await db.query.periods.findMany();
    console.log(`Tìm thấy ${allPeriods.length} thời kỳ`);
    
    // Lấy tất cả nhân vật lịch sử
    const allFigures = await db.query.historicalFigures.findMany();
    console.log(`Tìm thấy ${allFigures.length} nhân vật lịch sử cần cập nhật`);
    
    // Duyệt qua từng nhân vật
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const figure of allFigures) {
      // Nếu đã có periodId, bỏ qua
      if (figure.periodId) {
        skippedCount++;
        continue;
      }
      
      // Tìm thời kỳ phù hợp dựa trên periodText
      const matchingPeriod = allPeriods.find(p => {
        return figure.periodText && p.name.toLowerCase().includes(figure.periodText.toLowerCase());
      });
      
      if (matchingPeriod) {
        // Cập nhật nhân vật với periodId mới
        await db.update(historicalFigures)
          .set({ periodId: matchingPeriod.id })
          .where(eq(historicalFigures.id, figure.id));
        
        console.log(`Đã cập nhật nhân vật '${figure.name}' với thời kỳ '${matchingPeriod.name}'`);
        updatedCount++;
      } else {
        console.log(`Không tìm thấy thời kỳ phù hợp cho nhân vật '${figure.name}' với periodText='${figure.periodText}'`);
      }
    }
    
    console.log(`Hoàn thành di chuyển dữ liệu: ${updatedCount} nhân vật đã được cập nhật, ${skippedCount} nhân vật đã bỏ qua (đã có periodId)`);
    
  } catch (error) {
    console.error("Lỗi khi di chuyển dữ liệu:", error);
  }
}

// Chạy migration
migrateHistoricalFigures()
  .catch(console.error)
  .finally(() => {
    console.log("Kết thúc quá trình di chuyển dữ liệu");
    process.exit(0);
  });
