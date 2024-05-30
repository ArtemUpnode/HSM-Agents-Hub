import type { FunctionDefinition } from '@langchain/core/language_models/base'

export const functions: FunctionDefinition[] = [
  {
    name: 'get_user_devices',
    description: 'Get connected YubiHSM user devices to PC',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_user_keys',
    description: 'Get keys in YubiHSM user device',
    parameters: {
      type: 'object',
      properties: {
        device_serial_id: {
          type: 'string',
          description: 'YubiHSM device serial id'
        },
        auth_key_id: {
          type: 'number',
          description: 'YubiHSM auth key id'
        },
        password: {
          type: 'string',
          description: 'YubiHSM auth key password'
        }
      },
      required: ['device_serial_id', 'auth_key_id', 'password']
    }
  },
  {
    name: 'sign_user_message',
    description:
      'Sign a user message with a specific key in YubiHSM user device',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message for signing'
        },
        device_serial_id: {
          type: 'string',
          description: 'YubiHSM device serial id'
        },
        auth_key_id: {
          type: 'number',
          description: 'YubiHSM auth key id'
        },
        password: {
          type: 'string',
          description: 'YubiHSM auth key password'
        },
        signing_key_id: {
          type: 'number',
          description: 'Id of key that signs the message'
        }
      },
      required: [
        'message',
        'device_serial_id',
        'auth_key_id',
        'password',
        'signing_key_id'
      ]
    }
  }
]
