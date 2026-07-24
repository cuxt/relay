import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/x/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ROUTES, isSuper, type EmailConfig, type EmailTransport } from '@/constants'

export const Route = createFileRoute('/_user/_admin/email')({
  beforeLoad: ({ context }) => {
    if (!isSuper(context.user.role)) throw redirect({ to: ROUTES.DASHBOARD })
  },
  component: EmailPage,
})

function EmailPage() {
  const { data } = useQuery({
    queryKey: ['admin', 'email-config'],
    queryFn: async () => {
      const res = await fetch('/api/email/config')
      if (!res.ok) throw new Error('读取失败')
      return (await res.json()) as Partial<EmailConfig>
    },
  })

  const [transport, setTransport] = useState<EmailTransport>('smtp')
  const [from, setFrom] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('587')
  const [secure, setSecure] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [testTo, setTestTo] = useState('')

  useEffect(() => {
    if (!data) return
    if (data.transport) setTransport(data.transport)
    if (data.from !== undefined) setFrom(data.from)
    if (data.host !== undefined) setHost(data.host)
    if (data.port !== undefined) setPort(String(data.port))
    if (data.secure !== undefined) setSecure(data.secure)
    if (data.username !== undefined) setUsername(data.username)
    if (data.password !== undefined) setPassword(data.password)
    if (data.apiKey !== undefined) setApiKey(data.apiKey)
  }, [data])

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/email/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transport,
          from,
          host: host || undefined,
          port: port ? Number(port) : undefined,
          secure,
          username: username || undefined,
          password: password || undefined,
          apiKey: apiKey || undefined,
        }),
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '保存失败')
        throw new Error(msg)
      }
    },
    onSuccess: () => {
      toast.success('邮件配置已保存')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const test = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testTo,
          subject: '邮件配置测试',
          html: '<p>这是一封来自系统邮件设置的测试邮件，若你收到说明配置生效。</p>',
        }),
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '发送失败')
        throw new Error(msg)
      }
    },
    onSuccess: () => toast.success('测试邮件已发送'),
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header className="border-b border-border pb-10">
        <h1 className="text-3xl font-semibold">邮件设置</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          配置系统发送验证邮件所需的邮件服务。支持 SMTP 与 Resend
          两种传输方式，配置后用于注册验证、邮箱变更等场景。
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-base font-medium">传输方式</h2>
        <div className="divide-y divide-border border-y border-border">
          <div className="grid gap-2 py-5 md:grid-cols-[9rem_1fr] md:items-center">
            <Label>传输方式</Label>
            <Select value={transport} onValueChange={(v) => setTransport(v as EmailTransport)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smtp">SMTP</SelectItem>
                <SelectItem value="resend">Resend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <FieldRow label="发件地址" htmlFor="from">
            <Input
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="noreply@example.com"
            />
          </FieldRow>
        </div>
      </section>

      {transport === 'smtp' ? (
        <section className="space-y-4">
          <h2 className="text-base font-medium">SMTP 连接</h2>
          <div className="divide-y divide-border border-y border-border">
            <FieldRow label="主机" htmlFor="host">
              <Input
                id="host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtp.example.com"
              />
            </FieldRow>
            <FieldRow label="端口" htmlFor="port">
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                inputMode="numeric"
                placeholder="587"
              />
            </FieldRow>
            <FieldRow label="使用 TLS" htmlFor="secure">
              <div className="flex items-center gap-3">
                <Switch id="secure" checked={secure} onCheckedChange={setSecure} />
                <span className="text-sm text-muted-foreground">465 端口通常开启</span>
              </div>
            </FieldRow>
            <FieldRow label="用户名" htmlFor="username">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="可留空（部分 SMTP 无需认证）"
              />
            </FieldRow>
            <FieldRow label="密码" htmlFor="password">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="SMTP 授权码或密码"
              />
            </FieldRow>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-base font-medium">Resend API</h2>
          <div className="divide-y divide-border border-y border-border">
            <FieldRow label="API Key" htmlFor="apiKey">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="re_..."
              />
            </FieldRow>
          </div>
        </section>
      )}

      <section className="flex justify-end">
        <Button disabled={!from || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? '保存中…' : '保存配置'}
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-medium">发送测试</h2>
        <div className="divide-y divide-border border-y border-border">
          <FieldRow label="收件地址" htmlFor="testTo">
            <div className="flex gap-2">
              <Input
                id="testTo"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="you@example.com"
              />
              <Button
                variant="outline"
                disabled={!testTo || test.isPending}
                onClick={() => test.mutate()}
              >
                {test.isPending ? '发送中…' : '发送测试'}
              </Button>
            </div>
          </FieldRow>
        </div>
      </section>
    </div>
  )
}

function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2 py-5 md:grid-cols-[9rem_1fr] md:items-center">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
