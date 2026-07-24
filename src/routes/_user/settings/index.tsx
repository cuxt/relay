import {
  Plus,
  User,
  Sparkles,
  UserRound,
  Link2,
  Server,
  WandSparkles,
} from 'lucide-react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { ProfileForm } from '@/components/settings/profile-form'
import { LinkedAccounts } from '@/components/settings/linked-accounts'
import { AiProvidersList } from '@/components/settings/ai-providers-list'
import { AiPresetsList } from '@/components/settings/ai-presets-list'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AiProviderDialog } from '@/components/settings/ai-provider-dialog'
import { AiPresetDialog } from '@/components/settings/ai-preset-dialog'
import { useIsMobile } from '@/hooks/use-mobile'

export const Route = createFileRoute('/_user/settings/')({
  component: SettingsPage
})

function SettingsPage() {
  const isMobile = useIsMobile()
  const [createProviderOpen, setCreateProviderOpen] = useState(false)
  const [createPresetOpen, setCreatePresetOpen] = useState(false)

  return (
    <PageContainer
      title="系统设置"
      description="管理账户信息与 AI 功能配置"
      width="wide"
    >
      <Tabs
        defaultValue="account"
        orientation={isMobile ? 'horizontal' : 'vertical'}
        className="gap-6 sm:grid sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-start"
      >
        <TabsList className="w-full justify-start overflow-x-auto sm:sticky sm:top-4 sm:h-auto sm:flex-col sm:items-stretch sm:rounded-xl sm:border sm:bg-muted/20 sm:p-2">
          <TabsTrigger value="account" className="h-9 px-3 sm:flex-none">
            <User />账户信息
          </TabsTrigger>
          <TabsTrigger value="ai" className="h-9 px-3 sm:flex-none">
            <Sparkles />AI 配置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="min-w-0 space-y-6">
          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <UserRound className="size-4" />
                </div>
                <div>
                  <CardTitle>个人资料</CardTitle>
                  <CardDescription>您的账户信息</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <ProfileForm />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Link2 className="size-4" />
                </div>
                <div>
                  <CardTitle>关联账户</CardTitle>
                  <CardDescription>管理第三方账户绑定</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <LinkedAccounts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="min-w-0 space-y-6">
          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Server className="size-4" />
                </div>
                <div>
                  <CardTitle>AI 服务</CardTitle>
                  <CardDescription>管理 OpenAI 兼容的 AI 服务端点</CardDescription>
                </div>
              </div>
              <CardAction>
                <Button size="sm" onClick={() => setCreateProviderOpen(true)}>
                  <Plus className="size-3.5" />
                  添加服务
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AiProvidersList />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <WandSparkles className="size-4" />
                </div>
                <div>
                  <CardTitle>AI 预设</CardTitle>
                  <CardDescription>管理 AI 处理配置（模型 + 提示词）</CardDescription>
                </div>
              </div>
              <CardAction>
                <Button size="sm" onClick={() => setCreatePresetOpen(true)}>
                  <Plus className="size-3.5" />
                  添加预设
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AiPresetsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AiProviderDialog
        open={createProviderOpen}
        onOpenChange={setCreateProviderOpen}
      />
      <AiPresetDialog
        open={createPresetOpen}
        onOpenChange={setCreatePresetOpen}
      />
    </PageContainer>
  )
}
