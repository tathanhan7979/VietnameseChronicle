import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

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
    const eventsData: schema.InsertEvent[] = [
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
        description: ""Tôi muốn cưỡi cơn gió mạnh, đạp đường sóng dữ, chém cá tràng kình ở biển Đông, quét sạch bờ cõi, giành lại giang sơn, cởi ách nô lệ, chứ không chịu khom lưng làm tì thiếp người ta."",
        year: "248",
        sortOrder: 2
      },
      
      // Add more events for other periods...
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
      }
    ];
    
    // Insert events
    for (const event of eventsData) {
      const existingEvents = await db.query.events.findMany({
        where: eq(schema.events.title, event.title)
      });
      
      if (existingEvents.length === 0) {
        await db.insert(schema.events).values(event);
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
        description: "Nữ anh hùng dân tộc lãnh đạo cuộc khởi nghĩa chống lại nhà Ngô. Bà nổi tiếng với câu nói: 'Tôi muốn cưỡi cơn gió mạnh, đạp đường sóng dữ, chém cá tràng kình ở biển Đông, quét sạch bờ cõi, giành lại giang sơn, cởi ách nô lệ, chứ không chịu khom lưng làm tì thiếp người ta.'",
        imageUrl: "https://images.unsplash.com/photo-1625038462015-5524b02be2aa?q=80&w=2070",
        achievements: ["Khởi nghĩa chống nhà Ngô (248)", "Được suy tôn là 'Nhụy Kiều Tướng Quân'"],
        sortOrder: 8
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
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
