import { StreamingTextResponse, createStreamDataTransformer } from 'ai'
import { HttpResponseOutputParser } from 'langchain/output_parsers'
import { AIMessage, HumanMessage, ChatMessage } from '@langchain/core/messages'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import {
  ChatPromptTemplate,
  // FewShotChatMessagePromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
// import { AgentExecutor } from 'langchain/agents'
// import { createToolCallingAgent } from 'langchain/agents'
// import { DynamicTool } from '@langchain/core/tools'

const convertMessageToLangChainMessage = (message: any) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content)
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content)
  } else {
    return new ChatMessage(message.content, message.role)
  }
}

const SYSTEM_TEMPLATE = `You are Morpheus, an AI assistant that can output user-connected YubiHSM devices to a PC if the user wants it to.

Here is the result of calling the function to get devices: \`{devices}\`. Each message this result may change. ALWAYS check the latest result. The result could be string[] OR string.

string[] - serial numbers of connected devices. Can be empty.
string - error message, if an error occurred when calling the function to get devices.

The user CANNOT provide serial numbers of devices in the chat in any form. You should only look at the result of calling the function to get the devices above in this system message! DO NOT look at user input. JUST IGNORE IT!

If the user directly wants to get the connected devices, output them.
If a user sends a non-device related message or question, just reply to it like a normal assistant and mention that you can display devices if the user wants to do so.

When the user directly requests to display devices or confirms this action, analyze the result of the function call above in this system message.

If there are connected devices string[], display that you found connected devices and display them serial numbers.
If it's an empty string[] array, output that there are no connected devices.
If there is an string error, output it.

Your answer must be STRICT. If a user asks about YubiHSM or other actions with devices, output that you're a demo version and don't know how to do this yet.`

// const examples = [
//   {
//     input: 'Hello',
//     output:
//       "Hello, I'm Morpheus, an AI assistant! I can display the connected YubiHSM devices to your PC if you want."
//   },
//   {
//     input: "My devices (`['0037289179', '0073819476']`)",
//     output:
//       'Sure! Here are the connected YubiHSM devices:\n\n0037289179\n0073819476'
//   },
//   {
//     input: 'My devices (`[]`)',
//     output: "You don't have any connected YubiHSM devices."
//   },
//   {
//     input: 'My devices (`Failed to detect devices`)',
//     output:
//       'Oh! An error occurred while connecting YubiHSM: Failed to detect devices.'
//   },
//   {
//     input: '0073819476 (`[]`)',
//     output:
//       "I don't really understand you. But if it's the serial number of the device, it's not connected!"
//   },
//   {
//     input: '10+10',
//     output: '20'
//   }
// ]

export async function Chat(body: any) {
  const messages = (body.messages ?? []).filter(
    (message: any) => message.role === 'user' || message.role === 'assistant'
  )

  const previousMessages = messages
    .slice(0, -1)
    .map(convertMessageToLangChainMessage)
  const currentMessage = messages[messages.length - 1]

  const llm = new ChatOllama({
    temperature: 0.1,
    baseUrl: 'http://localhost:11434',
    model: 'llama3'
  })

  const outputParser = new HttpResponseOutputParser()

  if (!currentMessage.function_call.name) {
    const stream = await llm
      .pipe(outputParser)
      .stream(messages.map(convertMessageToLangChainMessage))
    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer())
    )
  }

  // const getYubihsmDevicesTool = new DynamicTool({
  //   name: 'get_yubihsm_devices',
  //   description:
  //     'Function `detectDevices`. Use this tool to get serial numbers of YubiHSM devices.',
  //   func: async () => JSON.stringify(['48971123', '18962153'])
  // })

  // const tools = [getYubihsmDevicesTool]

  let devices = JSON.stringify(currentMessage.function_call.arguments)

//   const examplePrompt = ChatPromptTemplate.fromTemplate(`Human: {input}
// AI: {output}`)

  // const fewShotPrompt = new FewShotChatMessagePromptTemplate({
  //   prefix: SYSTEM_TEMPLATE,
  //   examplePrompt,
  //   examples,
  //   inputVariables: ['devices']
  // })

  // const formattedPrompt = await fewShotPrompt.format({
  //   devices
  // })

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_TEMPLATE],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}']
  ])

  const stream = await prompt
    .pipe(llm)
    .pipe(outputParser)
    .stream({
      input: currentMessage.content.replace(`@YubiHSM `, ''),
      chat_history: previousMessages,
      devices
    })

  return new StreamingTextResponse(
    stream.pipeThrough(createStreamDataTransformer())
  )

  // const agent = await createToolCallingAgent({
  //   llm,
  //   tools,
  //   prompt
  // })

  // const agentExecutor = new AgentExecutor({
  //   agent,
  //   tools
  // })

  // const logStream = await agentExecutor.streamLog({
  //   input: currentMessageContent,
  //   chat_history: previousMessages
  // })

  // const textEncoder = new TextEncoder()
  // const transformStream = new ReadableStream({
  //   async start(controller) {
  //     for await (const chunk of logStream) {
  //       console.log(chunk)
  //       if (chunk.ops?.length > 0 && chunk.ops[0].op === 'add') {
  //         const addOp = chunk.ops[0]
  //         if (
  //           addOp.path.startsWith('/logs/ChatOpenAI') &&
  //           typeof addOp.value === 'string' &&
  //           addOp.value.length
  //         ) {
  //           controller.enqueue(textEncoder.encode(addOp.value))
  //         }
  //       }
  //     }
  //     controller.close()
  //   }
  // })

  // return new StreamingTextResponse(transformStream)
}
