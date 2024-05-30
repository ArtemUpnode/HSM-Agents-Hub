import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import rehypeExternalLinks from 'rehype-external-links'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { useEffect, useState } from 'react'

export interface ChatMessageProps {
  message: Message
}

type FunctionName =
  | 'get_user_devices'
  | 'get_user_keys'
  | 'sign_user_message'
  | undefined

interface Device {
  serialId: string
  productName: string
}

interface Key {
  keyId: number
  address: string
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const rowsPerPage = 5
  const [functionName, setFunctionName] = useState<FunctionName>()
  const [devices, setDevices] = useState<Device[]>([])
  const [keys, setKeys] = useState<Key[]>([])
  const [signature, setSignature] = useState<string>('')
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(rowsPerPage)

  const parseFnMessage = async () => {
    try {
      const json = JSON.parse(message.content)

      switch (json.functionName) {
        case 'get_user_devices':
          setFunctionName('get_user_devices')
          setDevices(json.output as Device[])
          break
        case 'get_user_keys':
          setFunctionName('get_user_keys')
          setKeys(json.output as Key[])
          break
        case 'sign_user_message':
          setFunctionName('sign_user_message')
          setSignature(json.output as string)
          break
        default:
          setFunctionName(undefined)
          break
      }
    } catch (error) {
      // console.log('Not JSON (parseFnMessage): ', error)
    }
  }
  useEffect(() => {
    parseFnMessage()
  }, [])

  const handlePrevious = () => {
    setStartIndex(Math.max(0, startIndex - rowsPerPage))
    setEndIndex(Math.max(rowsPerPage, endIndex - rowsPerPage))
  }

  const handleNext = () => {
    setStartIndex(Math.min(keys.length - rowsPerPage, startIndex + rowsPerPage))
    setEndIndex(Math.min(keys.length, endIndex + rowsPerPage))
  }

  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        {functionName === 'get_user_keys' ? (
          <>
            <Table>
              <TableCaption>List of your keys.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Address</TableHead>
                  <TableHead className="text-right">Key ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.slice(startIndex, endIndex).map(key => (
                  <TableRow key={key.keyId}>
                    <TableCell className="font-medium">{key.address}</TableCell>
                    <TableCell className="text-right">{key.keyId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={
                      startIndex === 0
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                    onClick={handlePrevious}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    className={
                      endIndex >= keys.length
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                    onClick={handleNext}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        ) : functionName === 'get_user_devices' ? (
          <>
            <Table>
              <TableCaption>List of your devices.</TableCaption>
              <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]">Serial ID</TableHead>
                  <TableHead className="text-right">Product Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.slice(startIndex, endIndex).map(device => (
                  <TableRow key={device.serialId}>
                    <TableCell className="font-medium">
                      {device.serialId}
                    </TableCell>
                    <TableCell className="text-right">
                      {device.productName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={
                      startIndex === 0
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                    onClick={handlePrevious}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    className={
                      endIndex >= devices.length
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                    onClick={handleNext}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        ) : functionName === 'sign_user_message' ? (
          <>
          Signature: <br />
          <CodeBlock language="json" value={signature} />
          </>
        ) : (
          <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>
              },
              code({ children, className, node, ...props }) {
                if (node?.children[0]) {
                  const child = node.children[0]
                  if (child.data == '▍') {
                    return (
                      <span className="mt-1 cursor-default animate-pulse">
                        ▍
                      </span>
                    )
                  }
                }

                const match = /language-(\w+)/.exec(className || '')

                if (node?.properties.inline === true || !match) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ''}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                )
              }
            }}
          >
            {message.content}
          </MemoizedReactMarkdown>
        )}
      </div>
    </div>
  )
}
