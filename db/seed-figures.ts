import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedHistoricalFigures() {
  try {
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
    
    console.log("Database seeding for historical figures completed successfully");
  } catch (error) {
    console.error("Error seeding historical figures:", error);
  }
}

seedHistoricalFigures();
