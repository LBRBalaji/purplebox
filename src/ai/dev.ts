import { config } from 'dotenv';
config();

import '@/ai/flows/generate-property-description.ts';
import '@/ai/flows/analyze-property-suitability.ts';
import '@/ai/flows/improve-property-demand.ts';