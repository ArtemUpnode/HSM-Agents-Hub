import { Chat } from '@/server/chat'

export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json()
  return Chat(json)
}
