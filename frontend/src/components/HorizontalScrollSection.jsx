import React, { useRef, useState, useEffect } from 'react';

const HorizontalScrollSection = ({ title, topics, renderTopicCard }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const isScrollable = scrollWidth > clientWidth;
      setHasScrollableContent(isScrollable);
      if (isScrollable) {
        setShowLeftArrow(container.scrollLeft > 10);
        setShowRightArrow(container.scrollLeft + clientWidth < scrollWidth - 10);
      } else {
        setShowLeftArrow(false);
        setShowRightArrow(false);
      }
    }
  };

  useEffect(() => {
    // Wait for DOM to render
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [topics]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  if (!topics || topics.length === 0) return null;

  return (
    <div className="relative mb-12 group">
      <h2 className="text-2xl font-bold text-primary-600 mb-4">{title}</h2>
      <div className="relative">
        {/* Left Arrow – only rendered when scrollable and not at start */}
        {hasScrollableContent && showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 focus:outline-none transition-opacity duration-300 opacity-100"
            style={{ marginLeft: '-12px' }}
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topics.map((topic) => (
            <div key={topic.id} className="flex-shrink-0 w-80">
              {renderTopicCard(topic)}
            </div>
          ))}
        </div>

        {/* Right Arrow – only rendered when scrollable and not at end */}
        {hasScrollableContent && showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 focus:outline-none transition-opacity duration-300 opacity-100"
            style={{ marginRight: '-12px' }}
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default HorizontalScrollSection;