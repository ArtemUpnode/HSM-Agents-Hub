'use client'
import { nanoid } from '../lib/utils'
import { useChat, type Message } from 'ai/react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { Button } from '@/components/ui/button'
// import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Agents from '@/components/agents'
import { defaultAgents, AgentsType } from '@/components/agents'
// import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconSpinner } from '@/components/ui/icons'
import { PromptForm } from '@/components/prompt-form'
import { getAgentsFromStorage } from '@/components/agents'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'

export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
}

export function Chat({ id, className }: ChatProps) {
  const router = useRouter()
  const [showPinnedOnly, _setShowPinnedOnly] = useState(true)
  const timestamp = `${new Date().toISOString().split('.')[0]}`
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(
    undefined
  )
  const [agents, setAgents] = useState(
    JSON.parse(defaultAgents.replace(/\n/g, '\\n')) as AgentsType
  )

  function refreshAgents() {
    const storedAgents = getAgentsFromStorage()

    if (storedAgents) {
      setAgents(JSON.parse(storedAgents) as AgentsType)
    }
  }

  useEffect(() => {
    refreshAgents()
    setInitialMessages([])

    if (id) {
      const storedData = localStorage.getItem(id)

      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setInitialMessages(parsedData)
      }
    } else {
      id = `cid_${timestamp}`
    }
  }, [id])

  const { messages, isLoading, input, setInput, append } = useChat({
    api: process.env.NEXT_PUBLIC_API_URL + '/api/chat',
    initialMessages,
    id,
    body: {
      id,
      locale: navigator.language
    },
    async onResponse(response) {
      if (response.status !== 200) {
        const json = await response.json()
        toast.error(`${response.status} ${json.error}`)
      }
    },
    streamMode: 'text',
    onFinish(response) {
      const msg = messages ?? initialMessages
      msg.push({
        id: nanoid(),
        role: 'assistant',
        content: response.content
      })
      localStorage.setItem(id || `cid_${timestamp}`, JSON.stringify(msg))
      router.replace(`/?cid=${id}`)
      router.refresh()
    }
  })

  async function sendMessage(value: string) {
    refreshAgents()
    let function_call: string | undefined

    if (agents) {
      const found = value.split(' ')[0]

      if (found.charAt(0) === '@') {
        const agentName = found.slice(1)
        const agent = Object.values(agents).find(
          agent => agent.name === agentName
        )

        if (agent) {
          function_call = agent.useYubihsm ? 'yubihsm' : undefined
        }
      }

      const userMessage: Message = {
        id: nanoid(),
        content: value,
        role: 'user',
        function_call
      }
      append(userMessage)
      messages.push(userMessage)
    }
  }

  const { messagesRef, scrollRef, visibilityRef } =
    useScrollAnchor()

  return (
    <div ref={scrollRef}>
      <div className={cn('pb-[200px] md:pt-2', className)} ref={messagesRef}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
          </>
        ) : (
          <>
            <Agents setInput={setInput} showPinnedOnly={showPinnedOnly} />
          </>
        )}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
        {/* <ButtonScrollToBottom /> */}
        <div className="mx-auto sm:max-w-3xl sm:px-4">
          <div className="flex items-center justify-center h-12">
            {isLoading && (
              <Button variant="outline" className="bg-background" disabled>
                <IconSpinner className="mr-2" />
                Generating ...
              </Button>
            )}
          </div>
          <div className="px-4 py-2 space-y-2 shadow-lg bg-background sm:rounded-t-xl">
            <PromptForm
              onSubmit={sendMessage}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              agents={agents}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
