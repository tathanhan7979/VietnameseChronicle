import { exec } from 'child_process';

console.log('🔍 Bắt đầu chạy script tối ưu hóa tất cả ảnh...');
console.log('⏳ Vui lòng đợi, quá trình này có thể mất một vài phút tùy thuộc vào số lượng ảnh...');

exec('tsx server/scripts/optimize-images.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Lỗi thực thi: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`❌ Lỗi: ${stderr}`);
    return;
  }
  
  console.log('✅ Kết quả tối ưu hóa ảnh:');
  console.log(stdout);
  console.log('✅ Tối ưu hóa ảnh hoàn tất!');
});