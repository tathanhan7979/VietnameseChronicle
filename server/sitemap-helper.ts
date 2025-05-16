import { storage } from './storage';

/**
 * Helper function để cập nhật sitemap khi có thay đổi nội dung
 * Hàm này sẽ kiểm tra xem tính năng tự động cập nhật sitemap có được bật không
 * và thực hiện cập nhật nếu cần thiết
 */
export async function updateSitemapIfEnabled(skipCheck = false): Promise<boolean> {
  try {
    // Kiểm tra cài đặt tự động cập nhật sitemap
    if (!skipCheck) {
      const autoUpdateSetting = await storage.getSetting('sitemap_auto_update');
      if (!autoUpdateSetting || autoUpdateSetting.value !== 'true') {
        return false; // Không cập nhật nếu tính năng không được bật
      }
    }

    // Import động để tránh circular dependency
    const { generateSitemap } = await import('./sitemap-generator');
    const result = await generateSitemap();
    
    if (result.success) {
      // Cập nhật thời gian tạo sitemap trong cơ sở dữ liệu
      await storage.updateSetting('last_sitemap_update', new Date().toISOString());
      console.log('Sitemap updated automatically after content change');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating sitemap:', error);
    return false;
  }
}