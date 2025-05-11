import { NextApiRequest, NextApiResponse } from 'next';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  type: 'event' | 'figure' | 'site' | 'period';
  url: string;
  imageUrl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Fetch search results from the API
    const apiRes = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(q)}`);
    
    if (!apiRes.ok) {
      throw new Error(`API returned ${apiRes.status}`);
    }
    
    const results = await apiRes.json();
    
    // Process and transform the results
    const formattedResults = results.map((result: any) => {
      // Format the URL based on the result type
      let url = '/';
      const slugifiedTitle = slugify(result.title || result.name);
      
      switch (result.type) {
        case 'event':
          url = `/su-kien/${result.id}/${slugifiedTitle}`;
          break;
        case 'figure':
          url = `/nhan-vat/${result.id}/${slugifiedTitle}`;
          break;
        case 'site':
          url = `/di-tich/${result.id}/${slugifiedTitle}`;
          break;
        case 'period':
          url = `/thoi-ky/${result.slug || slugifiedTitle}`;
          break;
      }
      
      return {
        id: result.id,
        title: result.title || result.name,
        description: result.description || '',
        type: result.type,
        url,
        imageUrl: result.imageUrl,
      };
    });
    
    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to create URL-friendly slugs
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}