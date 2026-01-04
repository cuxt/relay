import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check } from 'lucide-react'
import type { EndpointWithChannel } from '@/lib/endpoint/types'

interface ApiExampleDialogProps {
  endpoint: EndpointWithChannel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiExampleDialog({
  endpoint,
  open,
  onOpenChange
}: ApiExampleDialogProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedType(type)
      setTimeout(() => setCopiedType(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!endpoint) return null

  const pushUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/push/${endpoint.id}`
      : `/api/push/${endpoint.id}`

  const curlExample = `curl -X POST "${pushUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "message": "示例消息内容"
    }
  }'`

  const fetchExample = `fetch("${pushUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    data: {
      message: "示例消息内容"
    }
  })
})
  .then(response => response.json())
  .then(data => console.log("成功:", data))
  .catch(error => console.error("错误:", error));`

  const axiosExample = `import axios from 'axios';

axios.post("${pushUrl}", {
  data: {
    message: "示例消息内容"
  }
})
  .then(response => console.log("成功:", response.data))
  .catch(error => console.error("错误:", error));`

  const pythonExample = `import requests
import json

url = "${pushUrl}"
headers = {"Content-Type": "application/json"}
data = {
    "data": {
        "message": "示例消息内容"
    }
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>API 调用示例</DialogTitle>
          <DialogDescription>
            端点：{endpoint.name} | 消息模板：
            {(endpoint.config as any)?.content}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="fetch">Fetch</TabsTrigger>
            <TabsTrigger value="axios">Axios</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
          </TabsList>

          <TabsContent value="curl" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                <code>{curlExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(curlExample, 'curl')}
              >
                {copiedType === 'curl' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>说明：</strong>使用cURL命令行工具发送POST请求
              </p>
              <p>
                请求体中的数据会根据端点配置的模板进行替换。例如模板
                <code className="mx-1 px-1 py-0.5 bg-muted rounded">
                  $&#123;body.response.data.message&#125;
                </code>
                会被替换为 "示例消息内容"
              </p>
            </div>
          </TabsContent>

          <TabsContent value="fetch" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                <code>{fetchExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(fetchExample, 'fetch')}
              >
                {copiedType === 'fetch' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>说明：</strong>使用浏览器原生Fetch
                API发送请求（现代浏览器和Node.js 18+支持）
              </p>
            </div>
          </TabsContent>

          <TabsContent value="axios" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                <code>{axiosExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(axiosExample, 'axios')}
              >
                {copiedType === 'axios' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>说明：</strong>使用Axios库发送请求（需要先安装：
                <code className="mx-1 px-1 py-0.5 bg-muted rounded">
                  npm install axios
                </code>
                ）
              </p>
            </div>
          </TabsContent>

          <TabsContent value="python" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                <code>{pythonExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(pythonExample, 'python')}
              >
                {copiedType === 'python' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>说明：</strong>使用Python
                requests库发送请求（需要先安装：
                <code className="mx-1 px-1 py-0.5 bg-muted rounded">
                  pip install requests
                </code>
                ）
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm space-y-2">
          <p className="font-medium">💡 提示：</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              推送URL：
              <code className="mx-1 px-1 py-0.5 bg-muted rounded">
                {pushUrl}
              </code>
            </li>
            <li>请求方法：POST</li>
            <li>Content-Type：application/json</li>
            <li>
              消息模板：
              <code className="mx-1 px-1 py-0.5 bg-muted rounded">
                {(endpoint.config as any)?.content}
              </code>
            </li>
            <li>根据实际需求调整请求体数据以匹配模板占位符</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
