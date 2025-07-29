import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.warn(
    'Missing API key. Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.'
  );
}

const google = googleAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
});

export const ai = genkit({
  plugins: [google],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
