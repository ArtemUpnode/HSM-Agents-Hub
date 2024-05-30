export interface Message {
  content: string
  role: string
  function_call?: string
}

export interface ChatBody {
  messages: Message[]
  id: string
  locale: string
}
