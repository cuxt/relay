import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/x/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ROUTES, isSuper, type StorageConfig } from '@/constants'

export const Route = createFileRoute('/_user/_admin/storage')({
  beforeLoad: ({ context }) => {
    if (!isSuper(context.user.role)) throw redirect({ to: ROUTES.DASHBOARD })
  },
  component: StoragePage,
})

function StoragePage() {
  const { data } = useQuery({
    queryKey: ['admin', 'storage-config'],
    queryFn: async () => {
      const res = await fetch('/api/storage/config')
      if (!res.ok) throw new Error('读取失败')
      return (await res.json()) as Partial<StorageConfig>
    },
  })

  const [region, setRegion] = useState('auto')
  const [bucket, setBucket] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretAccessKey, setSecretAccessKey] = useState('')
  const [publicBaseUrl, setPublicBaseUrl] = useState('')
  const [forcePathStyle, setForcePathStyle] = useState(false)

  useEffect(() => {
    if (!data) return
    if (data.region !== undefined) setRegion(data.region)
    if (data.bucket !== undefined) setBucket(data.bucket)
    if (data.endpoint !== undefined) setEndpoint(data.endpoint)
    if (data.accessKeyId !== undefined) setAccessKeyId(data.accessKeyId)
    if (data.secretAccessKey !== undefined) setSecretAccessKey(data.secretAccessKey)
    if (data.publicBaseUrl !== undefined) setPublicBaseUrl(data.publicBaseUrl)
    if (data.forcePathStyle !== undefined) setForcePathStyle(data.forcePathStyle)
  }, [data])

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/storage/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transport: 's3',
          region,
          bucket,
          endpoint: endpoint || undefined,
          accessKeyId,
          secretAccessKey,
          publicBaseUrl: publicBaseUrl || undefined,
          forcePathStyle,
        }),
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '保存失败')
        throw new Error(msg)
      }
    },
    onSuccess: () => toast.success('存储配置已保存'),
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header className="border-b border-border pb-10">
        <h1 className="text-3xl font-semibold">对象存储</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          配置系统对象存储，用于上传文件等场景。目前支持 S3 兼容服务（AWS S3 / MinIO / Cloudflare R2
          / 阿里云 OSS S3 兼容端点）。
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-base font-medium">连接</h2>
        <div className="divide-y divide-border border-y border-border">
          <FieldRow label="存储桶" htmlFor="bucket">
            <Input
              id="bucket"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              placeholder="my-bucket"
            />
          </FieldRow>
          <FieldRow label="区域" htmlFor="region">
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="auto"
            />
          </FieldRow>
          <FieldRow label="端点" htmlFor="endpoint">
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="自建 MinIO / R2 填，AWS S3 留空"
            />
          </FieldRow>
          <FieldRow label="Access Key ID" htmlFor="accessKeyId">
            <Input
              id="accessKeyId"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Secret Access Key" htmlFor="secretAccessKey">
            <Input
              id="secretAccessKey"
              type="password"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Path Style" htmlFor="forcePathStyle">
            <div className="flex items-center gap-3">
              <Switch
                id="forcePathStyle"
                checked={forcePathStyle}
                onCheckedChange={setForcePathStyle}
              />
              <span className="text-sm text-muted-foreground">MinIO 通常开启，AWS S3 关闭</span>
            </div>
          </FieldRow>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-medium">访问域名</h2>
        <p className="text-sm text-muted-foreground">
          配置后上传资源通过该公开域名访问；不配则签发短期私有访问地址。
        </p>
        <div className="divide-y divide-border border-y border-border">
          <FieldRow label="公开域名" htmlFor="publicBaseUrl">
            <Input
              id="publicBaseUrl"
              value={publicBaseUrl}
              onChange={(e) => setPublicBaseUrl(e.target.value)}
              placeholder="https://cdn.example.com"
            />
          </FieldRow>
        </div>
      </section>

      <section className="flex justify-end">
        <Button
          disabled={!bucket || !accessKeyId || !secretAccessKey || save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? '保存中…' : '保存配置'}
        </Button>
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
