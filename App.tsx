import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { ArticleDisplay } from './components/ArticleDisplay';
import { generateBlogPost } from './services/geminiService';
import type { BlogGenerationParams, BlogPostResult } from './types';

const App: React.FC = () => {
  const [formState, setFormState] = useState<BlogGenerationParams>({
    productUrl: '',
    affiliateLink: '',
    targetAudience: 'Tech lovers',
    writingStyle: 'Friendly',
    language: 'English',
    generateImages: true,
    seoKeywords: '',
    articleLength: 'Long (~1200 words)',
  });
  const [generatedContent, setGeneratedContent] = useState<BlogPostResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!formState.productUrl) {
      setError('Please enter a product URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const result = await generateBlogPost(formState);
      setGeneratedContent(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? `An error occurred: ${err.message}`
          : 'An unknown error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Affiliate Blog Post Generator
          </h1>
          <p className="text-slate-500 mt-1">
            Turn any product link into a ready-to-publish, SEO-optimized article with images.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <InputForm
              formState={formState}
              setFormState={setFormState}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-8">
            <ArticleDisplay
              content={generatedContent}
              isLoading={isLoading}
              error={error}
              productUrl={formState.productUrl}
            />
          </div>
        </div>
      </main>
      
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;