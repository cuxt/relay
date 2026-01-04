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
import { EndpointTable } from '@/components/endpoints/EndpointTable'
import { EndpointForm } from '@/components/endpoints/EndpointForm'
import { DeleteEndpointDialog } from '@/components/endpoints/DeleteEndpointDialog'
import { TestPushDialog } from '@/components/endpoints/TestPushDialog'
import { ApiExampleDialog } from '@/components/endpoints/ApiExampleDialog'
import {
  getEndpoints,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint
} from '@/lib/endpoint/api'
import type {
  EndpointWithChannel,
  CreateEndpointDto,
  UpdateEndpointDto
} from '@/lib/endpoint/types'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/endpoints/')({
  component: EndpointsPage,
  server: {
    middleware: [authMiddleware]
  }
})

function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<EndpointWithChannel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Sheet states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEndpoint, setEditingEndpoint] =
    useState<EndpointWithChannel | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingEndpoint, setDeletingEndpoint] =
    useState<EndpointWithChannel | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Test dialog states
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testingEndpoint, setTestingEndpoint] =
    useState<EndpointWithChannel | null>(null)

  // Example dialog states
  const [isExampleDialogOpen, setIsExampleDialogOpen] = useState(false)
  const [exampleEndpoint, setExampleEndpoint] =
    useState<EndpointWithChannel | null>(null)

  // Load endpoints
  useEffect(() => {
    loadEndpoints()
  }, [])

  async function loadEndpoints() {
    try {
      setIsLoading(true)
      setError('')
      const data = await getEndpoints()
      setEndpoints(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载端点列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  // Create/Update handlers
  async function handleSubmit(data: CreateEndpointDto | UpdateEndpointDto) {
    if (editingEndpoint) {
      await updateEndpoint(editingEndpoint.id, data)
      // 重新加载列表以获取最新的channel信息
      await loadEndpoints()
    } else {
      await createEndpoint(data as CreateEndpointDto)
      // 重新加载列表
      await loadEndpoints()
    }
    setIsFormOpen(false)
    setEditingEndpoint(null)
  }

  // Toggle status
  async function handleToggleStatus(endpoint: EndpointWithChannel) {
    try {
      const newStatus = endpoint.status === 'active' ? 'inactive' : 'active'
      await updateEndpoint(endpoint.id, { status: newStatus })
      await loadEndpoints()
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换状态失败')
    }
  }

  // Delete handler
  async function handleDeleteConfirm() {
    if (!deletingEndpoint) return

    try {
      setIsDeleting(true)
      await deleteEndpoint(deletingEndpoint.id)
      setEndpoints(prev => prev.filter(e => e.id !== deletingEndpoint.id))
      setIsDeleteDialogOpen(false)
      setDeletingEndpoint(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除端点失败')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-6 px-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">端点管理</h1>
          <p className="text-muted-foreground mt-1">管理您的API端点</p>
        </div>
        <Button
          onClick={() => {
            setEditingEndpoint(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          添加端点
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
        <EndpointTable
          endpoints={endpoints}
          onEdit={endpoint => {
            setEditingEndpoint(endpoint)
            setIsFormOpen(true)
          }}
          onDelete={endpoint => {
            setDeletingEndpoint(endpoint)
            setIsDeleteDialogOpen(true)
          }}
          onToggleStatus={handleToggleStatus}
          onTest={endpoint => {
            setTestingEndpoint(endpoint)
            setIsTestDialogOpen(true)
          }}
          onShowExample={endpoint => {
            setExampleEndpoint(endpoint)
            setIsExampleDialogOpen(true)
          }}
        />
      )}

      {/* Add/Edit Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{editingEndpoint ? '编辑端点' : '添加端点'}</SheetTitle>
            <SheetDescription>
              {editingEndpoint ? '修改端点配置信息' : '填写新端点的配置信息'}
            </SheetDescription>
          </SheetHeader>
          <EndpointForm
            endpoint={editingEndpoint || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingEndpoint(null)
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteEndpointDialog
        endpoint={deletingEndpoint}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      {/* Test Push Dialog */}
      <TestPushDialog
        endpoint={testingEndpoint}
        open={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
      />

      {/* API Example Dialog */}
      <ApiExampleDialog
        endpoint={exampleEndpoint}
        open={isExampleDialogOpen}
        onOpenChange={setIsExampleDialogOpen}
      />
    </div>
  )
}
