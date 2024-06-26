'use client'
import { IconSpinner, IconTrash } from '@/components/ui/icons'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'react-hot-toast'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface SidebarActionsProps {
  chatId: string
}

export function SidebarActions({ chatId }: SidebarActionsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()

  return (
    <>
      <div className="space-x-1">
        <Button
          variant="ghost"
          className="size-6 p-0 hover:bg-background"
          disabled={isRemovePending}
          onClick={() => setDeleteDialogOpen(true)}
        >
          <IconTrash />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat with all messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={event => {
                event.preventDefault()
                // @ts-ignore
                startRemoveTransition(async () => {
                  localStorage.removeItem(chatId)
                  setDeleteDialogOpen(false)
                  router.replace('/')
                  router.refresh()
                  toast.success('Chat deleted')
                })
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
