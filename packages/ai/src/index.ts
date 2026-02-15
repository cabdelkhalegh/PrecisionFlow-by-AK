/**
 * AI package exports — PrecisionFlow Advanced AI Engine
 *
 * 7 AI modules powered by Google Gemini 2.0 Flash:
 * 1. Brief Parser — Extract structured data from raw briefs
 * 2. Strategy Generator — Generate full campaign strategies
 * 3. Creator Matcher — AI-powered creator scoring and ranking
 * 4. Performance Predictor — Predict content and campaign performance
 * 5. Content Reviewer — Review content for quality, safety, and alignment
 * 6. Risk Intelligence — Continuous campaign risk monitoring
 * 7. Learning Engine — Post-campaign learnings extraction
 * 8. Chat Assistant — Natural language campaign queries
 */

// Client
export * from './client';

// 1. Brief Parser (existing)
export * from './brief-parser';
export { StructuredBriefSchema } from './brief-parser';
export type { StructuredBrief } from './brief-parser';

// 2. Strategy Generator
export * from './strategy-generator';
export { CampaignStrategySchema } from './strategy-generator';
export type { CampaignStrategy, StrategyInput } from './strategy-generator';

// 3. Creator Matcher
export * from './creator-matcher';
export { CreatorMatchScoreSchema, CreatorMatchResultSchema } from './creator-matcher';
export type { CreatorMatchScore, CreatorMatchResult, CreatorProfile, MatchCriteria } from './creator-matcher';

// 4. Performance Predictor
export * from './performance-predictor';
export { PerformancePredictionSchema, CampaignPredictionSchema } from './performance-predictor';
export type { PerformancePrediction, CampaignPrediction, PredictionInput, CampaignPredictionInput } from './performance-predictor';

// 5. Content Reviewer
export * from './content-reviewer';
export { ContentReviewSchema } from './content-reviewer';
export type { ContentReview, ContentReviewInput } from './content-reviewer';

// 6. Risk Intelligence
export * from './risk-intelligence';
export { RiskIntelligenceSchema } from './risk-intelligence';
export type { RiskIntelligence, RiskAnalysisInput } from './risk-intelligence';

// 7. Learning Engine
export * from './learning-engine';
export { CampaignLearningsSchema } from './learning-engine';
export type { CampaignLearnings, LearningInput } from './learning-engine';

// 8. Chat Assistant
export * from './chat-assistant';
export { ChatResponseSchema } from './chat-assistant';
export type { ChatResponse, ChatContext, ChatMessage } from './chat-assistant';
