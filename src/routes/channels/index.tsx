import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { ChannelTable } from '@/components/channels/ChannelTable'
import { ChannelForm } from '@/components/channels/ChannelForm'
import { DeleteChannelDialog } from '@/components/channels/DeleteChannelDialog'
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel
} from '@/lib/channel/api'
import type {
  Channel,
  CreateChannelDto,
  UpdateChannelDto
} from '@/lib/channel/types'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/channels/')({
  component: ChannelsPage,
  server: {
    middleware: [authMiddleware]
  }
})

function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Sheet states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load channels
  useEffect(() => {
    loadChannels()
  }, [])

  async function loadChannels() {
    try {
      setIsLoading(true)
      setError('')
      const data = await getChannels()
      setChannels(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载渠道列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  // Create/Update handlers
  async function handleSubmit(data: CreateChannelDto | UpdateChannelDto) {
    if (editingChannel) {
      const updated = await updateChannel(editingChannel.id, data)
      setChannels(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    } else {
      const created = await createChannel(data as CreateChannelDto)
      setChannels(prev => [...prev, created])
    }
    setIsFormOpen(false)
    setEditingChannel(null)
  }

  // Toggle status
  async function handleToggleStatus(channel: Channel) {
    try {
      const newStatus = channel.status === 'active' ? 'inactive' : 'active'
      const updated = await updateChannel(channel.id, { status: newStatus })
      setChannels(prev => prev.map(c => (c.id === updated.id ? updated : c)))
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换状态失败')
    }
  }

  // Delete handler
  async function handleDeleteConfirm() {
    if (!deletingChannel) return

    try {
      setIsDeleting(true)
      await deleteChannel(deletingChannel.id)
      setChannels(prev => prev.filter(c => c.id !== deletingChannel.id))
      setIsDeleteDialogOpen(false)
      setDeletingChannel(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除渠道失败')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-6 px-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">渠道管理</h1>
          <p className="text-muted-foreground mt-1">管理您的通知渠道</p>
        </div>
        <Button
          onClick={() => {
            setEditingChannel(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          添加渠道
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : (
        <ChannelTable
          channels={channels}
          onEdit={channel => {
            setEditingChannel(channel)
            setIsFormOpen(true)
          }}
          onDelete={channel => {
            setDeletingChannel(channel)
            setIsDeleteDialogOpen(true)
          }}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Add/Edit Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{editingChannel ? '编辑渠道' : '添加渠道'}</SheetTitle>
            <SheetDescription>
              {editingChannel ? '修改渠道配置信息' : '填写新渠道的配置信息'}
            </SheetDescription>
          </SheetHeader>
          <ChannelForm
            channel={editingChannel || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingChannel(null)
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteChannelDialog
        channel={deletingChannel}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
