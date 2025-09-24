import { config } from 'dotenv';
config();

import '@/ai/flows/generate-response-from-intent-and-entities.ts';
import '@/ai/flows/initial-intent-detection.ts';
import '@/ai/flows/extract-entities-from-message.ts';