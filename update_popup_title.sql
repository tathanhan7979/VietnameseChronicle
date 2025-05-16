-- Thêm cài đặt cho tiêu đề popup nếu chưa tồn tại
INSERT INTO settings (key, value, description, display_name, category, input_type, sort_order)
SELECT 'popup_title', 'Thông báo quan trọng', 'Tiêu đề của thông báo popup', 'Tiêu đề popup', 'Thông báo', 'text', 505
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'popup_title');

-- Cập nhật category nếu chưa được thiết lập đúng
UPDATE settings SET category = 'Thông báo' WHERE key = 'popup_title' AND category != 'Thông báo';