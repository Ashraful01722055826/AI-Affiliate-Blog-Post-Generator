import React, { useState, useMemo, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { ShareIcon } from './icons/ShareIcon';
import type { BlogPostResult } from '../types';

interface ArticleDisplayProps {
  content: BlogPostResult | null;
  isLoading: boolean;
  error: string | null;
  productUrl: string;
}

const ArticleSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-slate-300 rounded w-3/4"></div>
    <div className="h-4 bg-slate-300 rounded w-5/6"></div>
    <div className="my-6 rounded-lg shadow-md w-full aspect-video bg-slate-300"></div>
    <div className="h-6 bg-slate-300 rounded w-1/3"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-300 rounded"></div>
      <div className="h-4 bg-slate-300 rounded w-5/6"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-300 rounded"></div>
      <div className="h-4 bg-slate-300 rounded w-5/6"></div>
    </div>
  </div>
);

const parseMarkdown = (text: string, keyPrefix: string) => {
    return text.split('\n').map((line, index) => {
        const key = `${keyPrefix}-line-${index}`;
        if (line.startsWith('### ')) {
            return <h3 key={key} className="text-xl font-semibold mt-6 mb-2 text-slate-800">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={key} className="text-2xl font-bold mt-8 mb-4 text-slate-900 border-b pb-2">{line.substring(3)}</h2>;
        }
        if (line.startsWith('* ') || line.startsWith('- ')) {
            return <li key={key} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.trim() === '') {
            return null; // Don't render empty lines as paragraphs, let margins handle spacing
        }
        return <p key={key} className="mb-4 text-slate-700 leading-relaxed">{line}</p>;
    }).filter(Boolean);
};

const parseArticleWithImages = (article: string, images: string[]) => {
    if (!article) return [];
    
    const imageRegex = /\[IMAGE_(\d+)]/g;
    // Splits the article into text parts and image index parts
    // e.g., ["text before", "1", "text after", "2", "text after that"]
    const parts = article.split(imageRegex);
    const elements: React.ReactNode[] = [];
  
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // This is a text part
        const textPart = parts[i];
        if (textPart) {
          elements.push(...parseMarkdown(textPart, `part-${i}`));
        }
      } else {
        // This is an image index part
        const imageIndex = parseInt(parts[i], 10) - 1;
        if (images[imageIndex]) {
          elements.push(
            <img 
              key={`img-${imageIndex}`} 
              src={images[imageIndex]} 
              alt={`Generated illustration for the article ${imageIndex + 1}`} 
              className="my-6 rounded-lg shadow-md w-full object-cover aspect-video bg-slate-200" 
            />
          );
        }
      }
    }
    return elements;
};


export const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ content, isLoading, error, productUrl }) => {
  const [isCopied, setIsCopied] = useState(false);

  const parsedContent = useMemo(() => {
    if (!content?.article) return null;
    return parseArticleWithImages(content.article, content.images);
  }, [content]);

  const handleCopy = () => {
    if (!content?.article) return;
    navigator.clipboard.writeText(content.article).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (!content?.article || !productUrl) return;

    const titleMatch = content.article.match(/^## (.*)/m);
    const title = titleMatch ? titleMatch[1] : 'Check out this AI-Generated Article';

    const firstParagraph = content.article.split('\n').find(line => line.trim().length > 50) || 'An in-depth product review.';

    const shareData = {
        title: title,
        text: firstParagraph,
        url: productUrl,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
        }
    } else {
        alert('Web Share API is not supported in your browser.');
    }
  };

  useEffect(() => {
      setIsCopied(false);
  }, [content]);

  const renderContent = () => {
    if (isLoading) {
      return <ArticleSkeleton />;
    }
    if (error) {
      return (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
          <h3 className="font-bold">Generation Failed</h3>
          <p>{error}</p>
        </div>
      );
    }
    if (content?.article) {
      return <div>{parsedContent}</div>;
    }
    return (
      <div className="text-center text-slate-500 py-16">
        <h3 className="text-xl font-semibold">Your article will appear here</h3>
        <p>Fill out the form and click "Generate Article" to begin.</p>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg relative min-h-[400px]">
      {content?.article && !isLoading && !error && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={handleShare}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-md text-sm transition-colors flex items-center gap-2"
            title="Share article"
          >
            <ShareIcon />
            Share
          </button>
          <button
            onClick={handleCopy}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-md text-sm transition-colors flex items-center gap-2"
            title="Copy to clipboard"
          >
            <CopyIcon />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <div className="prose prose-slate max-w-none">
        {renderContent()}
      </div>
    </div>
  );
};