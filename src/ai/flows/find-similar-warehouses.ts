
'use server';
/**
 * @fileOverview An AI agent that finds warehouses similar to a user's query using embeddings.
 *
 * - findSimilarWarehouses - A function that handles the similarity search.
 * - FindSimilarWarehousesInput - The input type for the findSimilarWarehouses function.
 * - FindSimilarWarehousesOutput - The return type for the findSimilarWarehouses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { warehouseSchema } from '@/lib/schema';
import allWarehouses from '@/data/warehouses.json';
import { type WarehouseSchema } from '@/lib/schema';
import { embed } from 'genkit/ai';

const FindSimilarWarehousesInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
});
export type FindSimilarWarehousesInput = z.infer<typeof FindSimilarWarehousesInputSchema>;

const FindSimilarWarehousesOutputSchema = z.object({
  warehouses: z.array(warehouseSchema).describe('A list of warehouses that are semantically similar to the query, ordered by similarity.'),
});
export type FindSimilarWarehousesOutput = z.infer<typeof FindSimilarWarehousesOutputSchema>;

const embeddingModel = 'googleai/text-embedding-004';

// Simple cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of the same length');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) {
        return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}


const findSimilarWarehousesFlow = ai.defineFlow(
  {
    name: 'findSimilarWarehousesFlow',
    inputSchema: FindSimilarWarehousesInputSchema,
    outputSchema: FindSimilarWarehousesOutputSchema,
  },
  async ({ query }) => {
    const warehouses = allWarehouses as WarehouseSchema[];

    // 1. Create a detailed description for each warehouse
    const warehouseDocs = warehouses
        .filter(w => w.isActive)
        .map(w => {
            const specs = w.specifications;
            return `Warehouse named ${w.locationName} of size ${w.size} sq. ft. is located in ${w.locationName}. It is ${w.readiness} with ceiling height of ${specs.ceilingHeight} ft, ${specs.docks} docks, and flooring is ${specs.flooringType}. Office space is ${specs.officeSpace ? 'available' : 'not available'}.`;
        });

    // 2. Generate embeddings for the user's query and all warehouse documents
    const [queryEmbedding, warehouseEmbeddings] = await Promise.all([
        embed({ model: embeddingModel, content: query }),
        embed({ model: embeddingModel, content: warehouseDocs }),
    ]);

    // 3. Calculate similarities and rank
    const similarities = warehouseEmbeddings.map((docEmbedding, i) => ({
        index: i,
        similarity: cosineSimilarity(queryEmbedding, docEmbedding),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    // 4. Return the top matching warehouses, ordered by similarity
    const topWarehouses = similarities
        .filter(sim => sim.similarity > 0.4) // Set a threshold to avoid irrelevant results
        .map(sim => warehouses.filter(w => w.isActive)[sim.index]);
    
    return { warehouses: topWarehouses };
  }
);


export async function findSimilarWarehouses(input: FindSimilarWarehousesInput): Promise<FindSimilarWarehousesOutput> {
    return findSimilarWarehousesFlow(input);
}
