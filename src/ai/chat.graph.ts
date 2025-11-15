import {
  AIMessage,
  BaseMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { getCheckpointer, getMemory, getVectorStore } from './memory';
import { ChatOpenAI } from '@langchain/openai';
import { BaseTutorPrompt } from './prompt';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import logger from '../utils/winston.logger';

const State = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y), // Important: append messages
  }),
  user_id: Annotation<string>,
  context: Annotation<Document[]>,
});

const retriver = async (state: typeof State.State) => {
  logger.info('Retriving context');
  const userMessage = state.messages.at(-1);
  const vectorStore = await getVectorStore();
  const docs = await vectorStore.similaritySearch(userMessage?.text || '', 5);
  logger.info('Found ' + docs.length + ' documents');
  return { context: docs };
};

const callLlm = async (state: typeof State.State) => {
  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    streaming: true,
    maxTokens: 4096,
    user: state.user_id,
  });
  const promptTemplate = ChatPromptTemplate.fromTemplate(BaseTutorPrompt);
  const formattedPrompt = await promptTemplate.format({
    context: state.context.map((doc) => doc.pageContent).join('\n'),
  });
  const systemMessage = new SystemMessage(formattedPrompt);
  const response = await llm.invoke([systemMessage, ...state.messages]);
  return { messages: [new AIMessage(response.content)] };
};

const graph = new StateGraph(State)
  .addNode('retriver', retriver)
  .addNode('call_llm', callLlm)
  .addEdge(START, 'retriver')
  .addEdge('retriver', 'call_llm')
  .addEdge('call_llm', END);

const edrhinoChatBot = graph.compile({
  checkpointer: getCheckpointer(),
  store: getMemory(),
});

export { edrhinoChatBot };
