import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createInitialAdminUser, loginUser, registerUser, getUserFromToken, generateToken } from "./auth";
import { type User, periods, events, historicalSites } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

// Middleware kiểm tra xác thực
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authToken = req.headers.authorization?.split(' ')[1];
    
    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await getUserFromToken(authToken);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Lưu thông tin user vào req để sử dụng ở các route handler
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user as User;
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(403).json({ error: 'Forbidden' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Tạo tài khoản admin mặc định khi khởi động
  await createInitialAdminUser();
  // API prefix
  const apiPrefix = '/api';
  
  // Get all periods
  app.get(`${apiPrefix}/periods`, async (req, res) => {
    try {
      const periods = await storage.getAllPeriods();
      res.json(periods);
    } catch (error) {
      console.error('Error fetching periods:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get period by ID
  app.get(`${apiPrefix}/periods/:id`, async (req, res) => {
    try {
      const period = await storage.getPeriodById(parseInt(req.params.id));
      if (!period) {
        return res.status(404).json({ error: 'Period not found' });
      }
      res.json(period);
    } catch (error) {
      console.error('Error fetching period:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get period by slug
  app.get(`${apiPrefix}/periods/slug/:slug`, async (req, res) => {
    try {
      const period = await storage.getPeriodBySlug(req.params.slug);
      if (!period) {
        return res.status(404).json({ error: 'Period not found' });
      }
      res.json(period);
    } catch (error) {
      console.error('Error fetching period by slug:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get all events
  app.get(`${apiPrefix}/events`, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get events by period (using slug) - đặt route này trước route có pattern /:id
  app.get(`${apiPrefix}/events/period-slug/:slug`, async (req, res) => {
    try {
      const events = await storage.getEventsByPeriodSlug(req.params.slug);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events by period slug:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get events by period (using ID)
  app.get(`${apiPrefix}/events/period/:periodId`, async (req, res) => {
    try {
      const events = await storage.getEventsByPeriod(parseInt(req.params.periodId));
      res.json(events);
    } catch (error) {
      console.error('Error fetching events by period ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get event by ID - đặt cuối cùng vì có pattern chung chung nhất
  app.get(`${apiPrefix}/events/:id([0-9]+)`, async (req, res) => {
    try {
      const event = await storage.getEventById(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get all historical figures
  app.get(`${apiPrefix}/historical-figures`, async (req, res) => {
    try {
      const figures = await storage.getAllHistoricalFigures();
      res.json(figures);
    } catch (error) {
      console.error('Error fetching historical figures:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get historical figure by ID
  app.get(`${apiPrefix}/historical-figures/:id`, async (req, res) => {
    try {
      const figure = await storage.getHistoricalFigureById(parseInt(req.params.id));
      if (!figure) {
        return res.status(404).json({ error: 'Historical figure not found' });
      }
      res.json(figure);
    } catch (error) {
      console.error('Error fetching historical figure:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get all event types
  app.get(`${apiPrefix}/event-types`, async (req, res) => {
    try {
      const types = await storage.getAllEventTypes();
      res.json(types);
    } catch (error) {
      console.error('Error fetching event types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get events by event type
  app.get(`${apiPrefix}/events/type/:typeSlug`, async (req, res) => {
    try {
      const events = await storage.getEventsByType(req.params.typeSlug);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events by type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Search API
  app.get(`${apiPrefix}/search`, async (req, res) => {
    try {
      const { term, period, eventType } = req.query;
      
      // Bỏ yêu cầu phải có ít nhất một trong các tham số
      // để cho phép tìm kiếm chỉ với bộ lọc hoặc không có điều kiện
      
      const results = await storage.search(
        term ? String(term) : undefined,
        period ? String(period) : undefined,
        eventType ? String(eventType) : undefined
      );
      
      res.json(results);
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API endpoint để nhận feedback
  app.post(`${apiPrefix}/feedback`, async (req, res) => {
    try {
      const { name, phone, email, content } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!name || !phone || !email || !content) {
        return res.status(400).json({ 
          success: false, 
          error: 'Thiếu thông tin. Vui lòng điền đầy đủ các trường.' 
        });
      }
      
      // Lưu feedback vào database
      const feedback = await storage.createFeedback({
        name,
        phone,
        email,
        content
      });
      
      res.status(201).json({
        success: true,
        message: 'Góp ý của bạn đã được gửi thành công!',
        data: feedback
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại sau.' 
      });
    }
  });

  // Historical sites API routes
  // Get all historical sites
  app.get(`${apiPrefix}/historical-sites`, async (req, res) => {
    try {
      const sites = await storage.getAllHistoricalSites();
      res.json(sites);
    } catch (error) {
      console.error('Error fetching historical sites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get historical site by ID
  app.get(`${apiPrefix}/historical-sites/:id`, async (req, res) => {
    try {
      const site = await storage.getHistoricalSiteById(parseInt(req.params.id));
      if (!site) {
        return res.status(404).json({ error: 'Historical site not found' });
      }
      res.json(site);
    } catch (error) {
      console.error('Error fetching historical site:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get historical sites by period ID
  app.get(`${apiPrefix}/periods/:periodId/historical-sites`, async (req, res) => {
    try {
      const sites = await storage.getHistoricalSitesByPeriod(parseInt(req.params.periodId));
      res.json(sites);
    } catch (error) {
      console.error('Error fetching historical sites by period ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get historical sites by period slug
  app.get(`${apiPrefix}/periods-slug/:slug/historical-sites`, async (req, res) => {
    try {
      const sites = await storage.getHistoricalSitesByPeriodSlug(req.params.slug);
      res.json(sites);
    } catch (error) {
      console.error('Error fetching historical sites by period slug:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Settings API routes
  // Get a setting by key
  app.get(`${apiPrefix}/settings/:key`, async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: 'Thiết lập không tồn tại' });
      }
      res.json(setting);
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get all settings
  app.get(`${apiPrefix}/settings`, async (req, res) => {
    try {
      const allSettings = await storage.getAllSettings();
      res.json(allSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Update a setting
  app.put(`${apiPrefix}/settings/:key`, async (req, res) => {
    try {
      const { value } = req.body;
      
      if (value === undefined) {
        return res.status(400).json({ error: 'Thiếu giá trị thiết lập' });
      }
      
      const updated = await storage.updateSetting(req.params.key, value);
      if (!updated) {
        return res.status(404).json({ error: 'Không thể cập nhật thiết lập' });
      }
      
      res.json(updated);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Initialize default settings
  app.post(`${apiPrefix}/settings/initialize`, async (req, res) => {
    try {
      await storage.initializeDefaultSettings();
      const allSettings = await storage.getAllSettings();
      res.json({
        success: true,
        message: 'Các thiết lập mặc định đã được khởi tạo',
        settings: allSettings
      });
    } catch (error) {
      console.error('Error initializing settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Auth API routes
  // Đăng nhập
  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
        });
      }
      
      const result = await loginUser(username, password);
      
      if (!result.success) {
        return res.status(401).json(result);
      }
      
      // Tạo token cho phiên đăng nhập
      const token = generateToken(result.user!);
      
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        user: result.user,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi đăng nhập' 
      });
    }
  });
  
  // Lấy thông tin người dùng hiện tại
  app.get(`${apiPrefix}/auth/user`, requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json(user);
  });
  
  // API Stats - yêu cầu quyền Admin
  app.get(`${apiPrefix}/admin/stats`, requireAuth, requireAdmin, async (req, res) => {
    try {
      // Đếm tổng số các mục
      const periodsCount = (await storage.getAllPeriods()).length;
      const eventsCount = (await storage.getAllEvents()).length;
      const figuresCount = (await storage.getAllHistoricalFigures()).length;
      const sitesCount = (await storage.getAllHistoricalSites()).length;
      const eventTypesCount = (await storage.getAllEventTypes()).length;
      
      // Feedback chưa được xử lý
      const pendingFeedbackCount = await storage.getPendingFeedbackCount();
      
      res.json({
        periodsCount,
        eventsCount,
        figuresCount,
        sitesCount,
        eventTypesCount,
        pendingFeedbackCount,
        // Các số liệu thống kê giả lập vì chưa có thông tin thực tế
        visitsCount: 1245,
        searchCount: 532
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // API Quản lý thời kỳ
  app.get(`${apiPrefix}/admin/periods`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const periods = await storage.getAllPeriods();
      res.json(periods);
    } catch (error) {
      console.error('Error fetching periods for admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/admin/periods`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const periodData = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!periodData || !periodData.name || !periodData.timeframe || !periodData.description) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu thông tin. Vui lòng điền đầy đủ các trường.' 
        });
      }
      
      // Tạo slug từ tên nếu chưa có
      if (!periodData.slug) {
        periodData.slug = periodData.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      
      // Lấy vị trí sắp xếp cuối cùng (+1)
      const periods = await storage.getAllPeriods();
      const maxSortOrder = periods.length > 0 ? Math.max(...periods.map(p => p.sortOrder)) : -1;
      periodData.sortOrder = maxSortOrder + 1;
      
      // Lưu vào database
      const newPeriod = await storage.createPeriod(periodData);
      
      res.status(201).json({
        success: true,
        message: 'Thêm thời kỳ thành công',
        period: newPeriod
      });
    } catch (error) {
      console.error('Error creating period:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo thời kỳ mới' 
      });
    }
  });
  
  app.put(`${apiPrefix}/admin/periods/:id`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const periodId = parseInt(req.params.id);
      const periodData = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!periodData || !periodData.name || !periodData.timeframe || !periodData.description) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu thông tin. Vui lòng điền đầy đủ các trường.' 
        });
      }
      
      // Cập nhật slug nếu cần
      if (!periodData.slug) {
        periodData.slug = periodData.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      
      // Cập nhật vào database
      const updatedPeriod = await storage.updatePeriod(periodId, periodData);
      
      if (!updatedPeriod) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy thời kỳ' 
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thời kỳ thành công',
        period: updatedPeriod
      });
    } catch (error) {
      console.error('Error updating period:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật thời kỳ' 
      });
    }
  });
  
  app.delete(`${apiPrefix}/admin/periods/:id`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const periodId = parseInt(req.params.id);
      const period = await db.query.periods.findFirst({
        where: eq(periods.id, periodId)
      });
      
      if (!period) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy thời kỳ' 
        });
      }
      
      // Kiểm tra xem có sự kiện nào liên kết với thời kỳ này không
      const eventsInPeriod = await storage.getEventsByPeriod(periodId);
      const hasEvents = eventsInPeriod.length > 0;
      
      // Kiểm tra các di tích liên kết
      const sitesInPeriod = await storage.getHistoricalSitesByPeriod(periodId);
      const hasSites = sitesInPeriod.length > 0;
      
      // Nếu có sự kiện hoặc di tích liên kết, trả về thông tin chi tiết
      if (hasEvents || hasSites) {
        // Lấy danh sách tất cả các thời kỳ để hiển thị trong dropdown
        const allPeriods = await storage.getAllPeriods();
        const otherPeriods = allPeriods.filter(p => p.id !== periodId);
        
        return res.status(400).json({ 
          success: false, 
          message: 'Không thể xóa thời kỳ này vì có các mục liên kết.',
          data: {
            periodName: period.name,
            events: eventsInPeriod,
            sites: sitesInPeriod,
            availablePeriods: otherPeriods
          }
        });
      }
      
      // Xóa thời kỳ nếu không có mục liên kết
      const deleted = await storage.deletePeriod(periodId);
      
      if (!deleted) {
        return res.status(500).json({ 
          success: false, 
          message: 'Lỗi khi xóa thời kỳ' 
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa thời kỳ thành công'
      });
    } catch (error) {
      console.error('Error deleting period:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa thời kỳ' 
      });
    }
  });
  
  // API để gán lại các sự kiện và di tích từ thời kỳ này sang thời kỳ khác
  app.post(`${apiPrefix}/admin/periods/:id/reassign`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const sourceId = parseInt(req.params.id);
      const { targetPeriodId } = req.body;
      
      if (!targetPeriodId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu ID thời kỳ đích' 
        });
      }
      
      // Kiểm tra thời kỳ nguồn có tồn tại không
      const sourcePeriod = await db.query.periods.findFirst({
        where: eq(periods.id, sourceId)
      });
      
      if (!sourcePeriod) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy thời kỳ nguồn' 
        });
      }
      
      // Kiểm tra thời kỳ đích có tồn tại không
      const targetPeriod = await db.query.periods.findFirst({
        where: eq(periods.id, targetPeriodId)
      });
      
      if (!targetPeriod) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy thời kỳ đích' 
        });
      }
      
      // Cập nhật các sự kiện
      await db.update(events)
         .set({ periodId: targetPeriodId })
         .where(eq(events.periodId, sourceId));
      
      // Cập nhật các di tích
      await db.update(historicalSites)
         .set({ periodId: targetPeriodId })
         .where(eq(historicalSites.periodId, sourceId));
      
      res.json({
        success: true,
        message: `Đã chuyển tất cả sự kiện và di tích từ "${sourcePeriod.name}" sang "${targetPeriod.name}"`
      });
    } catch (error) {
      console.error('Error reassigning items:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi gán lại các mục liên kết' 
      });
    }
  });
  
  // API để xóa tất cả các sự kiện và di tích liên kết với một thời kỳ
  app.post(`${apiPrefix}/admin/periods/:id/delete-content`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const periodId = parseInt(req.params.id);
      
      // Kiểm tra thời kỳ có tồn tại không
      const period = await db.query.periods.findFirst({
        where: eq(periods.id, periodId)
      });
      
      if (!period) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy thời kỳ' 
        });
      }
      
      // Xóa các sự kiện
      const eventsResult = await db.delete(events)
         .where(eq(events.periodId, periodId));
      
      // Xóa các di tích
      const sitesResult = await db.delete(historicalSites)
         .where(eq(historicalSites.periodId, periodId));
      
      res.json({
        success: true,
        message: `Đã xóa tất cả sự kiện và di tích liên kết với thời kỳ "${period.name}"`
      });
    } catch (error) {
      console.error('Error deleting related items:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa các mục liên kết' 
      });
    }
  });

  // API Reorder Periods - tạo mới hoàn toàn, tiếp cận đơn giản hơn
  app.post(`${apiPrefix}/periods/sort`, requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('PERIOD SORT REQUEST:', req.body);
      
      // Kiểm tra dữ liệu đầu vào là mảng
      if (!Array.isArray(req.body)) {
        return res.status(400).json({
          success: false,
          message: 'Yêu cầu dữ liệu là mảng các ID'
        });
      }
      
      // Biến mảng ID thành số nguyên
      const periodIds = req.body.map(id => typeof id === 'string' ? parseInt(id, 10) : Number(id));
      
      console.log('Processed IDs for sorting:', periodIds);
      
      // Kiểm tra có ID hợp lệ không
      if (periodIds.some(id => isNaN(id) || id <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách chứa ID không hợp lệ'
        });
      }
      
      // Cập nhật từng period một
      for (let i = 0; i < periodIds.length; i++) {
        await db.update(periods)
               .set({ sortOrder: i })
               .where(eq(periods.id, periodIds[i]));
        
        console.log(`Updated period ${periodIds[i]} with sortOrder ${i}`);
      }
      
      // Luôn trả về định dạng JSON hợp lệ
      return res.json({
        success: true,
        message: 'Cập nhật thứ tự thành công'
      });
      
    } catch (error) {
      console.error('Error sorting periods:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi sắp xếp thời kỳ.'
      });
    }
  });
  
  // API Quản lý loại sự kiện
  app.get(`${apiPrefix}/admin/event-types`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const eventTypes = await storage.getAllEventTypes();
      res.json(eventTypes);
    } catch (error) {
      console.error('Error fetching event types for admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/admin/event-types`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const typeData = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!typeData || !typeData.name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu tên loại sự kiện' 
        });
      }
      
      // Tạo slug từ tên nếu chưa có
      if (!typeData.slug) {
        typeData.slug = typeData.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      
      // Lấy vị trí sắp xếp cuối cùng (+1)
      const types = await storage.getAllEventTypes();
      const maxSortOrder = types.length > 0 ? Math.max(...types.map(t => t.sortOrder)) : -1;
      typeData.sortOrder = maxSortOrder + 1;
      
      // Lưu vào database
      const newType = await storage.createEventType(typeData);
      
      res.status(201).json({
        success: true,
        message: 'Thêm loại sự kiện thành công',
        eventType: newType
      });
    } catch (error) {
      console.error('Error creating event type:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo loại sự kiện mới' 
      });
    }
  });
  
  app.put(`${apiPrefix}/admin/event-types/:id`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const typeId = parseInt(req.params.id);
      const typeData = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!typeData || !typeData.name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu tên loại sự kiện' 
        });
      }
      
      // Cập nhật slug nếu cần
      if (!typeData.slug) {
        typeData.slug = typeData.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      
      // Cập nhật vào database
      const updatedType = await storage.updateEventType(typeId, typeData);
      
      if (!updatedType) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy loại sự kiện' 
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật loại sự kiện thành công',
        eventType: updatedType
      });
    } catch (error) {
      console.error('Error updating event type:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật loại sự kiện' 
      });
    }
  });
  
  app.delete(`${apiPrefix}/admin/event-types/:id`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const typeId = parseInt(req.params.id);
      
      // Kiểm tra xem có sự kiện nào sử dụng loại này không
      const relatedEvents = await storage.getEventsUsingEventType(typeId);
      if (relatedEvents.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Không thể xóa loại sự kiện này vì có các sự kiện sử dụng. Vui lòng gỡ liên kết trước.' 
        });
      }
      
      // Xóa loại sự kiện
      const deleted = await storage.deleteEventType(typeId);
      
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy loại sự kiện' 
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa loại sự kiện thành công'
      });
    } catch (error) {
      console.error('Error deleting event type:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa loại sự kiện' 
      });
    }
  });
  
  app.put(`${apiPrefix}/admin/event-types/reorder`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const { orderedIds } = req.body;
      
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({
          success: false,
          message: 'Sai định dạng dữ liệu. Cần cung cấp mảng ID.'
        });
      }
      
      const success = await storage.reorderEventTypes(orderedIds);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Không thể sắp xếp lại thứ tự.'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thứ tự thành công'
      });
    } catch (error) {
      console.error('Error reordering event types:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi sắp xếp lại thứ tự'
      });
    }
  });
  
  // API quản lý sự kiện cho admin
  app.get(`${apiPrefix}/admin/events`, requireAuth, requireAdmin, async (req, res) => {
    try {
      // Lấy danh sách sự kiện kèm theo thông tin loại sự kiện
      const allEvents = await storage.getAllEventsWithTypes();
      res.json(allEvents);
    } catch (error) {
      console.error('Error fetching events for admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post(`${apiPrefix}/admin/events`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const eventData = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!eventData || !eventData.title || !eventData.periodId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ' 
        });
      }
      
      // Xử lý eventTypes từ mảng ID thành mảng đối tượng liên kết
      const eventTypeIds = eventData.eventTypes || [];
      delete eventData.eventTypes; // Xóa trường eventTypes khỏi dữ liệu chính
      
      // Tạo slug từ title nếu chưa có
      if (!eventData.slug) {
        eventData.slug = eventData.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      
      // Lấy vị trí sắp xếp cuối cùng (+1) cho sự kiện trong cùng thời kỳ
      const eventsInPeriod = await storage.getEventsByPeriod(parseInt(eventData.periodId.toString()));
      const maxSortOrder = eventsInPeriod.length > 0 ? 
        Math.max(...eventsInPeriod.map(e => e.sortOrder || 0)) : -1;
      eventData.sortOrder = maxSortOrder + 1;
      
      // Xử lý hình ảnh base64 nếu có
      if (eventData.imageUrl && eventData.imageUrl.startsWith('data:image')) {
        // Xử lý upload hình ảnh base64 - đoạn này nên có logic lưu hình ảnh vào server
        // Giữ nguyên chuỗi base64 cho demo
      }
      
      // Lưu sự kiện vào database
      const newEvent = await storage.createEvent(eventData);
      
      // Lưu các liên kết với loại sự kiện
      if (eventTypeIds.length > 0) {
        await storage.associateEventWithTypes(newEvent.id, eventTypeIds);
      }
      
      res.status(201).json({
        success: true,
        message: 'Thêm sự kiện thành công',
        event: newEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo sự kiện mới' 
      });
    }
  });
  
  app.put(`${apiPrefix}/admin/events/:id`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!eventData || !eventData.title || !eventData.periodId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dữ liệu không hợp lệ' 
        });
      }
      
      // Xử lý eventTypes từ mảng ID thành mảng đối tượng liên kết
      const eventTypeIds = eventData.eventTypes || [];
      delete eventData.eventTypes; // Xóa trường eventTypes khỏi dữ liệu chính
      
      // Cập nhật slug từ title nếu cần
      if (!eventData.slug) {
        eventData.slug = eventData.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      
      // Xử lý hình ảnh base64 nếu có
      if (eventData.imageUrl && eventData.imageUrl.startsWith('data:image')) {
        // Xử lý upload hình ảnh base64 - đoạn này nên có logic lưu hình ảnh vào server
        // Giữ nguyên chuỗi base64 cho demo
      }
      
      // Cập nhật sự kiện trong database
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      
      if (!updatedEvent) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy sự kiện' 
        });
      }
      
      // Cập nhật các liên kết với loại sự kiện
      await storage.removeEventTypeAssociations(eventId); // Xóa liên kết hiện tại
      if (eventTypeIds.length > 0) {
        await storage.associateEventWithTypes(eventId, eventTypeIds); // Thêm liên kết mới
      }
      
      res.json({
        success: true,
        message: 'Cập nhật sự kiện thành công',
        event: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật sự kiện' 
      });
    }
  });
  
  app.delete(`${apiPrefix}/admin/events/:id`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Xóa các liên kết với loại sự kiện trước
      await storage.removeEventTypeAssociations(eventId);
      
      // Xóa sự kiện
      const deleted = await storage.deleteEvent(eventId);
      
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy sự kiện' 
        });
      }
      
      res.json({
        success: true,
        message: 'Xóa sự kiện thành công'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa sự kiện' 
      });
    }
  });
  
  app.post(`${apiPrefix}/admin/events/reorder`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const { orderedIds } = req.body;
      
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({
          success: false,
          message: 'Sai định dạng dữ liệu. Cần cung cấp mảng ID.'
        });
      }
      
      const success = await storage.reorderEvents(orderedIds);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Không thể sắp xếp lại thứ tự.'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thứ tự thành công'
      });
    } catch (error) {
      console.error('Error reordering events:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi sắp xếp lại thứ tự'
      });
    }
  });

  // API quản lý feedback
  app.get(`${apiPrefix}/admin/feedback`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const feedbacks = await storage.getAllFeedback();
      res.json(feedbacks);
    } catch (error) {
      console.error('Error fetching feedback for admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.put(`${apiPrefix}/admin/feedback/:id`, requireAuth, requireAdmin, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const { resolved, response } = req.body;
      
      if (resolved === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu trạng thái xử lý' 
        });
      }
      
      const updatedFeedback = await storage.updateFeedbackStatus(feedbackId, resolved, response);
      
      if (!updatedFeedback) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy phản hồi' 
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái phản hồi thành công',
        feedback: updatedFeedback
      });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật trạng thái phản hồi' 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
