import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { GetStaticProps } from 'next';
import { API_ENDPOINTS, DEFAULT_SEO_IMAGE } from '@/lib/constants';
import { PeriodData, EventData, HistoricalFigure, HistoricalSite } from '@/lib/types';
import HeroSection from '@/components/HeroSection';

interface HomePageProps {
  periods: PeriodData[];
  events: EventData[];
  figures: HistoricalFigure[];
  sites: HistoricalSite[];
  heroImageUrl: string;
}

export default function HomePage({ periods, events, figures, sites, heroImageUrl }: HomePageProps) {
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  
  // Scroll to timeline section when "Khám phá lịch sử" is clicked
  const handleStartExplore = () => {
    const timelineSection = document.getElementById('timeline-section');
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter events and figures by active period
  const filteredEvents = activePeriod 
    ? events.filter(event => {
        const period = periods.find(p => p.id === event.periodId);
        return period?.slug === activePeriod;
      })
    : events.slice(0, 4);

  const filteredFigures = activePeriod
    ? figures.filter(figure => {
        const period = periods.find(p => p.id === figure.periodId);
        return period?.slug === activePeriod;
      })
    : figures.slice(0, 4);

  const filteredSites = activePeriod
    ? sites.filter(site => {
        const period = periods.find(p => p.id === site.periodId);
        return period?.slug === activePeriod;
      })
    : sites.slice(0, 4);

  return (
    <>
      <Head>
        <title>Lịch Sử Việt Nam - Khám phá hành trình lịch sử dân tộc</title>
        <meta name="description" content="Khám phá lịch sử Việt Nam từ thời kỳ Tiền sử đến hiện đại thông qua các sự kiện, nhân vật và di tích lịch sử quan trọng." />
        <link rel="canonical" href="https://lichsuviet.edu.vn" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lichsuviet.edu.vn" />
        <meta property="og:title" content="Lịch Sử Việt Nam - Khám phá hành trình lịch sử dân tộc" />
        <meta property="og:description" content="Khám phá lịch sử Việt Nam từ thời kỳ Tiền sử đến hiện đại thông qua các sự kiện, nhân vật và di tích lịch sử quan trọng." />
        <meta property="og:image" content={heroImageUrl || DEFAULT_SEO_IMAGE} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://lichsuviet.edu.vn" />
        <meta property="twitter:title" content="Lịch Sử Việt Nam - Khám phá hành trình lịch sử dân tộc" />
        <meta property="twitter:description" content="Khám phá lịch sử Việt Nam từ thời kỳ Tiền sử đến hiện đại thông qua các sự kiện, nhân vật và di tích lịch sử quan trọng." />
        <meta property="twitter:image" content={heroImageUrl || DEFAULT_SEO_IMAGE} />
      </Head>

      {/* Hero Section */}
      <HeroSection 
        onStartExplore={handleStartExplore} 
        backgroundImage={heroImageUrl} 
      />

      {/* Timeline Section */}
      <section id="timeline-section" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Các Thời Kỳ Lịch Sử</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Hành trình lịch sử Việt Nam qua các thời kỳ từ Tiền sử - Hồng Bàng đến hiện đại, 
              mỗi giai đoạn đều mang đậm dấu ấn văn hóa và bản sắc dân tộc.
            </p>
          </div>

          {/* Timeline Period Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setActivePeriod(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activePeriod === null
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Tất Cả
            </button>
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setActivePeriod(period.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activePeriod === period.slug
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>

          {/* Timeline Content */}
          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            {filteredEvents.map((event, index) => {
              const period = periods.find(p => p.id === event.periodId);
              return (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-connector"></div>
                  <div className={`timeline-content fade-in ${period ? `period-${period.slug}` : ''}`}>
                    <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">{event.year}</div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
                    <Link 
                      href={`/su-kien/${event.id}/${event.slug || event.title.toLowerCase().replace(/ /g, '-')}`}
                      className="text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors font-medium text-sm"
                    >
                      Xem Chi Tiết &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/su-kien"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem Tất Cả Sự Kiện
            </Link>
          </div>
        </div>
      </section>

      {/* Historical Figures Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nhân Vật Lịch Sử</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Những vị anh hùng, danh nhân đã góp phần làm nên lịch sử vẻ vang của dân tộc Việt Nam qua các thời kỳ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredFigures.map((figure) => (
              <div key={figure.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-w-3 aspect-h-4 relative h-64">
                  <Image
                    src={figure.imageUrl}
                    alt={figure.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{figure.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{figure.lifespan}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{figure.description}</p>
                  <Link 
                    href={`/nhan-vat/${figure.id}/${figure.slug || figure.name.toLowerCase().replace(/ /g, '-')}`}
                    className="text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors font-medium text-sm"
                  >
                    Tìm Hiểu Thêm &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/nhan-vat"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem Tất Cả Nhân Vật
            </Link>
          </div>
        </div>
      </section>

      {/* Historical Sites Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Di Tích Lịch Sử</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Những công trình, địa điểm ghi dấu các sự kiện quan trọng trong lịch sử Việt Nam, minh chứng cho nền văn minh lâu đời của dân tộc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredSites.map((site) => (
              <div key={site.id} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 relative h-48">
                  <Image
                    src={site.imageUrl || DEFAULT_SEO_IMAGE}
                    alt={site.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{site.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{site.location}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{site.description}</p>
                  <Link 
                    href={`/di-tich/${site.id}/${site.slug || site.name.toLowerCase().replace(/ /g, '-')}`}
                    className="text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors font-medium text-sm"
                  >
                    Khám Phá &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/di-tich"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Xem Tất Cả Di Tích
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch periods
    const periodsRes = await fetch(API_ENDPOINTS.PERIODS);
    const periods = await periodsRes.json();

    // Fetch events (limit to 10 for the homepage)
    const eventsRes = await fetch(`${API_ENDPOINTS.EVENTS}?limit=10`);
    const events = await eventsRes.json();

    // Fetch historical figures (limit to 8 for the homepage)
    const figuresRes = await fetch(`${API_ENDPOINTS.HISTORICAL_FIGURES}?limit=8`);
    const figures = await figuresRes.json();

    // Fetch historical sites (limit to 8 for the homepage)
    const sitesRes = await fetch(`${API_ENDPOINTS.HISTORICAL_SITES}?limit=8`);
    const sites = await sitesRes.json();

    // Fetch hero background image from settings
    const heroImageRes = await fetch(API_ENDPOINTS.SETTING_BY_KEY('home_background_url'));
    const heroImageSetting = await heroImageRes.json();
    const heroImageUrl = heroImageSetting?.value || DEFAULT_SEO_IMAGE;

    return {
      props: {
        periods,
        events,
        figures,
        sites,
        heroImageUrl
      },
      revalidate: 3600 // Revalidate at most every hour
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    return {
      props: {
        periods: [],
        events: [],
        figures: [],
        sites: [],
        heroImageUrl: DEFAULT_SEO_IMAGE
      },
      revalidate: 60 // Try again more frequently if there was an error
    };
  }
};