import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { NewsCard } from '../components/NewsCard';
import { Newspaper } from 'lucide-react';
import { NewsArticle } from '../types';

// Static fallback news data — replace with API call or context data when available
const FALLBACK_NEWS: NewsArticle[] = [];

export const NewsPage: React.FC = () => {
  const { t } = useLanguage();
  const newsArticles: NewsArticle[] = FALLBACK_NEWS;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
            <Newspaper className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#01472e] tracking-tight">
            {t('farmer.newsTitle', 'Agriculture News & Updates')}
          </h2>
        </div>

        {newsArticles.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-[#ccd5ae]/40 text-center space-y-2">
            <Newspaper className="w-10 h-10 mx-auto text-[#a3b18a]" />
            <h4 className="text-sm font-semibold text-[#01472e]">No news articles yet</h4>
            <p className="text-xs text-[#5c7065] max-w-sm mx-auto">
              Agriculture news and updates will appear here once connected to the live feed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {newsArticles.map((article: NewsArticle) => (
              <NewsCard
                key={article.id}
                article={article}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
