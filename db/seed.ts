import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

// Interface for seed data with eventType field
interface EventSeedData extends Omit<schema.InsertEvent, 'id'> {
  eventType?: string;
}

async function seed() {
  try {
    console.log("Starting to seed database with Vietnamese history data...");
    
    // Seed historical periods
    console.log("Seeding historical periods...");
    const periodsData: schema.InsertPeriod[] = [
      {
        name: "Thời Tiền Sử - Hồng Bàng",
        slug: "prehistoric",
        timeframe: "2879 TCN - 258 TCN",
        description: "Thời kỳ huyền thoại về nguồn gốc dân tộc Việt Nam với truyền thuyết Lạc Long Quân và Âu Cơ.",
        icon: "history",
        sortOrder: 1
      },
      {
        name: "Thời Đại Các Vua Hùng",
        slug: "ancient",
        timeframe: "2879 TCN - 258 TCN",
        description: "Thời kỳ các Vua Hùng cai trị nước Văn Lang, đặt nền móng cho quốc gia đầu tiên của người Việt.",
        icon: "account_balance",
        sortOrder: 2
      },
      {
        name: "Nước Âu Lạc",
        slug: "au-lac",
        timeframe: "257 TCN - 179 TCN",
        description: "Thục Phán (An Dương Vương) sáp nhập Âu Việt và Lạc Việt thành Âu Lạc, xây thành Cổ Loa.",
        icon: "public",
        sortOrder: 3
      },
      {
        name: "Thời Kỳ Bắc Thuộc",
        slug: "chinese-domination",
        timeframe: "179 TCN - 938",
        description: "Thời kỳ Việt Nam bị phương Bắc đô hộ, trải qua nhiều triều đại và cuộc khởi nghĩa giành độc lập.",
        icon: "gavel",
        sortOrder: 4
      },
      {
        name: "Thời Ngô - Đinh - Tiền Lê",
        slug: "ngo-dinh",
        timeframe: "939 - 1009",
        description: "Ba triều đại ngắn ngủi đặt nền móng cho nền độc lập của Đại Việt sau thời kỳ Bắc thuộc.",
        icon: "architecture",
        sortOrder: 5
      },
      {
        name: "Nhà Lý",
        slug: "ly",
        timeframe: "1009 - 1225",
        description: "Triều đại mở đầu thời kỳ phát triển Đại Việt, chuyển đô về Thăng Long, xây dựng thể chế phong kiến vững mạnh.",
        icon: "castle",
        sortOrder: 6
      },
      {
        name: "Nhà Trần",
        slug: "tran",
        timeframe: "1225 - 1400",
        description: "Triều đại nổi tiếng với ba lần đánh bại quân Nguyên Mông và là thời kỳ văn hóa phát triển rực rỡ.",
        icon: "military_tech",
        sortOrder: 7
      },
      {
        name: "Nhà Hồ & Minh Thuộc",
        slug: "ho-and-ming",
        timeframe: "1400 - 1427",
        description: "Thời kỳ ngắn ngủi của nhà Hồ và 20 năm Đại Việt bị nhà Minh đô hộ.",
        icon: "security",
        sortOrder: 8
      },
      {
        name: "Nhà Lê",
        slug: "le",
        timeframe: "1428 - 1788",
        description: "Thời kỳ dài nhất trong lịch sử phong kiến Việt Nam, với nhiều thăng trầm và chia rẽ Nam Bắc triều.",
        icon: "psychology",
        sortOrder: 9
      },
      {
        name: "Tây Sơn",
        slug: "tay-son",
        timeframe: "1788 - 1802",
        description: "Triều đại ngắn ngủi do anh em nhà Tây Sơn lập nên, nổi tiếng với việc đánh bại quân Xiêm và quân Thanh.",
        icon: "local_fire_department",
        sortOrder: 10
      },
      {
        name: "Nhà Nguyễn",
        slug: "nguyen",
        timeframe: "1802 - 1945",
        description: "Triều đại phong kiến cuối cùng của Việt Nam, chứng kiến sự xâm lược của thực dân Pháp.",
        icon: "stars",
        sortOrder: 11
      },
      {
        name: "Thời Kỳ Pháp Thuộc",
        slug: "french",
        timeframe: "1858 - 1945",
        description: "Thời kỳ Việt Nam dưới sự đô hộ của thực dân Pháp, với nhiều phong trào yêu nước và đấu tranh giành độc lập.",
        icon: "flag",
        sortOrder: 12
      },
      {
        name: "Việt Nam Hiện Đại",
        slug: "modern",
        timeframe: "1945 - nay",
        description: "Thời kỳ từ khi tuyên bố độc lập đến nay, trải qua chiến tranh giành độc lập, thống nhất và xây dựng đất nước.",
        icon: "brightness_7",
        sortOrder: 13
      }
    ];
    
    // Insert periods
    for (const period of periodsData) {
      const existingPeriod = await db.query.periods.findFirst({
        where: eq(schema.periods.slug, period.slug)
      });
      
      if (!existingPeriod) {
        await db.insert(schema.periods).values(period);
      }
    }
    
    // Get all periods after insertion to get their IDs
    const insertedPeriods = await db.query.periods.findMany({
      orderBy: schema.periods.sortOrder
    });
    
    // Create a mapping of slug to period ID
    const periodMap: Record<string, number> = {};
    insertedPeriods.forEach(period => {
      periodMap[period.slug] = period.id;
    });
    
    // Seed historical events
    console.log("Seeding historical events...");
    const eventsData: EventSeedData[] = [
      // Prehistoric era
      {
        periodId: periodMap['prehistoric'],
        title: "Văn Hóa Đông Sơn",
        description: "Văn hóa Đông Sơn là một nền văn hóa thời đại đồ đồng, phát triển ở miền Bắc Việt Nam. Người Đông Sơn đã sáng tạo ra những chiếc trống đồng tinh xảo với nhiều hoa văn phức tạp.",
        year: "700 TCN - 100 TCN",
        imageUrl: "https://images.unsplash.com/photo-1588411393236-d2524cca2188?q=80&w=2127",
        sortOrder: 1
      },
      {
        periodId: periodMap['prehistoric'],
        title: "Truyền Thuyết Con Rồng Cháu Tiên",
        description: "Theo truyền thuyết, người Việt là con cháu của Lạc Long Quân và Âu Cơ. Âu Cơ đẻ ra một bọc trứng, nở ra một trăm người con trai. Đây là khởi nguồn của Bách Việt, trong đó có tổ tiên người Việt.",
        year: "Truyền thuyết",
        eventType: "Truyền thuyết",
        sortOrder: 2
      },
      
      // Ancient Vietnam - Hung Kings
      {
        periodId: periodMap['ancient'],
        title: "Nhà Nước Văn Lang",
        description: "Nhà nước Văn Lang là nhà nước đầu tiên của người Việt, được các Vua Hùng xây dựng với kinh đô ở Phong Châu (Phú Thọ ngày nay).",
        year: "2879 TCN - 258 TCN",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
        sortOrder: 1
      },
      {
        periodId: periodMap['ancient'],
        title: "Lễ Hội Đền Hùng",
        description: "Lễ hội Đền Hùng là một trong những lễ hội lớn và quan trọng nhất của Việt Nam, được tổ chức hàng năm vào ngày 10 tháng 3 âm lịch để tưởng nhớ các Vua Hùng - những người đã có công dựng nước.",
        year: "Hàng năm",
        eventType: "Di sản văn hóa",
        sortOrder: 2
      },
      
      // Au Lac
      {
        periodId: periodMap['au-lac'],
        title: "An Dương Vương & Thành Cổ Loa",
        description: "Thục Phán (An Dương Vương) đánh bại Vua Hùng cuối cùng, hợp nhất bộ tộc Âu Việt và Lạc Việt, lập nên nước Âu Lạc. Ông cho xây dựng Thành Cổ Loa hình xoắn ốc làm kinh đô.",
        year: "257 TCN",
        imageUrl: "https://images.unsplash.com/photo-1560346658-0a5f9e8df7f3?q=80&w=2070",
        sortOrder: 1
      },
      {
        periodId: periodMap['au-lac'],
        title: "Truyền Thuyết Nỏ Thần",
        description: "Theo truyền thuyết, An Dương Vương được thần Kim Quy tặng móng rùa làm lẫy nỏ thần. Nỏ thần này có thể bắn hàng ngàn mũi tên cùng lúc, giúp An Dương Vương đánh bại kẻ thù.",
        year: "Truyền thuyết",
        eventType: "Truyền thuyết",
        sortOrder: 2
      },
      
      // Chinese domination
      {
        periodId: periodMap['chinese-domination'],
        title: "Hai Bà Trưng Khởi Nghĩa",
        description: "Trưng Trắc và Trưng Nhị đã lãnh đạo cuộc khởi nghĩa chống lại quân Hán. Họ đã giành được độc lập ngắn ngủi và Trưng Trắc trở thành nữ vương đầu tiên của Việt Nam.",
        year: "40 - 43",
        imageUrl: "https://images.unsplash.com/photo-1582995580100-3a297eba1e0f?q=80&w=2070",
        sortOrder: 1
      },
      {
        periodId: periodMap['chinese-domination'],
        title: "Bà Triệu Khởi Nghĩa",
        description: "Bà Triệu có câu nói nổi tiếng: 'Tôi muốn cưỡi cơn gió mạnh, đạp đường sóng dữ, chém cá tràng kình ở biển Đông, quét sạch bờ cõi, giành lại giang sơn, cởi ách nô lệ, chứ không chịu khom lưng làm tì thiếp người ta'.",
        year: "248",
        sortOrder: 2
      },
      
      // Ngo-Dinh-Le
      {
        periodId: periodMap['ngo-dinh'],
        title: "Ngô Quyền Đánh Bại Quân Nam Hán",
        description: "Trận Bạch Đằng năm 938 đánh dấu chiến thắng của Ngô Quyền trước quân Nam Hán, kết thúc thời kỳ Bắc thuộc kéo dài hơn 1000 năm.",
        year: "938",
        sortOrder: 1
      },
      {
        periodId: periodMap['ngo-dinh'],
        title: "Đinh Bộ Lĩnh Thống Nhất Đất Nước",
        description: "Sau thời kỳ loạn 12 sứ quân, Đinh Bộ Lĩnh đã thống nhất đất nước và lên ngôi hoàng đế, đặt quốc hiệu là Đại Cồ Việt.",
        year: "968",
        sortOrder: 2
      },
      {
        periodId: periodMap['ngo-dinh'],
        title: "Lê Hoàn Đánh Bại Quân Tống",
        description: "Lê Hoàn lên ngôi lập nên nhà Tiền Lê và đã đánh bại quân xâm lược nhà Tống, bảo vệ nền độc lập non trẻ của Đại Cồ Việt.",
        year: "981",
        sortOrder: 3
      },
      
      // Ly Dynasty
      {
        periodId: periodMap['ly'],
        title: "Lý Thái Tổ Dời Đô Về Thăng Long",
        description: "Lý Thái Tổ cho dời đô từ Hoa Lư về Đại La (Thăng Long - Hà Nội ngày nay), đặt nền móng cho kinh đô suốt nhiều thế kỷ sau.",
        year: "1010",
        sortOrder: 1
      },
      {
        periodId: periodMap['ly'],
        title: "Chiến Thắng Của Lý Thường Kiệt",
        description: "Lý Thường Kiệt đã chủ động đem quân đánh phủ đầu nhà Tống, để lại bài thơ nổi tiếng 'Nam quốc sơn hà Nam đế cư'.",
        year: "1075-1077",
        sortOrder: 2
      },
      
      // Tran Dynasty
      {
        periodId: periodMap['tran'],
        title: "Kháng Chiến Chống Quân Nguyên Mông Lần 1",
        description: "Dưới sự lãnh đạo của Trần Thánh Tông, Trần Nhân Tông và Trần Hưng Đạo, quân dân Đại Việt đã đánh bại quân Nguyên Mông lần thứ nhất.",
        year: "1258",
        sortOrder: 1
      },
      {
        periodId: periodMap['tran'],
        title: "Chiến Thắng Bạch Đằng",
        description: "Trận đánh lịch sử trên sông Bạch Đằng, quân dân Đại Việt dưới sự chỉ huy của Trần Hưng Đạo đã tiêu diệt đoàn thuyền của quân Nguyên Mông.",
        year: "1288",
        imageUrl: "https://images.unsplash.com/photo-1563284223-333497736fb0?q=80&w=1974",
        sortOrder: 2
      },
      
      // Ho Dynasty and Ming Domination
      {
        periodId: periodMap['ho-and-ming'],
        title: "Nhà Hồ Thay Thế Nhà Trần",
        description: "Hồ Quý Ly cướp ngôi nhà Trần, lập ra nhà Hồ và tiến hành nhiều cải cách về tiền tệ, ruộng đất và giáo dục.",
        year: "1400",
        sortOrder: 1
      },
      {
        periodId: periodMap['ho-and-ming'],
        title: "Nhà Minh Xâm Lược Đại Nội",
        description: "Quân Minh xâm chiếm Đại Nội, bắt sống Hồ Quý Ly và con trai, kết thúc triều đại Hồ. Đại Việt rơi vào 20 năm đô hộ của nhà Minh.",
        year: "1407",
        sortOrder: 2
      },
      {
        periodId: periodMap['ho-and-ming'],
        title: "Khởi Nghĩa Lam Sơn",
        description: "Lê Lợi phát động khởi nghĩa tại Lam Sơn (Thanh Hóa) chống lại quân Minh, mở đầu cho cuộc chiến kéo dài 10 năm.",
        year: "1418",
        imageUrl: "https://images.unsplash.com/photo-1655635949212-1d8f4f103ea1?q=80&w=2070",
        sortOrder: 3
      },
      
      // Le Dynasty
      {
        periodId: periodMap['le'],
        title: "Triều Đại Lê Sơ Và Bộ Luật Hồng Đức",
        description: "Dưới thời Lê Thánh Tông, bộ luật Hồng Đức được ban hành, đánh dấu bước phát triển quan trọng của hệ thống pháp luật Việt Nam.",
        year: "1470",
        sortOrder: 1
      },
      {
        periodId: periodMap['le'],
        title: "Thời Kỳ Lê-Mạc Phan Tranh",
        description: "Mạc Đăng Dung cướp ngôi nhà Lê, khởi đầu thời kỳ phan tranh giữa hai triều đại. Người nhà Lê chạy vào Thanh Hóa tiếp tục cuộc chiến giành lại ngai vàng.",
        year: "1527",
        sortOrder: 2
      },
      {
        periodId: periodMap['le'],
        title: "Trịnh-Nguyễn Phan Tranh",
        description: "Đất nước chia cắt với chúa Trịnh nắm quyền ở đàng ngoài và chúa Nguyễn ở đàng trong. Cả hai đều thể hiện tôn phụng vua Lê nhưng đấu tranh quyền lực với nhau.",
        year: "1600-1788",
        imageUrl: "https://images.unsplash.com/photo-1563975523129-98684dd2e32c?q=80&w=2070",
        sortOrder: 3
      },
      
      // Tay Son
      {
        periodId: periodMap['tay-son'],
        title: "Khởi Nghĩa Tây Sơn",
        description: "Anh em Nguyễn Nhạc, Nguyễn Huệ và Nguyễn Lữ nổi dậy tại Tây Sơn (Bình Định), khởi đầu cho phong trào nông dân lớn nhất trong lịch sử.",
        year: "1771",
        sortOrder: 1
      },
      {
        periodId: periodMap['tay-son'],
        title: "Chiến Thắng Rạch Gầm - Xoài Mút",
        description: "Nguyễn Huệ chỉ huy quân Tây Sơn đánh bại quân Xiêm (Thái Lan) do Nguyễn Ánh dẫn đường, bảo vệ miền Nam.",
        year: "1785",
        sortOrder: 2
      },
      {
        periodId: periodMap['tay-son'],
        title: "Chiến Thắng Ngọc Hồi - Đống Đa",
        description: "Vua Quang Trung (Nguyễn Huệ) chỉ huy đại thắng quân Thanh vào dịp Tết Kỷ Dậu, đánh đuổi 29 vạn quân xâm lược ra khỏi bờ cõi.",
        year: "1789",
        imageUrl: "https://images.unsplash.com/photo-1617183644446-fed06416fc4a?q=80&w=2072",
        sortOrder: 3
      },
      
      // Nguyen Dynasty
      {
        periodId: periodMap['nguyen'],
        title: "Gia Long Thống Nhất Đất Nước",
        description: "Nguyễn Ánh đánh bại Tây Sơn, lên ngôi Hoàng đế lấy hiệu là Gia Long, thống nhất đất nước và đặt tên nước là Việt Nam.",
        year: "1802",
        sortOrder: 1
      },
      {
        periodId: periodMap['nguyen'],
        title: "Hiệp Ước Nhâm Tuất",
        description: "Bước đầu của sự xâm lược của Pháp vào Việt Nam. Hiệp ước buộc triều đình Huế nhượng đất và nhiều quyền lợi cho Pháp.",
        year: "1862",
        sortOrder: 2
      },
      {
        periodId: periodMap['nguyen'],
        title: "Vua Hàm Nghi Ra Chiếu Cần Vương",
        description: "Sau khi quân Pháp tấn công kinh thành Huế, vua Hàm Nghi rời kinh thành và ban hành chiếu Cần Vương kêu gọi dân chúng khởi nghĩa chống Pháp.",
        year: "1885",
        imageUrl: "https://images.unsplash.com/photo-1587143694825-154188c577ce?q=80&w=2070",
        sortOrder: 3
      },
      
      // French Colonization
      {
        periodId: periodMap['french'],
        title: "Pháp Đánh Chiếm Nam Kỳ",
        description: "Quân Pháp tấn công và chiếm Sài Gòn, buộc triều đình Huế ký hiệp ước nhượng ba tỉnh miền đông Nam Kỳ.",
        year: "1859-1862",
        sortOrder: 1
      },
      {
        periodId: periodMap['french'],
        title: "Đông Dương Liên Bang",
        description: "Pháp thành lập Liên bang Đông Dương gồm năm xứ: Bắc Kỳ, Trung Kỳ, Nam Kỳ, Cao Miên (Campuchia) và Ai Lao (Lào).",
        year: "1887",
        sortOrder: 2
      },
      {
        periodId: periodMap['french'],
        title: "Phong Trào Yêu Nước Đầu Thế Kỷ 20",
        description: "Nhiều phong trào yêu nước nổi lên chống thực dân Pháp như Đông Kinh Nghĩa Thục, phong trào của Phan Bội Châu, Phan Châu Trinh...",
        year: "1900-1930",
        imageUrl: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?q=80&w=2070",
        sortOrder: 3
      },
      
      // Modern Vietnam
      {
        periodId: periodMap['modern'],
        title: "Tuyên Ngôn Độc Lập",
        description: "Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình, khai sinh nước Việt Nam Dân chủ Cộng hòa.",
        year: "2/9/1945",
        imageUrl: "https://images.unsplash.com/photo-1618402079626-d6ba9e5a6d24?q=80&w=2070",
        sortOrder: 1
      },
      {
        periodId: periodMap['modern'],
        title: "Chiến Thắng Điện Biên Phủ",
        description: "Quân đội Việt Nam dưới sự chỉ huy của Đại tướng Võ Nguyên Giáp đánh bại quân viễn chinh Pháp, chấm dứt chế độ thực dân của Pháp tại Đông Dương.",
        year: "7/5/1954",
        sortOrder: 2
      },
      {
        periodId: periodMap['modern'],
        title: "Giải Phóng Miền Nam, Thống Nhất Đất Nước",
        description: "Chiến dịch Hồ Chí Minh kết thúc thắng lợi, giải phóng hoàn toàn miền Nam, thống nhất đất nước sau gần 30 năm chia cắt.",
        year: "30/4/1975",
        sortOrder: 3
      },
      {
        periodId: periodMap['modern'],
        title: "Đổi Mới",
        description: "Chính sách đổi mới kinh tế được đưa ra tại Đại hội Đảng lần thứ VI, chuyển từ nền kinh tế kế hoạch hóa tập trung sang nền kinh tế thị trường định hướng xã hội chủ nghĩa.",
        year: "1986",
        imageUrl: "https://images.unsplash.com/photo-1676905188113-5c962d034b52?q=80&w=1934",
        sortOrder: 4
      }
    ];
    
    // Seed event types
    console.log("Seeding event types...");
    const eventTypesData: schema.InsertEventType[] = [
      {
        name: "Chính trị",
        slug: "chinh-tri",
        description: "Các sự kiện liên quan đến chính trị, ngoại giao và quản lý nhà nước",
        color: "#ff5722"
      },
      {
        name: "Quân sự",
        slug: "quan-su",
        description: "Các chiến dịch, chiến thắng và sự kiện quân sự quan trọng", 
        color: "#d50000"
      },
      {
        name: "Văn hóa",
        slug: "van-hoa",
        description: "Các sự kiện liên quan đến văn hóa, nghệ thuật, tôn giáo và giáo dục",
        color: "#2196f3"
      },
      {
        name: "Truyền thuyết",
        slug: "truyen-thuyet",
        description: "Các câu chuyện, truyền thuyết trong lịch sử Việt Nam",
        color: "#673ab7"
      },
      {
        name: "Di sản",
        slug: "di-san",
        description: "Các di sản văn hóa, lịch sử được công nhận",
        color: "#009688"
      }
    ];
    
    // Insert event types
    for (const eventType of eventTypesData) {
      const existingEventType = await db.query.eventTypes.findFirst({
        where: eq(schema.eventTypes.slug, eventType.slug)
      });
      
      if (!existingEventType) {
        await db.insert(schema.eventTypes).values(eventType);
      }
    }
    
    // Get all event types after insertion to get their IDs
    const insertedEventTypes = await db.query.eventTypes.findMany({});
    
    // Create a mapping of slug to event type ID
    const eventTypeMap: Record<string, number> = {};
    insertedEventTypes.forEach(eventType => {
      eventTypeMap[eventType.slug] = eventType.id;
    });
    
    // Insert events
    for (const event of eventsData) {
      // Extract eventType field and remove it from the object to avoid DB schema conflicts
      const { eventType, ...eventWithoutType } = event as any;
      
      const existingEvents = await db.query.events.findMany({
        where: eq(schema.events.title, event.title)
      });
      
      let eventId: number;
      
      if (existingEvents.length === 0) {
        // Insert the event
        const result = await db.insert(schema.events).values(eventWithoutType).returning({ id: schema.events.id });
        eventId = result[0].id;
      } else {
        eventId = existingEvents[0].id;
      }
      
      // If event type was specified, link it to the event
      if (eventType) {
        // Map common event types to our slug format
        let typeSlug = '';
        switch(eventType) {
          case 'Truyền thuyết':
            typeSlug = 'truyen-thuyet';
            break;
          case 'Di sản văn hóa':
            typeSlug = 'di-san';
            break;
          default:
            // For others, default to cultural events
            typeSlug = 'van-hoa';
        }
        
        if (eventTypeMap[typeSlug]) {
          // Check if relation already exists
          const existingRelation = await db.query.eventToEventType.findFirst({
            where: (relations) => {
              return eq(schema.eventToEventType.eventId, eventId) && 
                     eq(schema.eventToEventType.eventTypeId, eventTypeMap[typeSlug]);
            }
          });
          
          if (!existingRelation) {
            // Create relation if it doesn't exist
            await db.insert(schema.eventToEventType).values({
              eventId: eventId,
              eventTypeId: eventTypeMap[typeSlug]
            });
          }
        }
      }
    }
    
    // Seed historical figures
    console.log("Seeding historical figures...");
    const figuresData: schema.InsertHistoricalFigure[] = [
      {
        name: "Lý Thường Kiệt",
        period: "Nhà Lý",
        lifespan: "1019 - 1105",
        description: "Danh tướng thời Lý, người đã chủ động mang quân đánh phủ đầu nhà Tống và nổi tiếng với câu thơ 'Nam quốc sơn hà Nam đế cư' (Sông núi nước Nam vua Nam ở).",
        imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2064",
        achievements: ["Chiến thắng Ung Châu, Khâm Châu (1075-1076)", "Trận Như Nguyệt (1077)"],
        sortOrder: 1
      },
      {
        name: "Trần Hưng Đạo",
        period: "Nhà Trần",
        lifespan: "1228 - 1300",
        description: "Tổng chỉ huy quân đội nhà Trần trong ba lần kháng chiến chống quân Nguyên Mông. Ông được xem là một trong những nhà quân sự kiệt xuất của Việt Nam.",
        imageUrl: "https://images.unsplash.com/photo-1629382627170-f0209483dbf9?q=80&w=2069",
        achievements: ["Chiến thắng Bạch Đằng (1288)", "Tác giả 'Binh thư yếu lược', 'Hịch tướng sĩ'"],
        sortOrder: 2
      },
      {
        name: "Lê Lợi",
        period: "Nhà Hậu Lê",
        lifespan: "1385 - 1433",
        description: "Lãnh đạo khởi nghĩa Lam Sơn chống lại nhà Minh, giành lại độc lập cho Đại Việt sau 20 năm Minh thuộc và trở thành vị vua đầu tiên của triều đại Lê sơ.",
        imageUrl: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=2021",
        achievements: ["Lãnh đạo khởi nghĩa Lam Sơn (1418-1427)", "Chiến thắng Chi Lăng - Xương Giang (1427)", "Truyền thuyết gươm thần Thuận Thiên"],
        sortOrder: 3
      },
      {
        name: "Hai Bà Trưng",
        period: "Thời Kỳ Bắc Thuộc",
        lifespan: "? - 43",
        description: "Trưng Trắc và Trưng Nhị là hai chị em đã lãnh đạo cuộc khởi nghĩa chống lại quân đô hộ nhà Hán. Sau khi giành chiến thắng, Trưng Trắc đã lên ngôi vua, được gọi là Trưng Nữ Vương.",
        imageUrl: "https://images.unsplash.com/photo-1582995580100-3a297eba1e0f?q=80&w=2070",
        achievements: ["Khởi nghĩa đánh đuổi quân Hán (40)", "Lên ngôi xưng vương", "Lập Mê Linh làm kinh đô"],
        sortOrder: 4
      },
      {
        name: "Nguyễn Huệ (Quang Trung)",
        period: "Tây Sơn",
        lifespan: "1753 - 1792",
        description: "Anh hùng dân tộc, là người lãnh đạo cuộc khởi nghĩa Tây Sơn và là hoàng đế Việt Nam từ 1788 đến 1792. Ông nổi tiếng với chiến thắng vang dội trước quân Thanh vào dịp Tết Kỷ Dậu (1789).",
        imageUrl: "https://images.unsplash.com/photo-1549492423-a98544997a60?q=80&w=2066",
        achievements: ["Đại thắng quân Thanh (Tết Kỷ Dậu 1789)", "Thống nhất đất nước", "Cải cách giáo dục, kinh tế"],
        sortOrder: 5
      },
      {
        name: "Đinh Bộ Lĩnh",
        period: "Thời Ngô - Đinh - Tiền Lê",
        lifespan: "924 - 979",
        description: "Người sáng lập nhà Đinh, vị hoàng đế đầu tiên của Đại Cồ Việt. Ông đã thống nhất đất nước sau thời kỳ loạn 12 sứ quân, đặt nền móng vững chắc cho nền độc lập lâu dài.",
        imageUrl: "https://images.unsplash.com/photo-1601042879364-f3947d3f9822?q=80&w=2070",
        achievements: ["Dẹp loạn 12 sứ quân (968)", "Lên ngôi Hoàng đế, đặt quốc hiệu là Đại Cồ Việt", "Định đô ở Hoa Lư (Ninh Bình)"],
        sortOrder: 6
      },
      {
        name: "Lý Thái Tổ",
        period: "Nhà Lý",
        lifespan: "974 - 1028",
        description: "Vị vua sáng lập triều đại nhà Lý, mở đầu cho một thời kỳ phát triển mạnh mẽ của lịch sử dân tộc. Việc dời đô từ Hoa Lư ra Thăng Long đã tạo tiền đề cho sự phát triển của Hà Nội ngày nay.",
        imageUrl: "https://images.unsplash.com/photo-1617391258031-f8d80b22fb15?q=80&w=1974",
        achievements: ["Dời đô từ Hoa Lư về Thăng Long (1010)", "Đổi quốc hiệu từ Đại Cồ Việt thành Đại Việt", "Khởi đầu cho triều đại Lý hưng thịnh"],
        sortOrder: 7
      },
      {
        name: "Bà Triệu",
        period: "Thời Kỳ Bắc Thuộc",
        lifespan: "225 - 248",
        description: "Nữ anh hùng dân tộc lãnh đạo cuộc khởi nghĩa chống lại nhà Ngô. Bà nổi tiếng với câu nói: 'Tôi muốn cưỡi cơn gió mạnh, đạp đường sóng dữ, chém cá tràng kình ở biển Đông, quét sạch bờ cõi, giành lại giang sơn, cởi ách nô lệ, chứ không chịu khom lưng làm tì thiếp người ta'.",
        imageUrl: "https://images.unsplash.com/photo-1625038462015-5524b02be2aa?q=80&w=2070",
        achievements: ["Khởi nghĩa chống nhà Ngô (248)", "Được suy tôn là 'Nhụy Kiều Tướng Quân'"],
        sortOrder: 8
      },
      {
        name: "Ngô Quyền",
        period: "Thời Ngô - Đinh - Tiền Lê",
        lifespan: "897 - 944",
        description: "Người chấm dứt thời kỳ Bắc thuộc kéo dài 1000 năm và mở ra thời kỳ độc lập tự chủ cho Việt Nam với chiến thắng Bạch Đằng lịch sử.",
        imageUrl: "https://images.unsplash.com/photo-1589450617692-13124ea4e9e3?q=80&w=2070",
        achievements: ["Chiến thắng Bạch Đằng (938)", "Lên ngôi vua, đặt quốc hiệu là Nam Việt", "Đóng đô ở Cổ Loa"],
        sortOrder: 9
      },
      {
        name: "Lê Thánh Tông",
        period: "Nhà Lê",
        lifespan: "1442 - 1497",
        description: "Vị vua thứ 5 của nhà Hậu Lê, một trong những vị vua nổi tiếng nhất lịch sử Việt Nam. Dưới triều đại ông, Đại Việt đã đạt đến đỉnh cao về chính trị, quân sự, kinh tế và văn hóa.",
        imageUrl: "https://images.unsplash.com/photo-1576213339912-c3623fb81a9a?q=80&w=2069",
        achievements: ["Ban hành Bộ luật Hồng Đức", "Cải cách hành chính, quân sự", "Phát triển văn hóa, giáo dục"],
        sortOrder: 10
      },
      {
        name: "Phan Đình Phùng",
        period: "Thời Kỳ Pháp Thuộc",
        lifespan: "1847 - 1895",
        description: "Nhà yêu nước và là thủ lĩnh phong trào Cần Vương chống Pháp. Ông đã lãnh đạo cuộc khởi nghĩa kéo dài gần 10 năm ở Nghệ Tĩnh.",
        imageUrl: "https://images.unsplash.com/photo-1571172964276-91faaa704e1f?q=80&w=2070",
        achievements: ["Lãnh đạo nghĩa quân Hương Khê", "Duy trì cuộc kháng chiến 10 năm", "Chế tạo vũ khí chống Pháp"],
        sortOrder: 11
      },
      {
        name: "Hồ Chí Minh",
        period: "Việt Nam Hiện Đại",
        lifespan: "1890 - 1969",
        description: "Người sáng lập Đảng Cộng sản Việt Nam, Chủ tịch nước Việt Nam Dân chủ Cộng hòa và là lãnh tụ của phong trào giải phóng dân tộc Việt Nam.",
        imageUrl: "https://images.unsplash.com/photo-1564571726117-96a7badf8931?q=80&w=2063",
        achievements: ["Đọc Tuyên ngôn Độc lập (1945)", "Lãnh đạo kháng chiến chống Pháp và Mỹ", "Tư tưởng Hồ Chí Minh"],
        sortOrder: 12
      },
      {
        name: "Võ Nguyên Giáp",
        period: "Việt Nam Hiện Đại",
        lifespan: "1911 - 2013",
        description: "Đại tướng đầu tiên của Quân đội Nhân dân Việt Nam và là nhà quân sự kiệt xuất. Ông được mệnh danh là 'Người anh cả của Quân đội' và là vị tướng huyền thoại của Việt Nam.",
        imageUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070",
        achievements: ["Chỉ huy chiến thắng Điện Biên Phủ (1954)", "Tổng Tư lệnh chiến dịch Hồ Chí Minh (1975)", "Lý luận quân sự độc đáo"],
        sortOrder: 13
      },
      {
        name: "Nguyễn Du",
        period: "Nhà Nguyễn",
        lifespan: "1766 - 1820",
        description: "Đại thi hào dân tộc Việt Nam, tác giả của kiệt tác 'Truyện Kiều'. Ông được UNESCO công nhận là Danh nhân văn hóa thế giới.",
        imageUrl: "https://images.unsplash.com/photo-1544961371-516024f8e267?q=80&w=1974",
        achievements: ["Tác giả 'Truyện Kiều'", "Sáng tác 'Thanh Hiên thi tập'", "Đại diện cho nền văn học cổ điển Việt Nam"],
        sortOrder: 14
      },
      {
        name: "Trần Nhân Tông",
        period: "Nhà Trần",
        lifespan: "1258 - 1308",
        description: "Vị vua thứ ba của nhà Trần, người đã hai lần chỉ huy cuộc kháng chiến chống quân Nguyên Mông. Sau khi nhường ngôi, ông đi tu và sáng lập ra Thiền phái Trúc Lâm Yên Tử.",
        imageUrl: "https://images.unsplash.com/photo-1548625361-58a9b86aa83b?q=80&w=2069",
        achievements: ["Chỉ huy kháng chiến chống Nguyên Mông (1285, 1288)", "Sáng lập Thiền phái Trúc Lâm", "Hội nghị Diên Hồng"],
        sortOrder: 15
      },
      {
        name: "Lý Công Uẩn",
        period: "Nhà Lý",
        lifespan: "974 - 1028",
        description: "Là Lý Thái Tổ, vị hoàng đế đầu tiên của nhà Lý. Ông sinh ra ở Cổ Pháp (Bắc Ninh), lớn lên trong chùa Lục Tổ và nổi tiếng với quyết định dời đô từ Hoa Lư về Đại La, đổi tên thành Thăng Long.",
        imageUrl: "https://images.unsplash.com/photo-1597565061928-7cf6691eed6f?q=80&w=2070",
        achievements: ["Dời đô từ Hoa Lư về Thăng Long", "Ổn định tình hình đất nước", "Xây dựng nền móng cho triều Lý hưng thịnh"],
        sortOrder: 16
      }
    ];
    
    // Insert historical figures
    for (const figure of figuresData) {
      const existingFigures = await db.query.historicalFigures.findMany({
        where: eq(schema.historicalFigures.name, figure.name)
      });
      
      if (existingFigures.length === 0) {
        await db.insert(schema.historicalFigures).values(figure);
      }
    }
    
    console.log("Database seeding completed successfully");
    // Seed historical sites
    console.log("Seeding historical sites...");
    const historicalSitesData: schema.InsertHistoricalSite[] = [
      {
        name: "Cố Đô Hoa Lư",
        location: "Ninh Bình",
        periodId: 5, // Thời Ngô - Đinh - Tiền Lê
        description: "Cố đô Hoa Lư là kinh đô đầu tiên của nhà nước phong kiến Việt Nam, là kinh đô của Đinh Bộ Lĩnh và Lê Hoàn.",
        detailedDescription: `<p>Cố đô Hoa Lư (còn gọi là Hoa Lư cố đô, Cố đô Hoa Lư) từng là kinh đô của nước Đại Cồ Việt (quốc hiệu đầu tiên của Việt Nam) từ năm 968 đến năm 1010. Đây là kinh đô của hai triều đại phong kiến: nhà Đinh (968-980) và nhà Tiền Lê (980-1009).</p>
<p>Kinh đô nằm ở vùng đất hiện nay là các xã Trường Yên, Ninh Xuân, Ninh Hải và thị trấn Trường Yên của huyện Hoa Lư, tỉnh Ninh Bình (tức là khu vực đồng bằng sông Hồng, cách Hà Nội khoảng 100 km về phía nam).</p>
<p>Khu di tích Cố đô Hoa Lư có hai ngôi đền quan trọng:
<ul>
<li>Đền thờ vua Đinh (Đinh Tiên Hoàng): Thờ vua Đinh Tiên Hoàng - người đã thống nhất đất nước sau thời kỳ loạn 12 sứ quân</li>
<li>Đền thờ vua Lê (Lê Đại Hành): Thờ vua Lê Hoàn, người kế tục sự nghiệp của Đinh Tiên Hoàng</li>
</ul></p>`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Co_do_Hoa_Lu.jpg/1200px-Co_do_Hoa_Lu.jpg",
        latitude: 20.2835,
        longitude: 105.9147,
        address: "Trường Yên, Hoa Lư, Ninh Bình",
        yearBuilt: "968",
        relatedEventId: null,
        sortOrder: 1
      },
      {
        name: "Đền Hùng",
        location: "Phú Thọ",
        periodId: 2, // Thời Đại Các Vua Hùng
        description: "Đền Hùng là quần thể di tích lịch sử văn hóa đặc biệt quan trọng của dân tộc Việt Nam, thờ các Vua Hùng và các nhân vật có công với nước.",
        detailedDescription: `<p>Đền Hùng nằm trên núi Nghĩa Lĩnh thuộc xã Hy Cương, thành phố Việt Trì, tỉnh Phú Thọ. Đây là nơi thờ cúng các Vua Hùng - những người đã có công dựng nước và tạo nên nền văn minh sông Hồng.</p>
<p>Quần thể di tích Đền Hùng bao gồm nhiều đền thờ khác nhau:</p>
<ul>
<li>Đền Hạ: Nằm ở chân núi, là nơi làm lễ tế chuẩn bị trước khi lên đền trên</li>
<li>Đền Trung: Thờ các tướng lĩnh phò tá Vua Hùng</li>
<li>Đền Thượng: Thờ chính các Vua Hùng, đây là trung tâm của cả quần thể</li>
<li>Đền Giếng: Thờ công chúa Ngọc Hoa</li>
</ul>
<p>Hàng năm vào ngày mùng 10 tháng 3 âm lịch, tại đây diễn ra Giỗ Tổ Hùng Vương với quy mô lớn để tưởng nhớ công lao của các Vua Hùng.</p>`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/%C4%90%E1%BB%81n_H%C3%B9ng.jpg/1200px-%C4%90%E1%BB%81n_H%C3%B9ng.jpg",
        latitude: 21.3870, 
        longitude: 105.3848,
        address: "Hy Cương, Việt Trì, Phú Thọ",
        yearBuilt: null,
        relatedEventId: 4, // Liên quan đến sự kiện Lễ Hội Đền Hùng
        sortOrder: 2
      },
      {
        name: "Cổ Loa Thành",
        location: "Hà Nội",
        periodId: 3, // Nước Âu Lạc
        description: "Cổ Loa Thành (còn gọi là Thành Cổ Loa) là kinh đô của nước Âu Lạc thời An Dương Vương, được xây dựng theo hình xoắn ốc.",
        detailedDescription: `<p>Cổ Loa Thành nằm tại xã Cổ Loa, huyện Đông Anh, Hà Nội. Đây là kinh đô của nước Âu Lạc do vua An Dương Vương xây dựng từ thế kỷ thứ III trước Công nguyên.</p>
<p>Theo truyền thuyết, thành được xây dựng theo hình trôn ốc gồm 9 vòng thành (3 vòng thành chính và 6 vòng phụ), do đó có tên gọi là Cổ Loa (Loa: ốc).</p>
<p>Công trình này được xem là một kỳ tích về kiến trúc quân sự cổ đại, với hệ thống hào sâu, đắp cao để phòng thủ. Người ta đã tìm thấy tại đây nhiều mũi tên, nỏ đồng (trong đó có nỏ thần) và các hiện vật khác chứng tỏ trình độ luyện kim phát triển của người Âu Lạc.</p>
<p>Ngày nay, di tích Cổ Loa bao gồm:</p>
<ul>
<li>Đền thờ An Dương Vương</li>
<li>Các vòng thành còn sót lại</li>
<li>Bảo tàng Cổ Loa trưng bày nhiều hiện vật quý báu</li>
</ul>`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/31/Co_Loa_thanh.JPG",
        latitude: 21.1014,
        longitude: 105.8574,
        address: "Cổ Loa, Đông Anh, Hà Nội",
        yearBuilt: "257 TCN",
        relatedEventId: null,
        sortOrder: 3
      },
      {
        name: "Thành Nhà Hồ",
        location: "Thanh Hóa",
        periodId: 7, // Nhà Hồ
        description: "Thành Nhà Hồ là kinh thành thời nhà Hồ (1400-1407), được xây dựng hoàn toàn bằng đá và được UNESCO công nhận là di sản văn hóa thế giới.",
        detailedDescription: `<p>Thành Nhà Hồ (còn gọi là Thành Tây Đô) nằm ở xã Vĩnh Long, huyện Vĩnh Lộc, tỉnh Thanh Hóa. Đây là kinh đô của nhà Hồ do Hồ Quý Ly cho xây dựng từ năm 1397 đến 1399.</p>
<p>Thành có hình chữ nhật, với chu vi khoảng 9km, được xây dựng hoàn toàn bằng những khối đá lớn, mỗi khối nặng từ 10 đến 26 tấn. Các khối đá được ghép với nhau một cách khít khao mà không cần dùng chất kết dính. Đây là một kỳ công về kiến trúc và kỹ thuật thời bấy giờ.</p>
<p>Năm 2011, Thành Nhà Hồ đã được UNESCO công nhận là Di sản Văn hóa Thế giới, là một trong số ít những di sản nổi bật về giá trị kiến trúc quân sự thời trung đại châu Á.</p>
<p>Hiện nay, di tích này vẫn còn khá nguyên vẹn với các cấu trúc chính như:</p>
<ul>
<li>Bốn cổng thành ở bốn hướng</li>
<li>Tường thành đá với kỹ thuật xếp đá tinh xảo</li>
<li>Hệ thống hào nước bao quanh thành</li>
</ul>`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Citadel_of_the_Ho_Dynasty.jpg",
        latitude: 19.9736,
        longitude: 105.6122,
        address: "Vĩnh Long, Vĩnh Lộc, Thanh Hóa",
        yearBuilt: "1397",
        relatedEventId: null,
        sortOrder: 4
      },
      {
        name: "Văn Miếu - Quốc Tử Giám",
        location: "Hà Nội",
        periodId: 6, // Nhà Lý
        description: "Văn Miếu - Quốc Tử Giám là trường đại học đầu tiên của Việt Nam, được xây dựng năm 1070 dưới triều vua Lý Thánh Tông.",
        detailedDescription: `<p>Văn Miếu - Quốc Tử Giám nằm tại phường Văn Miếu, quận Đống Đa, Hà Nội. Được xây dựng vào năm 1070 thời Lý Thánh Tông làm nơi thờ Khổng Tử, các bậc hiền triết của Nho giáo và các vị tiến sĩ tiêu biểu của Việt Nam.</p>
<p>Năm 1076, vua Lý Nhân Tông cho xây dựng Quốc Tử Giám bên cạnh Văn Miếu làm nơi học tập của các hoàng tử. Đến thời vua Trần Thái Tông (1236), Quốc Tử Giám trở thành trường học dành cho con em quý tộc và các học trò giỏi trong cả nước.</p>
<p>Văn Miếu - Quốc Tử Giám bao gồm năm khu vực chính theo trục chính từ nam đến bắc:</p>
<ul>
<li>Khu vực 1: Cổng Văn Miếu và sân</li>
<li>Khu vực 2: Khuê Văn Các - biểu tượng của Hà Nội</li>
<li>Khu vực 3: Thiên Quang Tỉnh (giếng) và 82 bia Tiến sĩ</li>
<li>Khu vực 4: Đại bái (nơi thờ Khổng Tử và 72 học trò)</li>
<li>Khu vực 5: Hậu cung (nơi thờ các vị thánh và danh nhân)</li>
</ul>
<p>Đặc biệt, tại đây có 82 bia đá khắc tên các tiến sĩ qua các kỳ thi từ năm 1442 đến 1779, được đặt trên lưng rùa đá, tượng trưng cho sự trường thọ và bền vững của học vấn.</p>`,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Van_Mieu_Quoc_Tu_Giam.jpg",
        latitude: 21.0269,
        longitude: 105.8354,
        address: "58 Quốc Tử Giám, Đống Đa, Hà Nội",
        yearBuilt: "1070",
        relatedEventId: null,
        sortOrder: 5
      }
    ];
    
    // Insert historical sites data
    for (const site of historicalSitesData) {
      const existingSite = await db.query.historicalSites.findFirst({
        where: eq(schema.historicalSites.name, site.name)
      });
      
      if (!existingSite) {
        await db.insert(schema.historicalSites).values(site);
        console.log(`Added historical site: ${site.name}`);
      } else {
        console.log(`Historical site already exists: ${site.name}`);
      }
    }
    
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
