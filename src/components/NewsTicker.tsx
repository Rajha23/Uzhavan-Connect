import React from 'react';
import { Newspaper, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NewsTickerProps {
  news: NewsArticle[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  const { t } = useLanguage();
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-emerald-800 text-white flex items-center overflow-hidden h-10 border-b border-emerald-900 relative">
      <div className="bg-emerald-900 h-full flex items-center px-4 font-semibold whitespace-nowrap z-10 shadow-lg min-w-max border-r border-emerald-700">
        <Newspaper className="w-4 h-4 mr-2 text-emerald-400" />
        <span className="hidden sm:inline">{t('news.latest', undefined, 'Latest News')}</span>
        <span className="sm:hidden">{t('news.short', undefined, 'News')}</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full group">
        <div className="absolute whitespace-nowrap h-full flex items-center animate-marquee group-hover:[animation-play-state:paused]">
          {news.map((item, i) => (
            <React.Fragment key={item.id}>
              <span className="inline-flex items-center mx-4 text-sm hover:text-emerald-300 cursor-pointer transition-colors" title={item.summary}>
                <span className="font-bold text-emerald-400 mr-2">[{item.category}]</span>
                {item.title}
                <span className="text-emerald-300/60 ml-2 text-xs">
                  - {item.source}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-500/50 mx-2" />
            </React.Fragment>
          ))}
          {/* Duplicate for seamless looping */}
          {news.map((item, i) => (
            <React.Fragment key={`${item.id}-dup`}>
              <span className="inline-flex items-center mx-4 text-sm hover:text-emerald-300 cursor-pointer transition-colors" title={item.summary}>
                <span className="font-bold text-emerald-400 mr-2">[{item.category}]</span>
                {item.title}
                <span className="text-emerald-300/60 ml-2 text-xs">
                  - {item.source}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-500/50 mx-2" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
