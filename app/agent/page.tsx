'use client'
import Agents from '@/components/agents'
import { useState } from 'react'

export default function AgentsPage() {
  const [showPinnedOnly, _setShowPinnedOnly] = useState(false)
  return <Agents showPinnedOnly={showPinnedOnly} />
}
