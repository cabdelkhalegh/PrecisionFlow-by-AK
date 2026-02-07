/**
 * Google Gemini AI client configuration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Get Gemini 2.0 Flash model for brief processing
 * Free tier: 1,500 requests per day
 */
export const getBriefProcessingModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.2, // Lower temperature for more consistent structured output
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
};

/**
 * Get Gemini Pro model for more complex tasks
 */
export const getProModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
};
