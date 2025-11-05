import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

const DB_URI = process.env.DATABASE_URL!;
const aiMemory = PostgresStore.fromConnString(DB_URI);
const graphCheckPointer = PostgresSaver.fromConnString(DB_URI);

export { aiMemory, graphCheckPointer };
