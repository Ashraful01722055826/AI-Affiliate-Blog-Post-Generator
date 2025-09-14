import { GoogleGenAI, Type } from "@google/genai";
import type { BlogGenerationParams, BlogPostResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const blogPostStructure = `
    **Required Blog Post Structure:**

    ## [Create a Catchy, SEO-Optimized Title]
    - Include the main product name/keyword.
    - Make it engaging and click-worthy.

    [Write a short, compelling introduction. Hook the reader and briefly introduce the product and why it's worth their attention.]

    ## Product Overview
    - What is this product?
    - Who is it for? (Relate it to the target audience).
    - What main problem does it solve?

    ## Key Features & Benefits
    - Use a bulleted list.
    - For each feature, explain the direct benefit to the user. Don't just list specs; explain why they matter.

    ## Pros and Cons
    - Create two sub-sections (H3 for "### Pros" and "### Cons").
    - Provide an honest, balanced view. List at least 3 pros and 2 cons.

    ## Comparison with Similar Products
    - If possible, briefly compare this product to one or two well-known alternatives.
    - Highlight what makes this product stand out.

    ## Buying Guide: Why This Product is a Smart Choice
    - Explain specific scenarios or reasons why this product is a great purchase for the target audience.
    - Offer tips on what to consider before buying.

    ## Final Verdict
    [IMAGE: stylish banner with the word "Final Verdict" in bold elegant design]

    [Start with a summary paragraph (4–5 sentences) that highlights the overall usefulness of the product.]

    ### Who Should Buy This?
    [Describe in detail the type of people or situations where this product is most valuable.]

    ### Who Might Avoid This?
    [Explain cases where the product may not be the best fit.]

    ### Key Strengths
    - **Strength 1:** [Short explanation]
    - **Strength 2:** [Short explanation]
    - **Strength 3:** [Short explanation]
    - **Strength 4:** [Short explanation]
    - **Strength 5:** [Short explanation]
    (You can add up to 2 more strengths)

    ### Possible Limitations
    - **Limitation 1:** [Short explanation]
    - **Limitation 2:** [Short explanation]
    (You can add 1 more limitation)
    
    ### Rating Breakdown
    - **Design:** ⭐⭐⭐⭐☆
    - **Performance:** ⭐⭐⭐⭐⭐
    - **Value for Money:** ⭐⭐⭐⭐☆

    [End with a strong persuasive conclusion (6–7 sentences) encouraging readers to take action. The final sentence must include the call-to-action.] Ready to upgrade your experience? Get the [Product Name] today! Check the latest price here: [AFFILIATE_LINK]
`;

const getBasePrompt = (params: BlogGenerationParams) => {
    const { productUrl, targetAudience, writingStyle, language, articleLength, seoKeywords, affiliateLink } = params;

    const wordCountInstruction = articleLength === 'Short (~500 words)'
        ? 'The final article should be between 400 and 600 words.'
        : 'The final article should be between 800 and 1200 words.';
        
    const seoInstruction = seoKeywords
        ? `- **SEO Keywords:** Naturally integrate the following keywords throughout the article: **${seoKeywords}**. Do not just list them.`
        : '';

    const styleInstruction = writingStyle === 'Interview'
        ? `Adopt an **Interview** tone. Structure the content as a Q&A with an expert about the product.`
        : `Adopt a **${writingStyle}** tone.`;

    const affiliateLinkInstruction = affiliateLink
        ? `- **Affiliate Link:** The final call to action must use this exact URL: **${affiliateLink}**`
        : `- **Affiliate Link Placeholder:** Where the call-to-action link should go, you MUST insert the exact placeholder: **[AFFILIATE_LINK]**`;

    return `
You are an expert AI content writer specializing in high-ranking eCommerce and affiliate blog posts.
Your goal is to generate a full, SEO-optimized blog post from a product URL.

**Core Task:**
- **Analyze Product:** Thoroughly analyze the content at this URL: ${productUrl}. Use Google Search to extract all relevant product details. If you cannot access the URL, state that and stop.

**Content Requirements:**
- **Target Audience:** Tailor the tone and focus for: **${targetAudience}**.
- **Writing Style:** ${styleInstruction}
- **Language:** Write the entire article in **${language}**.
- **Article Length:** ${wordCountInstruction}
${seoInstruction}
${affiliateLinkInstruction}

**Formatting & Structure:**
- Use markdown for structure (H2 for main titles, H3 for sub-headings, bullet points for lists).
- Follow the provided blog post structure precisely.
    `;
}


export async function generateBlogPost(params: BlogGenerationParams): Promise<BlogPostResult> {
    const basePrompt = getBasePrompt(params);

    try {
        if (!params.generateImages) {
            const prompt = `
                ${basePrompt}
                ---
                ${blogPostStructure}
                ---
                Begin generating the blog post now.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            return { article: response.text, images: [] };

        } else {
            const imageInstructions = `
**Image Generation:**
- After creating the article, identify 3 key moments for images (e.g., a hero shot, a feature in action, a lifestyle benefit).
- Insert placeholders in the markdown article text in the format \`[IMAGE_1]\`, \`[IMAGE_2]\`, and \`[IMAGE_3]\`.
- Generate a corresponding array of 3 detailed, descriptive prompts for an AI image generator. These prompts should result in photorealistic, high-quality marketing images.
            `;
            
            const prompt = `
                ${basePrompt}
                ${imageInstructions}

                **Output Requirement:** You MUST return a single valid JSON object matching the provided schema. Do not include markdown formatting like \`\`\`json.
                ---
                ${blogPostStructure.replace('## [Create a Catchy, SEO-Optimized Title]', '## [Create a Catchy, SEO-Optimized Title]\n\n[IMAGE_1]')}
                ---
                Begin generating the JSON output now.
            `;

            const schema = {
                type: Type.OBJECT,
                properties: {
                    article: {
                        type: Type.STRING,
                        description: "The full blog post content in markdown format, including three image placeholders: [IMAGE_1], [IMAGE_2], and [IMAGE_3]."
                    },
                    imagePrompts: {
                        type: Type.ARRAY,
                        description: "An array of exactly 3 detailed, descriptive prompts for an AI image generator.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["article", "imagePrompts"],
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const resultJson = JSON.parse(response.text);
            const article = resultJson.article as string;
            const imagePrompts = resultJson.imagePrompts as string[];

            if (!imagePrompts || imagePrompts.length === 0) {
                return { article, images: [] };
            }

            const imagePromises = imagePrompts.map((p: string) => 
                ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: p,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/jpeg',
                        aspectRatio: '16:9',
                    },
                })
            );

            const imageResponses = await Promise.all(imagePromises);
            const images = imageResponses.map(res => {
                const base64ImageBytes: string = res.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            });

            return { article, images };
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate blog post: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}