import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { EndpointForm } from '@/components/endpoints/endpoint-form'

export const Route = createFileRoute('/_user/endpoints/new')({
  component: NewEndpointPage,
})

function NewEndpointPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        to="/endpoints"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回端点列表
      </Link>

      <header className="border-b border-border pb-10">
        <p className="text-sm text-muted-foreground">端点管理</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">新建端点</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          将一个推送入口关联到多个消息渠道，并配置请求内容转换为消息时使用的模板。
        </p>
      </header>

      <EndpointForm mode="create" />
    </div>
  )
}
