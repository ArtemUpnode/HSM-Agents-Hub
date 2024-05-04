'use client'

import * as React from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-14 p-3 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <SidebarToggle />
        <SidebarMobile>
          <ChatHistory userId="777" />
        </SidebarMobile>
        <div className="hidden md:block sm:hidden">
          <Link target="_blank" href={'/'} className="mx-2 title font-bold">
            HSM Agents Hub
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Tabs defaultValue="account" className="w-[140px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">
              <Link href="/">Chat</Link>
            </TabsTrigger>
            <TabsTrigger value="agent">
              <Link href="/agent">Agents</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <ThemeToggle />
      </div>
    </header>
  )
}
