import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { EndpointWithChannel } from '@/lib/endpoint/types'

interface TestPushDialogProps {
  endpoint: EndpointWithChannel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TestPushDialog({
  endpoint,
  open,
  onOpenChange
}: TestPushDialogProps) {
  const [testData, setTestData] = useState(
    JSON.stringify(
      {
        data: {
          message: '这是测试消息'
        }
      },
      null,
      2
    )
  )
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleTest = async () => {
    if (!endpoint) return

    setIsLoading(true)
    setResult(null)

    try {
      // 验证JSON格式
      let body: any
      try {
        body = JSON.parse(testData)
      } catch {
        setResult({
          success: false,
          message: 'JSON格式无效，请检查输入'
        })
        setIsLoading(false)
        return
      }

      // 发送测试推送
      const response = await fetch(`/api/push/${endpoint.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || '推送成功！'
        })
      } else {
        setResult({
          success: false,
          message: data.error || '推送失败'
        })
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : '网络错误'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>测试推送</DialogTitle>
          <DialogDescription>
            发送测试数据到端点：{endpoint?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testData">测试数据（JSON格式）</Label>
            <Textarea
              id="testData"
              value={testData}
              onChange={e => setTestData(e.target.value)}
              placeholder='{"key": "value"}'
              rows={12}
              className="font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              请输入要发送的JSON数据，将用于替换消息模板中的占位符
            </p>
          </div>

          {result && (
            <div
              className={`p-3 rounded-md text-sm ${
                result.success
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {result.success ? '✓ ' : '✗ '}
              {result.message}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            关闭
          </Button>
          <Button onClick={handleTest} disabled={isLoading}>
            {isLoading ? '发送中...' : '发送测试'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
