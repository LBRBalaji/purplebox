import { config } from 'dotenv';
config();

import '@/ai/flows/generate-property-description.ts';
import '@/ai/flows/analyze-property-suitability.ts';
import '@/ai/flows/improve-property-demand.ts';
import '@/ai/flows/get-property-match-score.ts';
import '@/ai/flows/get-warehouses.ts';
import '@/ai/flows/find-similar-warehouses.ts';
