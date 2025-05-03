import { useState, useEffect } from 'react';

interface UseScrollSpyOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollSpy(
  elementIds: string[],
  options: UseScrollSpyOptions = {}
): number {
  const [activeIndex, setActiveIndex] = useState(-1);
  
  useEffect(() => {
    if (!elementIds.length) return;
    
    const observerOptions = {
      root: null,
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0.5,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = elementIds.findIndex(
            (id) => id === entry.target.id
          );
          if (index !== -1) {
            setActiveIndex(index);
          }
        }
      });
    }, observerOptions);
    
    // Observe all elements
    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => {
      observer.disconnect();
    };
  }, [elementIds, options.rootMargin, options.threshold]);
  
  return activeIndex;
}
