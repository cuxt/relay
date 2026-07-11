import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { ChannelFieldsProps } from './channel-field'

export function WebhookFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  const urlId = useId()
  const headersId = useId()
  const method = (config.method as string) || 'POST'
  const headersValue = config.headers
  const headersText =
    typeof headersValue === 'object' && headersValue !== null
      ? JSON.stringify(headersValue)
      : (headersValue as string) || ''

  function handleHeadersChange(raw: string) {
    if (!raw) {
      onChange('config.headers', undefined)
      return
    }
    try {
      onChange('config.headers', JSON.parse(raw))
    } catch {
      // 暂存为字符串，提交时由 zod 校验拦截（headers 期望 Record<string,string>）
      onChange('config.headers', raw)
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={urlId}>
          URL
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id={urlId}
          placeholder="https://..."
          value={(config.webhook as string) || ''}
          onChange={e => onChange('config.webhook', e.target.value)}
          disabled={disabled}
          aria-invalid={!!errors['config.webhook']}
        />
        <p className="text-[0.8rem] text-muted-foreground">目标服务的 URL 地址</p>
        {errors['config.webhook'] && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {errors['config.webhook']}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>请求方法</Label>
        <Select
          value={method}
          onValueChange={v => onChange('config.method', v ?? 'POST')}
          disabled={disabled}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="POST" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[0.8rem] text-muted-foreground">默认 POST，支持 GET/POST</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={headersId}>自定义 Headers</Label>
        <Input
          id={headersId}
          placeholder='{"Authorization": "Bearer ..."}'
          value={headersText}
          onChange={e => handleHeadersChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-[0.8rem] text-muted-foreground">自定义请求头（JSON 格式）</p>
        {errors['config.headers'] && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {errors['config.headers']}
          </p>
        )}
      </div>
    </>
  )
}
