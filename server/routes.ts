import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
  
  // Get events by period
  app.get(`${apiPrefix}/events/period/:periodId`, async (req, res) => {
    try {
      const events = await storage.getEventsByPeriod(parseInt(req.params.periodId));
      res.json(events);
    } catch (error) {
      console.error('Error fetching events by period:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get event by ID
  app.get(`${apiPrefix}/events/:id`, async (req, res) => {
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
      console.error('Error fetching historical sites by period:', error);
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
