import { useState, useMemo } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { extractBodyPaths } from '@/lib/push/template'
import { getChannelMeta, type ChannelType } from '@/lib/channels/registry'

interface TestPushDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint: {
    token: string
    name: string
    messageTemplate?: string | null
    channels: Array<{ id: string; name: string; type: ChannelType }>
  } | null
}

/**
 * 从消息模板中提取字段路径，生成示例请求体
 */
function generateExampleBody(template?: string | null): string {
  if (!template) {
    return JSON.stringify({ content: 'Hello from Relay!' }, null, 2)
  }

  const paths = extractBodyPaths(template)

  if (paths.length === 0) {
    return JSON.stringify({ content: 'Hello from Relay!' }, null, 2)
  }

  // 支持嵌套路径，如 data.title → { data: { title: "..." } }
  const result: Record<string, unknown> = {}
  for (const path of paths) {
    const keys = path.split('.')
    let current: Record<string, unknown> = result
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {}
      }
      current = current[keys[i]] as Record<string, unknown>
    }
    current[keys[keys.length - 1]] = `测试${path}`
  }

  return JSON.stringify(result, null, 2)
}

export function TestPushDialog({ open, onOpenChange, endpoint }: TestPushDialogProps) {
  const exampleBody = useMemo(() => {
    const payload = JSON.parse(generateExampleBody(endpoint?.messageTemplate))
    const params = Object.fromEntries(
      endpoint?.channels.map((channel) => [
        channel.id,
        getChannelMeta(channel.type).requestExample,
      ]) ?? []
    )
    return JSON.stringify({ payload, params }, null, 2)
  }, [endpoint?.channels, endpoint?.messageTemplate])

  const [body, setBody] = useState(exampleBody)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // endpoint 变化时重置 body
  const [prevToken, setPrevToken] = useState<string | null>(null)
  if (endpoint?.token && endpoint.token !== prevToken) {
    setPrevToken(endpoint.token)
    setBody(exampleBody)
    setResult(null)
  }

  const handleTest = async () => {
    if (!endpoint) return

    try {
      JSON.parse(body)
    } catch {
      setResult({ success: false, message: 'JSON 格式不正确' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`/api/push/${endpoint.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const json = await res.json()

      if (res.ok) {
        setResult({ success: json.success, message: json.message })
      } else {
        setResult({
          success: false,
          message: json.error || '推送失败',
        })
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || '请求失败' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>测试推送 - {endpoint?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          {endpoint?.messageTemplate && (
            <div className="rounded-md bg-muted/50 border px-3 py-2 overflow-hidden">
              <p className="text-xs text-muted-foreground mb-1">消息模板</p>
              <pre className="text-xs font-mono break-all whitespace-pre-wrap max-h-32 overflow-y-auto">
                {endpoint.messageTemplate}
              </pre>
            </div>
          )}

          <div className="space-y-2">
            <Label>请求体（payload + params）</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="font-mono text-sm max-h-52"
              disabled={loading}
            />
          </div>

          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                result.success
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              {result.message}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button onClick={handleTest} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            发送测试
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
