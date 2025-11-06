import {
  AIMessage,
  BaseMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { aiMemory, graphCheckPointer } from './memory';
import { ChatOpenAI } from '@langchain/openai';
import { BaseTutorPrompt } from './prompt';

const State = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y), // Important: append messages
  }),
  user_id: Annotation<string>,
});

// const summarizeChatHistory = (state: typeof State.State) => {}

const callLlm = async (state: typeof State.State) => {
  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    streaming: true,
    maxTokens: 4096,
    user: state.user_id,
  });
  const systemMessage = new SystemMessage(BaseTutorPrompt);
  const response = await llm.invoke([systemMessage, ...state.messages]);
  return { messages: [new AIMessage(response.content)] };
};

const graph = new StateGraph(State)
  .addNode('call_llm', callLlm)
  .addEdge(START, 'call_llm')
  .addEdge('call_llm', END);

const edrhinoChatBot = graph.compile({
  checkpointer: graphCheckPointer,
  store: aiMemory,
});

export { edrhinoChatBot };
