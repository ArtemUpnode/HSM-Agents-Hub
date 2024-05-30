export interface FunctionArgs {
  [key: string]: any
}

export interface CalledFunction {
  name: string
  args: FunctionArgs
}

export interface YubiKey {
  keyId: number
  address: string
}
