import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pool } from 'pg';

const DB_URI = process.env.DATABASE_URL!;
let aiMemory: PostgresStore | null = null;
let graphCheckPointer: PostgresSaver | null = null;
let vectorStore: PGVectorStore | null = null;

export async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });

  vectorStore = await PGVectorStore.initialize(embeddings, {
    tableName: 'embeddings',
    distanceStrategy: 'euclidean',
    dimensions: 1536,
    chunkSize: 800,
    pool: new Pool({
      connectionString: DB_URI,
      allowExitOnIdle: true,
      ssl: false,
    }),
  });

  return vectorStore;
}

export function getMemory() {
  if (!aiMemory) aiMemory = PostgresStore.fromConnString(DB_URI);
  return aiMemory;
}

export function getCheckpointer() {
  if (!graphCheckPointer)
    graphCheckPointer = PostgresSaver.fromConnString(DB_URI);
  return graphCheckPointer;
}

export { aiMemory, graphCheckPointer };
