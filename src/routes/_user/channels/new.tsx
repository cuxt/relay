import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ChannelForm } from '@/components/channels/channel-form'

export const Route = createFileRoute('/_user/channels/new')({
  component: NewChannelPage,
})

function NewChannelPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        to="/channels"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回渠道列表
      </Link>

      <header className="border-b border-border pb-10">
        <p className="text-sm text-muted-foreground">渠道管理</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">新建渠道</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          选择消息平台并填写连接信息。创建后，可将一个或多个推送端点关联到该渠道。
        </p>
      </header>

      <ChannelForm mode="create" />
    </div>
  )
}
