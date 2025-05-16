-- Thêm cài đặt cho popup notification
-- Thực hiện thêm các cài đặt mới nếu chưa tồn tại
INSERT INTO settings (key, value, description, display_name, category, input_type, sort_order)
SELECT 'popup_notification', '<h2 style="text-align: center; color: #CF2A27;">Thông báo quan trọng</h2><p style="text-align: center;">Chào mừng bạn đến với Lịch Sử Việt Nam!</p><p style="text-align: center;">Chúng tôi vừa cập nhật nhiều nội dung mới về các thời kỳ lịch sử.</p>', 'Nội dung thông báo popup hiển thị cho người dùng khi truy cập trang', 'Nội dung thông báo', 'Thông báo', 'rich_text', 500
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'popup_notification');

INSERT INTO settings (key, value, description, display_name, category, input_type, sort_order)
SELECT 'popup_enabled', 'true', 'Bật/tắt tính năng hiển thị thông báo popup', 'Bật thông báo', 'Thông báo', 'select', 510
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'popup_enabled');

INSERT INTO settings (key, value, description, display_name, category, input_type, sort_order)
SELECT 'popup_duration', '24', 'Thời gian (giờ) hiển thị lại thông báo sau khi đã đóng', 'Thời gian hiển thị lại (giờ)', 'Thông báo', 'number', 520
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'popup_duration');

-- Cập nhật input_type cho popup_enabled nếu đã tồn tại nhưng không phải kiểu select
UPDATE settings SET input_type = 'select' WHERE key = 'popup_enabled' AND input_type != 'select';

-- Cập nhật category nếu chưa được thiết lập đúng
UPDATE settings SET category = 'Thông báo' WHERE key IN ('popup_notification', 'popup_enabled', 'popup_duration') AND category != 'Thông báo';

-- Thêm nội dung mẫu cho popup_notification nếu trống
UPDATE settings SET value = '<h2 style="text-align: center; color: #CF2A27;">Thông báo quan trọng</h2><p style="text-align: center;">Chào mừng bạn đến với Lịch Sử Việt Nam!</p><p style="text-align: center;">Chúng tôi vừa cập nhật nhiều nội dung mới về các thời kỳ lịch sử.</p>' 
WHERE key = 'popup_notification' AND (value IS NULL OR value = '');