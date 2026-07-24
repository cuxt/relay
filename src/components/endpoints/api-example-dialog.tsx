import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CopyButton } from '@/components/shared/copy-button'
import { getChannelMeta, type ChannelType } from '@/lib/channels/registry'

interface ApiExampleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint: {
    token: string
    name: string
    channels: Array<{ id: string; name: string; type: ChannelType }>
  } | null
}

export function ApiExampleDialog({ open, onOpenChange, endpoint }: ApiExampleDialogProps) {
  if (!endpoint) return null

  const pushUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/push/${endpoint.token}`
  const requestBody = JSON.stringify(
    {
      payload: { content: 'Hello from Relay!' },
      params: Object.fromEntries(
        endpoint.channels.map((channel) => [
          channel.id,
          getChannelMeta(channel.type).requestExample,
        ])
      ),
    },
    null,
    2
  )

  const curlExample = `curl -X POST "${pushUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${requestBody}'`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>API 示例 - {endpoint.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">推送地址</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <code className="text-xs font-mono flex-1 truncate">{pushUrl}</code>
              <CopyButton value={pushUrl} />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">cURL</p>
            <div className="relative">
              <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-x-auto">
                {curlExample}
              </pre>
              <CopyButton value={curlExample} className="absolute top-2 right-2" />
            </div>
          </div>

          <div className="rounded-md bg-muted/50 border p-3">
            <p className="text-xs text-muted-foreground">
              <strong>提示：</strong>
              `payload` 用于消息模板中的 {'${payload.field}'}；`params` 以渠道 ID
              为键，分别覆盖每个渠道的默认发送参数。
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
