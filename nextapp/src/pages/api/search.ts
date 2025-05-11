import { NextApiRequest, NextApiResponse } from 'next';

type SearchResult = {
  id: number;
  title: string;
  description: string;
  type: 'event' | 'figure' | 'site' | 'period';
  url: string;
  imageUrl?: string;
};

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const query = q.toLowerCase();
    
    // Fetch data from the existing API
    const [periodsRes, eventsRes, figuresRes, sitesRes] = await Promise.all([
      fetch(`http://localhost:5000/api/periods`),
      fetch(`http://localhost:5000/api/events`),
      fetch(`http://localhost:5000/api/historical-figures`),
      fetch(`http://localhost:5000/api/historical-sites`),
    ]);
    
    const periods = await periodsRes.json();
    const events = await eventsRes.json();
    const figures = await figuresRes.json();
    const sites = await sitesRes.json();
    
    // Search in periods
    const periodResults: SearchResult[] = periods
      .filter((period: any) => 
        period.name.toLowerCase().includes(query) || 
        period.description.toLowerCase().includes(query) ||
        period.timeframe.toLowerCase().includes(query)
      )
      .map((period: any) => ({
        id: period.id,
        title: period.name,
        description: `${period.timeframe} - ${period.description}`,
        type: 'period',
        url: `/thoi-ky/${period.slug}`,
        imageUrl: null, // Periods might not have images
      }));
    
    // Search in events
    const eventResults: SearchResult[] = events
      .filter((event: any) => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        (event.detailedDescription && event.detailedDescription.toLowerCase().includes(query)) ||
        event.year.toLowerCase().includes(query)
      )
      .map((event: any) => ({
        id: event.id,
        title: event.title,
        description: `${event.year} - ${event.description}`,
        type: 'event',
        url: `/su-kien/${event.id}/${slugify(event.title)}`,
        imageUrl: event.imageUrl || null,
      }));
    
    // Search in historical figures
    const figureResults: SearchResult[] = figures
      .filter((figure: any) => 
        figure.name.toLowerCase().includes(query) || 
        figure.description.toLowerCase().includes(query) ||
        (figure.detailedDescription && figure.detailedDescription.toLowerCase().includes(query)) ||
        figure.lifespan.toLowerCase().includes(query)
      )
      .map((figure: any) => ({
        id: figure.id,
        title: figure.name,
        description: `${figure.lifespan} - ${figure.description}`,
        type: 'figure',
        url: `/nhan-vat/${figure.id}/${slugify(figure.name)}`,
        imageUrl: figure.imageUrl || null,
      }));
    
    // Search in historical sites
    const siteResults: SearchResult[] = sites
      .filter((site: any) => 
        site.name.toLowerCase().includes(query) || 
        site.description.toLowerCase().includes(query) ||
        (site.detailedDescription && site.detailedDescription.toLowerCase().includes(query)) ||
        site.location.toLowerCase().includes(query)
      )
      .map((site: any) => ({
        id: site.id,
        title: site.name,
        description: `${site.location} - ${site.description}`,
        type: 'site',
        url: `/di-tich/${site.id}/${slugify(site.name)}`,
        imageUrl: site.imageUrl || null,
      }));
    
    // Combine and sort results - giving priority to exact matches
    const allResults = [...periodResults, ...eventResults, ...figureResults, ...siteResults];
    
    // Sort results - exact title matches first, then by relevance
    allResults.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase() === query;
      const bExactMatch = b.title.toLowerCase() === query;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      const aStartsWithQuery = a.title.toLowerCase().startsWith(query);
      const bStartsWithQuery = b.title.toLowerCase().startsWith(query);
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;
      
      return 0;
    });
    
    res.status(200).json(allResults);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}