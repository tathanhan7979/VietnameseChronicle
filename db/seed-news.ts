import { db } from './index';
import { news, insertNewsSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedNews() {
  console.log('Bắt đầu tạo dữ liệu tin tức mẫu...');
  
  // Kiểm tra xem đã có tin tức trong cơ sở dữ liệu chưa
  const existingNews = await db.query.news.findMany({
    limit: 1
  });
  
  if (existingNews.length > 0) {
    console.log('Đã có dữ liệu tin tức trong cơ sở dữ liệu, bỏ qua việc tạo dữ liệu mẫu.');
    return;
  }
  
  // Dữ liệu tin tức mẫu
  const sampleNews = [
    {
      title: 'Khám phá di tích Văn Miếu - Quốc Tử Giám',
      slug: 'kham-pha-di-tich-van-mieu-quoc-tu-giam',
      summary: 'Văn Miếu - Quốc Tử Giám là một trong những di tích lịch sử văn hóa quan trọng nhất của Việt Nam, nơi lưu giữ và tôn vinh những giá trị truyền thống về giáo dục và khoa cử của dân tộc.',
      content: `<h2>Lịch sử hình thành</h2>
      <p>Văn Miếu được xây dựng vào năm 1070 dưới triều vua Lý Thánh Tông để thờ Khổng Tử và các bậc hiền triết. Đến năm 1076, vua Lý Nhân Tông cho xây dựng Quốc Tử Giám bên cạnh Văn Miếu, trở thành trường đại học đầu tiên của Việt Nam.</p>
      
      <h2>Kiến trúc độc đáo</h2>
      <p>Văn Miếu - Quốc Tử Giám được xây dựng theo kiến trúc truyền thống với hệ thống cổng, sân, điện thờ và khu vực học tập. Đặc biệt, khu vực 82 bia Tiến sĩ là nơi ghi danh các vị khoa bảng qua các triều đại phong kiến Việt Nam.</p>
      
      <h2>Giá trị văn hóa</h2>
      <p>Văn Miếu - Quốc Tử Giám không chỉ là di tích lịch sử mà còn là biểu tượng của nền giáo dục Việt Nam truyền thống, nơi lưu giữ và tôn vinh những giá trị học thuật, tinh thần hiếu học của dân tộc Việt Nam.</p>`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Temple_of_Literature%2C_Hanoi.jpg/1200px-Temple_of_Literature%2C_Hanoi.jpg',
      is_published: true,
      is_featured: true,
      view_count: 120,
      period_id: null, // Sẽ được cập nhật sau khi lấy dữ liệu thực tế
      event_id: null,
      figure_id: null,
      site_id: null
    },
    {
      title: 'Khởi nghĩa Lam Sơn - Cuộc kháng chiến vĩ đại chống quân Minh',
      slug: 'khoi-nghia-lam-son-cuoc-khang-chien-vi-dai-chong-quan-minh',
      summary: 'Khởi nghĩa Lam Sơn do Lê Lợi lãnh đạo là một trong những trang sử vẻ vang nhất trong lịch sử đấu tranh giành độc lập của dân tộc Việt Nam.',
      content: `<h2>Bối cảnh lịch sử</h2>
      <p>Đầu thế kỷ XV, sau khi nhà Hồ sụp đổ, quân Minh đô hộ nước ta, thi hành chính sách cai trị hà khắc. Trước tình hình đó, năm 1418, Lê Lợi đã phất cờ khởi nghĩa tại Lam Sơn (Thanh Hóa), mở đầu cuộc kháng chiến trường kỳ chống quân Minh xâm lược.</p>
      
      <h2>Quá trình kháng chiến</h2>
      <p>Từ một đội quân nhỏ ban đầu, dưới sự lãnh đạo tài tình của Lê Lợi và sự giúp sức của các tướng tài như Nguyễn Trãi, Trần Nguyên Hãn, Lê Sát..., nghĩa quân Lam Sơn đã từng bước lớn mạnh, giành nhiều thắng lợi quan trọng.</p>
      
      <h2>Chiến thắng vẻ vang</h2>
      <p>Sau 10 năm kháng chiến gian khổ, nghĩa quân Lam Sơn đã giành thắng lợi hoàn toàn, buộc quân Minh phải đầu hàng và rút về nước. Năm 1428, Lê Lợi lên ngôi hoàng đế, lập nên triều đại nhà Lê, mở ra một thời kỳ phát triển mới cho đất nước.</p>`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Le_Loi_statue.jpg/800px-Le_Loi_statue.jpg',
      is_published: true,
      is_featured: true,
      view_count: 87,
      period_id: null,
      event_id: null,
      figure_id: null,
      site_id: null
    },
    {
      title: 'Nhà sử học Phan Huy Lê và những đóng góp cho sử học Việt Nam',
      slug: 'nha-su-hoc-phan-huy-le-va-nhung-dong-gop-cho-su-hoc-viet-nam',
      summary: 'GS.TS Phan Huy Lê là một trong những nhà sử học hàng đầu Việt Nam, người có nhiều đóng góp quan trọng trong việc nghiên cứu và phát triển ngành sử học nước nhà.',
      content: `<h2>Cuộc đời và sự nghiệp</h2>
      <p>GS.TS Phan Huy Lê sinh năm 1934, quê ở Thạch Khôi, Hải Dương. Ông tốt nghiệp khoa Sử trường Đại học Sư phạm Hà Nội và có sự nghiệp gắn liền với Khoa Lịch sử, Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Hà Nội.</p>
      
      <h2>Đóng góp học thuật</h2>
      <p>GS Phan Huy Lê đã có những công trình nghiên cứu quan trọng về lịch sử Việt Nam, đặc biệt là về chế độ ruộng đất, làng xã Việt Nam thời phong kiến, lịch sử Thăng Long - Hà Nội. Ông là tác giả và đồng tác giả của nhiều công trình có giá trị như "Lịch sử chế độ phong kiến Việt Nam", "Thăng Long - Hà Nội, nghìn năm văn hiến"...</p>
      
      <h2>Di sản để lại</h2>
      <p>GS Phan Huy Lê đã đào tạo nhiều thế hệ sinh viên, học viên cao học và nghiên cứu sinh, góp phần quan trọng vào sự phát triển của ngành sử học Việt Nam. Ông mất năm 2018, để lại niềm tiếc thương cho giới sử học và những người yêu mến lịch sử.</p>`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/vi/thumb/4/4d/GS.TS_Phan_Huy_L%C3%AA.jpg/220px-GS.TS_Phan_Huy_L%C3%AA.jpg',
      is_published: true,
      is_featured: false,
      view_count: 63,
      period_id: null,
      event_id: null,
      figure_id: null,
      site_id: null
    },
    {
      title: 'Phát hiện mới về Hoàng thành Thăng Long qua đợt khai quật 2022',
      slug: 'phat-hien-moi-ve-hoang-thanh-thang-long-qua-dot-khai-quat-2022',
      summary: 'Đợt khai quật khảo cổ học Hoàng thành Thăng Long năm 2022 đã mang đến những phát hiện mới về kiến trúc cung điện thời Lý - Trần.',
      content: `<h2>Đợt khai quật 2022</h2>
      <p>Năm 2022, Viện Khảo cổ học phối hợp với Trung tâm Bảo tồn Di sản Thăng Long - Hà Nội tổ chức đợt khai quật tại khu vực phía Đông Bắc của Hoàng thành Thăng Long, nhằm tìm hiểu thêm về cấu trúc kiến trúc cung điện thời Lý - Trần.</p>
      
      <h2>Những phát hiện mới</h2>
      <p>Qua đợt khai quật, các nhà khảo cổ đã phát hiện thêm nhiều dấu tích kiến trúc quan trọng như nền móng cung điện, hệ thống thoát nước, gạch ngói trang trí... Đặc biệt, các hiện vật gốm sứ tìm thấy có niên đại từ thời Lý đến thời Trần, giúp làm rõ hơn về đời sống cung đình thời kỳ này.</p>
      
      <h2>Ý nghĩa khoa học</h2>
      <p>Những phát hiện mới này có ý nghĩa quan trọng trong việc nghiên cứu lịch sử, kiến trúc Hoàng thành Thăng Long nói riêng và lịch sử Việt Nam thời Lý - Trần nói chung. Đồng thời, đây cũng là cơ sở khoa học cho công tác bảo tồn và phát huy giá trị di sản Hoàng thành Thăng Long.</p>`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Imperial_Citadel_of_Thang_Long.jpg/1200px-Imperial_Citadel_of_Thang_Long.jpg',
      is_published: true,
      is_featured: false,
      view_count: 45,
      period_id: null,
      event_id: null,
      figure_id: null,
      site_id: null
    },
    {
      title: 'Ý nghĩa của Chiến thắng Điện Biên Phủ trong lịch sử dân tộc',
      slug: 'y-nghia-cua-chien-thang-dien-bien-phu-trong-lich-su-dan-toc',
      summary: 'Chiến thắng Điện Biên Phủ 1954 là một mốc son chói lọi trong lịch sử đấu tranh giành độc lập dân tộc, đánh dấu sự sụp đổ của chủ nghĩa thực dân Pháp tại Việt Nam.',
      content: `<h2>Bối cảnh lịch sử</h2>
      <p>Sau 8 năm kháng chiến chống thực dân Pháp, đầu năm 1954, Pháp quyết định tập trung quân xây dựng Điện Biên Phủ thành một tập đoàn cứ điểm mạnh nhất Đông Dương. Trước tình hình đó, Đảng và Chính phủ ta quyết định mở chiến dịch Điện Biên Phủ.</p>
      
      <h2>Diễn biến chiến dịch</h2>
      <p>Chiến dịch Điện Biên Phủ diễn ra từ ngày 13/3 đến 7/5/1954. Dưới sự chỉ huy tài tình của Đại tướng Võ Nguyên Giáp cùng tinh thần chiến đấu anh dũng của quân và dân ta, sau 56 ngày đêm chiến đấu gian khổ, quân ta đã giành thắng lợi hoàn toàn, bắt sống toàn bộ quân địch, trong đó có tướng De Castries.</p>
      
      <h2>Ý nghĩa lịch sử</h2>
      <p>Chiến thắng Điện Biên Phủ có ý nghĩa lịch sử to lớn. Trên phạm vi quốc tế, đây là thắng lợi tiêu biểu của phong trào giải phóng dân tộc, góp phần làm sụp đổ hệ thống thuộc địa của chủ nghĩa thực dân. Đối với dân tộc ta, chiến thắng này đã buộc Pháp phải ký Hiệp định Genève (1954), chấm dứt chiến tranh, lập lại hòa bình ở Đông Dương, miền Bắc nước ta được hoàn toàn giải phóng.</p>`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Dien_Bien_Phu_View.jpg/1200px-Dien_Bien_Phu_View.jpg',
      is_published: true,
      is_featured: false,
      view_count: 78,
      period_id: null,
      event_id: null,
      figure_id: null,
      site_id: null
    }
  ];
  
  // Lấy period_id cho tin tức
  try {
    // Lấy thông tin về các thời kỳ
    const periods = await db.query.periods.findMany();
    
    if (periods.length > 0) {
      const lyTranPeriod = periods.find(p => p.name.includes('Lý') || p.name.includes('Trần'));
      const leSoPeriod = periods.find(p => p.name.includes('Lê sơ'));
      const hienDaiPeriod = periods.find(p => p.name.includes('Hiện đại') || p.name.includes('Đương đại'));
      
      if (lyTranPeriod) {
        // Tin tức về Văn Miếu, Hoàng thành Thăng Long
        sampleNews[0].period_id = lyTranPeriod.id;
        sampleNews[3].period_id = lyTranPeriod.id;
      }
      
      if (leSoPeriod) {
        // Tin tức về Khởi nghĩa Lam Sơn
        sampleNews[1].period_id = leSoPeriod.id;
      }
      
      if (hienDaiPeriod) {
        // Tin tức về Điện Biên Phủ
        sampleNews[4].period_id = hienDaiPeriod.id;
      }
    }
    
    // Thêm tin tức vào cơ sở dữ liệu
    for (const newsItem of sampleNews) {
      try {
        const validatedNews = insertNewsSchema.parse(newsItem);
        await db.insert(news).values(validatedNews);
        console.log(`Đã thêm tin tức: ${newsItem.title}`);
      } catch (error) {
        console.error(`Lỗi khi thêm tin tức "${newsItem.title}":`, error);
      }
    }
    
    console.log('Đã tạo dữ liệu tin tức mẫu thành công!');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu tin tức mẫu:', error);
  }
}

// Chạy hàm tạo dữ liệu tin tức mẫu
seedNews()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Lỗi không xác định:', error);
    process.exit(1);
  });