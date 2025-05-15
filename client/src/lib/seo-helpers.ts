/**
 * Hàm hỗ trợ tối ưu hóa SEO cho ứng dụng React
 */

/**
 * Tạo thẻ canonical URL cho trang web
 * @param path - Đường dẫn tương đối của trang (không bao gồm domain)
 * @returns Thẻ link canonical đầy đủ
 */
export function generateCanonicalTag(path: string): string {
  const domain = 'https://lichsuviet.edu.vn';
  const fullUrl = `${domain}${path.startsWith('/') ? path : `/${path}`}`;
  
  return `<link rel="canonical" href="${fullUrl}" />`;
}

/**
 * Thêm schema.org JSON-LD cho trang web
 * @param type - Loại schema (Article, WebPage, etc.)
 * @param data - Dữ liệu schema
 * @returns Thẻ script với dữ liệu schema.org
 */
export function generateSchemaOrgTag(type: string, data: Record<string, any>): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };
  
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Tạo schema.org cho trang chi tiết sự kiện
 * @param event - Dữ liệu sự kiện
 * @returns Schema.org cho sự kiện
 */
export function generateEventSchema(event: {
  title: string;
  description: string;
  imageUrl?: string;
  year?: string;
  url: string;
}): string {
  return generateSchemaOrgTag('HistoricalEvent', {
    name: event.title,
    description: event.description,
    image: event.imageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png',
    temporalCoverage: event.year || 'Unknown',
    url: event.url
  });
}

/**
 * Tạo schema.org cho trang chi tiết nhân vật lịch sử
 * @param person - Dữ liệu nhân vật
 * @returns Schema.org cho nhân vật lịch sử
 */
export function generatePersonSchema(person: {
  name: string;
  description: string;
  imageUrl?: string;
  lifespan?: string;
  url: string;
}): string {
  return generateSchemaOrgTag('Person', {
    name: person.name,
    description: person.description,
    image: person.imageUrl || 'https://lichsuviet.edu.vn/uploads/banner-image.png',
    birthDate: person.lifespan?.split('-')[0]?.trim() || 'Unknown',
    deathDate: person.lifespan?.split('-')[1]?.trim() || 'Unknown',
    url: person.url
  });
}