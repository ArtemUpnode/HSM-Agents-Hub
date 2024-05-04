'use client'
import { UseChatHelpers } from 'ai/react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getRandomGradient } from '@/lib/utils'

export interface Agent {
  id: string
  name: string
  description: string
  prompt: string
  bg: string
  pinned: boolean
  dark: boolean
  useYubihsm: boolean
}

type Agents = {
  [key: string]: Agent
}

export function getAgentsFromStorage() {
  const storedAgents = localStorage.getItem('Agents')

  if (storedAgents) {
    return storedAgents.replace(/\n/g, '\\n')
  } else {
    return null
  }
}

export const defaultAgents = `{"#777777":{"id":"#777777","name":"YubiHSM","description":"Get, View and Sign with YubiHSM device","prompt":"","bg":"linear-gradient(254deg, hsl(43, 56%, 60%), hsl(95, 9%, 60%), hsl(264, 47%, 60%))","dark":true,"pinned":true,"useYubihsm":true}}`

export interface AgentsProps extends Partial<Pick<UseChatHelpers, 'setInput'>> {
  showPinnedOnly: boolean
}

export default function Agents({ setInput, showPinnedOnly }: AgentsProps) {
  const router = useRouter()

  const [agents, setAgents] = useState(() => {
    const storedAgents = getAgentsFromStorage()

    if (storedAgents) {
      return JSON.parse(storedAgents)
    }

    localStorage.setItem('Agents', defaultAgents)
    return JSON.parse(defaultAgents.replace(/\n/g, '\\n'))
  })

  function saveAgents(passAgents: any) {
    localStorage.setItem('Agents', JSON.stringify(passAgents))
    router.refresh()
  }

  const handlePinned = (AgentId: string) => {
    const updatedAgents = {
      ...agents,
      [AgentId]: { ...agents[AgentId], pinned: !agents[AgentId].pinned }
    }
    setAgents(updatedAgents)
    saveAgents(updatedAgents)
  }

  const toggleDark = (AgentId: string) => {
    const updatedAgents = {
      ...agents,
      [AgentId]: {
        ...agents[AgentId],
        bg: agents[AgentId].dark
          ? agents[AgentId].bg.replace(/60%\)/g, '96%)')
          : agents[AgentId].bg.replace(/96%\)/g, '60%)'),
        dark: !agents[AgentId].dark
      }
    }
    setAgents(updatedAgents)
    saveAgents(updatedAgents)
  }

  const changeAgentBg = (AgentId: string) => {
    const updatedAgents = {
      ...agents,
      [AgentId]: {
        ...agents[AgentId],
        bg: getRandomGradient(agents[AgentId].dark)
      }
    }
    setAgents(updatedAgents)
    saveAgents(updatedAgents)
  }

  return (
    <>
      <div className="flex flex-wrap gap-4 mx-4 mt-6 justify-center">
        {Object.entries(agents as Agents)
          .filter(
            ([_key, agent]: [string, Agent]) => !showPinnedOnly || agent.pinned
          )
          .map(([key, agent]: [string, Agent]) => (
            <Card
              id={`agent-${key}`}
              key={key}
              className={
                agent.dark
                  ? 'w-[300px] h-[210px] flex-shrink-0 text-white z-99'
                  : 'w-[300px] h-[210px] flex-shrink-0 text-black z-99'
              }
              style={{ background: agent.bg }}
            >
              <CardHeader>
                <CardTitle>{agent.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[93px] overflow-hidden">
                {agent.description}
              </CardContent>
              <CardFooter className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeAgentBg(key)}
                >
                  🎨
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleDark(key)}
                >
                  {agent.dark ? '☀️' : '🌙'}
                </Button>
                {setInput ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setInput(`@${agent.name} `)}
                  >
                    @
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePinned(key)}
                >
                  {agent.pinned ? '★' : '☆'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        {!showPinnedOnly && (
          <Card className="w-[300px] h-[210px] flex-shrink-0 z-99 flex justify-center items-center">
            More Coming Soon...
          </Card>
        )}
      </div>
      <div className="mx-auto px-4 text-center mt-6">
        <p className="leading-normal text-muted-foreground">
          {!showPinnedOnly
            ? 'Star an agent to appear on the chat page'
            : 'Select an agent and start a chat'}
        </p>
      </div>
    </>
  )
}
