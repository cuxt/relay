import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Copy, Check, Send, Code } from 'lucide-react'
import type { EndpointWithChannel } from '@/lib/endpoint/types'

interface EndpointTableProps {
  endpoints: EndpointWithChannel[]
  onEdit: (endpoint: EndpointWithChannel) => void
  onDelete: (endpoint: EndpointWithChannel) => void
  onToggleStatus: (endpoint: EndpointWithChannel) => void
  onTest: (endpoint: EndpointWithChannel) => void
  onShowExample: (endpoint: EndpointWithChannel) => void
}

export function EndpointTable({
  endpoints,
  onEdit,
  onDelete,
  onToggleStatus,
  onTest,
  onShowExample
}: EndpointTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getPushUrl = (endpointId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/push/${endpointId}`
    }
    return `/api/push/${endpointId}`
  }

  const columns = useMemo<ColumnDef<EndpointWithChannel>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '端点名称',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        )
      },
      {
        id: 'pushUrl',
        header: '推送地址',
        size: 300,
        cell: ({ row }) => {
          const endpoint = row.original
          const url = getPushUrl(endpoint.id)
          const isCopied = copiedId === endpoint.id

          return (
            <div className="flex items-center gap-2 w-70">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                {url}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => copyToClipboard(url, endpoint.id)}
              >
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )
        }
      },
      {
        accessorKey: 'channel',
        header: '关联渠道',
        cell: ({ row }) => {
          const channel = row.original.channel
          return (
            <div className="flex items-center gap-2">
              <span>{channel.name}</span>
              <Badge variant="outline" className="capitalize">
                {channel.type}
              </Badge>
            </div>
          )
        }
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => {
          const endpoint = row.original
          return (
            <Switch
              checked={endpoint.status === 'active'}
              onCheckedChange={() => onToggleStatus(endpoint)}
            />
          )
        }
      },
      {
        accessorKey: 'createdAt',
        header: '创建时间',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'))
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          )
        }
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const endpoint = row.original
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onShowExample(endpoint)}
                title="查看示例"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onTest(endpoint)}
                title="测试推送"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(endpoint)}
                title="编辑"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(endpoint)}
                title="删除"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )
        }
      }
    ],
    [onEdit, onDelete, onToggleStatus, onTest, onShowExample, copiedId]
  )

  const table = useReactTable({
    data: endpoints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b bg-muted/50">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                暂无端点
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
