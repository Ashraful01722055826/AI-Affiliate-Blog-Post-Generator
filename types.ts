export interface BlogGenerationParams {
  productUrl: string;
  affiliateLink?: string;
  targetAudience: string;
  writingStyle: string;
  language: string;
  generateImages: boolean;
  seoKeywords?: string;
  articleLength: string;
}

export interface BlogPostResult {
  article: string;
  images: string[];
}