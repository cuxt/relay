import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2 } from 'lucide-react'
import type { Channel } from '@/lib/channel/types'

interface ChannelTableProps {
  channels: Channel[]
  onEdit: (channel: Channel) => void
  onDelete: (channel: Channel) => void
  onToggleStatus: (channel: Channel) => void
}

export function ChannelTable({
  channels,
  onEdit,
  onDelete,
  onToggleStatus
}: ChannelTableProps) {
  const columns = useMemo<ColumnDef<Channel>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '名称',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        )
      },
      {
        accessorKey: 'type',
        header: '类型',
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue('type')}</div>
        )
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) => {
          const channel = row.original
          return (
            <Switch
              checked={channel.status === 'active'}
              onCheckedChange={() => onToggleStatus(channel)}
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
          const channel = row.original
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(channel)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(channel)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )
        }
      }
    ],
    [onEdit, onDelete, onToggleStatus]
  )

  const table = useReactTable({
    data: channels,
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
                暂无渠道
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
