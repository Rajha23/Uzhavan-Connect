import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AGRICULTURE_NEWS } from '../data/mockData';
import { NewsTicker } from '../components/NewsTicker';
import { NewsCard } from '../components/NewsCard';
import { DetailDrawer } from '../components/DetailDrawer';
import { Newspaper } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const { t } = useLanguage();
  const [drawerState, setDrawerState] = useState<{ type: string; data?: any } | null>(null);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <NewsTicker news={AGRICULTURE_NEWS} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
            <Newspaper className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#01472e] tracking-tight">
            {t('farmer.newsTitle', 'Agriculture News & Updates')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {AGRICULTURE_NEWS.map((article) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              onClick={() => setDrawerState({ type: 'news-article', data: article })}
            />
          ))}
        </div>
      </div>

      <DetailDrawer
        isOpen={drawerState !== null}
        onClose={() => setDrawerState(null)}
        title={drawerState?.data?.title || 'News Article'}
      >
        {drawerState?.type === 'news-article' && drawerState.data && (
          <div className="space-y-4">
            <img 
              src={drawerState.data.imageUrl} 
              alt={drawerState.data.title}
              className="w-full h-48 object-cover rounded-xl border border-[#ccd5ae]/30"
            />
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
                {drawerState.data.category}
              </span>
              <span className="text-slate-500">{drawerState.data.date}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {drawerState.data.summary}
            </p>
            {drawerState.data.content && (
              <div className="text-sm text-slate-600 leading-relaxed mt-4 space-y-3">
                {drawerState.data.content.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
