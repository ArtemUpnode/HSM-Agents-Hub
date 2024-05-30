import type { FunctionArgs, YubiKey } from './types'

const apiUrl = 'http://localhost:3000'

export async function getUserDevices(args: FunctionArgs) {
  const url = `${apiUrl}/get_user_devices`

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP error! message: ${errorText}`)
  }

  const data = (await response.json()) as String[]

  return data
}

export async function getUserKeys(args: FunctionArgs) {
  const url = `${apiUrl}/get_user_keys`

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP error! message: ${errorText}`)
  }

  const data = (await response.json()) as YubiKey[]

  return data
}

export async function signUserMessage(args: FunctionArgs) {
  const url = `${apiUrl}/sign_user_message`

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP error! message: ${errorText}`)
  }

  const data = (await response.json()) as String

  return data
}
