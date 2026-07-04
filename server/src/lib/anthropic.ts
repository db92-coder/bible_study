import Anthropic from '@anthropic-ai/sdk';
import { envVar } from './env.js';

const apiKey = envVar('ANTHROPIC_API_KEY');

export const anthropic: Anthropic | null = apiKey ? new Anthropic({ apiKey }) : null;

// Model for in-app study features, per the project spec.
export const STUDY_MODEL = 'claude-sonnet-4-6';

if (!anthropic) {
  console.warn('[scribe] ANTHROPIC_API_KEY not set — AI study features are disabled.');
}
