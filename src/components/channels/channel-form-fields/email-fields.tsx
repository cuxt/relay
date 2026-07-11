import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { ChannelFieldsProps } from './channel-field'

export function EmailFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  const fromId = useId()
  const toId = useId()
  const apiKeyId = useId()
  const smtpHostId = useId()
  const smtpPortId = useId()
  const smtpUserId = useId()
  const smtpPasswordId = useId()

  const provider = (config.provider as 'smtp' | 'resend') || 'smtp'
  const smtp =
    (config.smtp as {
      host?: string
      port?: number
      secure?: boolean
      user?: string
      password?: string
    }) || {}

  function switchProvider(v: 'smtp' | 'resend') {
    onChange('config.provider', v)
    if (v === 'smtp' && !config.smtp) {
      onChange('config.smtp', { host: '', port: 465, secure: true, user: '', password: '' })
    }
    if (v === 'resend' && !config.resend) {
      onChange('config.resend', { apiKey: '' })
    }
  }

  return (
    <>
      {/* 邮件提供商切换 */}
      <div className="space-y-2">
        <Label>邮件提供商</Label>
        <div className="flex gap-2">
          {(['smtp', 'resend'] as const).map(v => (
            <button
              key={v}
              type="button"
              disabled={disabled}
              onClick={() => switchProvider(v)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                provider === v
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {v === 'smtp' ? 'SMTP' : 'Resend'}
            </button>
          ))}
        </div>
      </div>

      {/* Resend 配置 */}
      {provider === 'resend' ? (
        <div className="space-y-2">
          <Label htmlFor={apiKeyId}>
            API Key
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id={apiKeyId}
            type="password"
            placeholder="re_..."
            value={(config.resend as { apiKey?: string })?.apiKey || ''}
            onChange={e => onChange('config.resend.apiKey', e.target.value)}
            disabled={disabled}
            aria-invalid={!!errors['config.resend.apiKey']}
          />
          <p className="text-[0.8rem] text-muted-foreground">在 resend.com 控制台获取 API Key</p>
          {errors['config.resend.apiKey'] && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors['config.resend.apiKey']}
            </p>
          )}
        </div>
      ) : (
        /* SMTP 配置 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={smtpHostId}>
              SMTP 主机
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={smtpHostId}
              placeholder="smtp.example.com"
              value={smtp.host || ''}
              onChange={e => onChange('config.smtp.host', e.target.value)}
              disabled={disabled}
              aria-invalid={!!errors['config.smtp.host']}
            />
            {errors['config.smtp.host'] && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors['config.smtp.host']}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={smtpPortId}>SMTP 端口</Label>
            <Input
              id={smtpPortId}
              type="number"
              placeholder="465"
              value={smtp.port ?? ''}
              onChange={e =>
                onChange('config.smtp.port', e.target.value ? Number(e.target.value) : undefined)
              }
              disabled={disabled}
              aria-invalid={!!errors['config.smtp.port']}
            />
            {errors['config.smtp.port'] && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors['config.smtp.port']}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={smtpUserId}>
              SMTP 用户名
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={smtpUserId}
              placeholder="user@example.com"
              value={smtp.user || ''}
              onChange={e => onChange('config.smtp.user', e.target.value)}
              disabled={disabled}
              aria-invalid={!!errors['config.smtp.user']}
            />
            {errors['config.smtp.user'] && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors['config.smtp.user']}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={smtpPasswordId}>
              SMTP 密码
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id={smtpPasswordId}
              type="password"
              placeholder="密码"
              value={smtp.password || ''}
              onChange={e => onChange('config.smtp.password', e.target.value)}
              disabled={disabled}
              aria-invalid={!!errors['config.smtp.password']}
            />
            {errors['config.smtp.password'] && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors['config.smtp.password']}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 发件人 / 收件人 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
        <div className="space-y-2">
          <Label htmlFor={fromId}>
            发件人
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id={fromId}
            placeholder="sender@example.com"
            value={(config.from as string) || ''}
            onChange={e => onChange('config.from', e.target.value)}
            disabled={disabled}
            aria-invalid={!!errors['config.from']}
          />
          {errors['config.from'] && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors['config.from']}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={toId}>
            收件人
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id={toId}
            placeholder="多个收件人用逗号分隔"
            value={(config.to as string) || ''}
            onChange={e => onChange('config.to', e.target.value)}
            disabled={disabled}
            aria-invalid={!!errors['config.to']}
          />
          {errors['config.to'] && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {errors['config.to']}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
