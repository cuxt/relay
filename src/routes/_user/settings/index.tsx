import { Plus, User, Key, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { ProfileForm } from '@/components/settings/profile-form'
import { LinkedAccounts } from '@/components/settings/linked-accounts'
import { ApiKeysList } from '@/components/settings/api-keys-list'
import { AiProvidersList } from '@/components/settings/ai-providers-list'
import { AiPresetsList } from '@/components/settings/ai-presets-list'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ApiKeyCreateDialog } from '@/components/settings/api-key-create-dialog'
import { AiProviderDialog } from '@/components/settings/ai-provider-dialog'
import { AiPresetDialog } from '@/components/settings/ai-preset-dialog'
import { useIsMobile } from '@/hooks/use-mobile'

export const Route = createFileRoute('/_user/settings/')({
  component: SettingsPage
})

function SettingsPage() {
  const isMobile = useIsMobile()
  const [createKeyOpen, setCreateKeyOpen] = useState(false)
  const [createProviderOpen, setCreateProviderOpen] = useState(false)
  const [createPresetOpen, setCreatePresetOpen] = useState(false)

  return (
    <PageContainer
      title="设置"
      description="管理您的账户设置和 API 密钥"
      width="wide"
    >
      <Tabs defaultValue="account" orientation={isMobile ? 'horizontal' : 'vertical'}>
        <TabsList variant="line" className="w-full sm:w-48 sm:sticky sm:top-4 sm:self-start">
          <TabsTrigger value="account"><User />账户</TabsTrigger>
          <TabsTrigger value="api-keys"><Key />API 密钥</TabsTrigger>
          <TabsTrigger value="ai"><Sparkles />AI 配置</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>您的账户信息</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>关联账户</CardTitle>
              <CardDescription>管理第三方账户绑定</CardDescription>
            </CardHeader>
            <CardContent>
              <LinkedAccounts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API 密钥</CardTitle>
              <CardDescription>管理用于 API 认证的密钥</CardDescription>
              <CardAction>
                <Button size="sm" onClick={() => setCreateKeyOpen(true)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  创建密钥
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ApiKeysList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI 服务</CardTitle>
              <CardDescription>管理 OpenAI 兼容的 AI 服务端点</CardDescription>
              <CardAction>
                <Button size="sm" onClick={() => setCreateProviderOpen(true)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  添加服务
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <AiProvidersList />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI 预设</CardTitle>
              <CardDescription>管理 AI 处理配置（模型 + 提示词）</CardDescription>
              <CardAction>
                <Button size="sm" onClick={() => setCreatePresetOpen(true)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  添加预设
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <AiPresetsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ApiKeyCreateDialog
        open={createKeyOpen}
        onOpenChange={setCreateKeyOpen}
      />
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
