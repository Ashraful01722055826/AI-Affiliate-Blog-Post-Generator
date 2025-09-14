import React from 'react';
import type { BlogGenerationParams } from '../types';
import { GenerateIcon } from './icons/GenerateIcon';

interface InputFormProps {
  formState: BlogGenerationParams;
  setFormState: React.Dispatch<React.SetStateAction<BlogGenerationParams>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const inputLabelClasses = "block text-sm font-medium text-slate-700 mb-1";
const inputFieldClasses = "block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";
const selectFieldClasses = `${inputFieldClasses} pr-8`;

export const InputForm: React.FC<InputFormProps> = ({ formState, setFormState, onGenerate, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormState(prevState => ({
        ...prevState,
        [name]: checked,
      }));
    } else {
      setFormState(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="productUrl" className={inputLabelClasses}>Product URL</label>
          <input
            type="url"
            id="productUrl"
            name="productUrl"
            value={formState.productUrl}
            onChange={handleChange}
            placeholder="https://example.com/product-page"
            required
            className={inputFieldClasses}
          />
        </div>

        <div>
          <label htmlFor="affiliateLink" className={inputLabelClasses}>
            Affiliate Link <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            id="affiliateLink"
            name="affiliateLink"
            value={formState.affiliateLink || ''}
            onChange={handleChange}
            placeholder="https://your-affiliate-link.com"
            className={inputFieldClasses}
          />
        </div>

        <div>
          <label htmlFor="seoKeywords" className={inputLabelClasses}>
            SEO Keywords <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            id="seoKeywords"
            name="seoKeywords"
            value={formState.seoKeywords || ''}
            onChange={handleChange}
            placeholder="e.g., best camera, photography, 4k video"
            className={inputFieldClasses}
          />
        </div>

        <div>
          <label htmlFor="targetAudience" className={inputLabelClasses}>Target Audience</label>
          <select
            id="targetAudience"
            name="targetAudience"
            value={formState.targetAudience}
            onChange={handleChange}
            className={selectFieldClasses}
          >
            <option>Tech lovers</option>
            <option>Fitness enthusiasts</option>
            <option>Parents</option>
            <option>Home chefs</option>
            <option>Gamers</option>
            <option>Fashionistas</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="articleLength" className={inputLabelClasses}>Article Length</label>
          <select
            id="articleLength"
            name="articleLength"
            value={formState.articleLength}
            onChange={handleChange}
            className={selectFieldClasses}
          >
            <option>Short (~500 words)</option>
            <option>Long (~1200 words)</option>
          </select>
        </div>

        <div>
          <label htmlFor="writingStyle" className={inputLabelClasses}>Writing Style</label>
          <select
            id="writingStyle"
            name="writingStyle"
            value={formState.writingStyle}
            onChange={handleChange}
            className={selectFieldClasses}
          >
            <option>Friendly</option>
            <option>Professional</option>
            <option>Persuasive</option>
            <option>Humorous</option>
            <option>Technical</option>
            <option>Interview</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className={inputLabelClasses}>Language</label>
          <select
            id="language"
            name="language"
            value={formState.language}
            onChange={handleChange}
            className={selectFieldClasses}
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Bangla</option>
          </select>
        </div>

        <div className="flex items-center">
            <input
                id="generateImages"
                name="generateImages"
                type="checkbox"
                checked={formState.generateImages}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="generateImages" className="ml-3 block text-sm font-medium text-slate-700">
                Generate article images
            </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <GenerateIcon />
              Generate Article
            </>
          )}
        </button>
      </form>
    </div>
  );
};