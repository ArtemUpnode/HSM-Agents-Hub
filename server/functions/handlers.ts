import type { FunctionCall } from '@langchain/core/messages'
import type { FunctionArgs, CalledFunction } from './types'
import { getUserDevices, getUserKeys, signUserMessage } from './api'
import { functions } from './registry'

function parseFunctionCall(functionCall: FunctionCall): CalledFunction {
  return {
    name: functionCall.name,
    args: JSON.parse(functionCall.arguments)
  }
}

function validateArgs(requiredArgs: string[], args: FunctionArgs) {
  const missingArgs = requiredArgs.filter(rArg => !args[rArg])

  if (missingArgs.length > 0) {
    throw new Error(`Missing required arguments: ${missingArgs.join(', ')}`)
  }
}

const functionHandlers: { [key: string]: (args: FunctionArgs) => any } = {
  get_user_devices: args => getUserDevices(args),
  get_user_keys: args => getUserKeys(args),
  sign_user_message: args => signUserMessage(args)
}

export async function handleFunctionCall(functionCall: FunctionCall) {
  const { name, args } = parseFunctionCall(functionCall)

  const availableFunction = functions.find(fn => fn.name === name)
  if (!availableFunction) {
    throw new Error(`Function ${name} is not available`)
  }

  if (Array.isArray(availableFunction.parameters.required)) {
    validateArgs(availableFunction.parameters.required, args)
  } else {
    throw new Error(`Invalid required parameters for function ${name}`)
  }

  try {
    const result = await functionHandlers[name](args)
    return { result, name }
  } catch (error) {
    throw new Error(
      `Error calling function ${name}: ${error instanceof Error ? error.message : error}`
    )
  }
}
