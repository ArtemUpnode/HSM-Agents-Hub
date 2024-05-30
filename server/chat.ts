import { StreamingTextResponse } from 'ai'
import { HttpResponseOutputParser } from 'langchain/output_parsers'
import { NextResponse } from 'next/server'
import { AIMessage, HumanMessage, ChatMessage } from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
import getModels from './models'
import { handleFunctionCall } from './functions/handlers'
import { MORPHEUS_SYSTEM_PROMPT_TEMPLATE } from './prompts'
import type { ChatBody, Message } from './types'

const convertMessageToLangChainMessage = (message: Message) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content)
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content)
  } else {
    return new ChatMessage(message.content, message.role)
  }
}

export async function Chat(body: ChatBody) {
  const messages = (body.messages ?? []).filter(
    msg => msg.role === 'user' || msg.role === 'assistant'
  )
  const currentMessage = messages[messages.length - 1]
  const previousMessages = messages
    .slice(0, -1)
    .map(convertMessageToLangChainMessage)

  const models = getModels()

  if (currentMessage.function_call === 'yubihsm') {
    try {
      const content = currentMessage.content.replace('@YubiHSM ', '')
      const response = await models.tools.invoke([
        new HumanMessage({ content })
      ])

      if (response.additional_kwargs.function_call) {
        const {result, name} = await handleFunctionCall(
          response.additional_kwargs.function_call
        )

        return NextResponse.json(
          { output: result, functionName: name },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          {
            error:
              'Function call response missing additional_kwargs.function_call'
          },
          { status: 400 }
        )
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      return NextResponse.json(
        { error: `YubiHSM function call failed: ${errMsg}` },
        { status: 400 }
      )
    }
  } else {
    try {
      const outputParser = new HttpResponseOutputParser()

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', MORPHEUS_SYSTEM_PROMPT_TEMPLATE],
        new MessagesPlaceholder('chat_history'),
        ['user', '{input}']
      ])

      const stream = await prompt.pipe(models.chat).pipe(outputParser).stream({
        input: currentMessage.content,
        chat_history: previousMessages
      })

      return new StreamingTextResponse(stream)
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      return NextResponse.json(
        { error: `Chat response generation failed: ${errMsg}` },
        { status: 400 }
      )
    }
  }
}
