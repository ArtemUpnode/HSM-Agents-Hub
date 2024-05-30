import { OllamaFunctions } from 'langchain/experimental/chat_models/ollama_functions'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { functions } from './functions/registry'
import { TOOL_SYSTEM_PROMPT_TEMPLATE } from './prompts'

function createOllamaFunctions() {
  return new OllamaFunctions({
    toolSystemPromptTemplate: TOOL_SYSTEM_PROMPT_TEMPLATE,
    format: 'json',
    temperature: 0,
    model: 'llama3'
  }).bind({ functions })
}

function createChatOllama() {
  return new ChatOllama({
    model: 'llama3',
    temperature: 0.7
  })
}

export default function getModels() {
  return {
    tools: createOllamaFunctions(),
    chat: createChatOllama()
  }
}
