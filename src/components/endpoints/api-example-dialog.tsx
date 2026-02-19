import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { CopyButton } from '@/components/shared/copy-button'

interface ApiExampleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint: { token: string; name: string } | null
}

export function ApiExampleDialog({
  open,
  onOpenChange,
  endpoint
}: ApiExampleDialogProps) {
  if (!endpoint) return null

  const pushUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/push/${endpoint.token}`

  const curlExample = `curl -X POST "${pushUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Hello from Relay!"}'`

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
              <code className="text-xs font-mono flex-1 truncate">
                {pushUrl}
              </code>
              <CopyButton value={pushUrl} />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">cURL</p>
            <div className="relative">
              <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-x-auto">
                {curlExample}
              </pre>
              <CopyButton
                value={curlExample}
                className="absolute top-2 right-2"
              />
            </div>
          </div>

          <div className="rounded-md bg-muted/50 border p-3">
            <p className="text-xs text-muted-foreground">
              <strong>提示：</strong>
              支持 POST 和 GET 请求。消息模板中的 {'${body.field}'}{' '}
              会替换为请求体中的对应字段。
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
