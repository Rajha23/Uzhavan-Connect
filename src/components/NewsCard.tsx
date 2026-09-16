import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  onClick?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full"
    >
      {article.imageUrl && (
        <div className="h-48 overflow-hidden relative">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
            {article.category}
          </div>
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-1">
        {!article.imageUrl && (
          <div className="mb-3">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
              {article.category}
            </span>
          </div>
        )}
        
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {article.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50 mt-auto">
          <div className="flex items-center">
            <span className="font-medium">{article.source}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo(article.publishedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};
