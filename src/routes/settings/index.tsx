import { Plus } from 'lucide-react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { ProfileForm } from '@/components/settings/profile-form'
import { LinkedAccounts } from '@/components/settings/linked-accounts'
import { ApiKeysList } from '@/components/settings/api-keys-list'
import { AiProvidersList } from '@/components/settings/ai-providers-list'
import { AiPresetsList } from '@/components/settings/ai-presets-list'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ApiKeyCreateDialog } from '@/components/settings/api-key-create-dialog'
import { AiProviderDialog } from '@/components/settings/ai-provider-dialog'
import { AiPresetDialog } from '@/components/settings/ai-preset-dialog'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage
})

function SettingsPage() {
  const [createKeyOpen, setCreateKeyOpen] = useState(false)
  const [createProviderOpen, setCreateProviderOpen] = useState(false)
  const [createPresetOpen, setCreatePresetOpen] = useState(false)

  return (
    <PageContainer
      title="设置"
      description="管理您的账户设置和 API 密钥"
      width="medium"
    >
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">账户</TabsTrigger>
          <TabsTrigger value="api-keys">API 密钥</TabsTrigger>
          <TabsTrigger value="ai">AI 配置</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardContent className="p-6">
              {/* 个人资料 */}
              <div>
                <h3 className="text-base font-semibold">个人资料</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  您的账户信息
                </p>
                <ProfileForm />
              </div>

              <Separator className="my-6" />

              {/* 关联账户 */}
              <div>
                <h3 className="text-base font-semibold">关联账户</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  管理第三方账户绑定
                </p>
                <LinkedAccounts />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold">API 密钥</h3>
                  <p className="text-sm text-muted-foreground">
                    管理用于 API 认证的密钥
                  </p>
                </div>
                <Button size="sm" onClick={() => setCreateKeyOpen(true)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  创建密钥
                </Button>
              </div>
              <ApiKeysList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardContent className="p-6">
              {/* AI 服务 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold">AI 服务</h3>
                    <p className="text-sm text-muted-foreground">
                      管理 OpenAI 兼容的 AI 服务端点
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setCreateProviderOpen(true)}>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    添加服务
                  </Button>
                </div>
                <AiProvidersList />
              </div>

              <Separator className="my-6" />

              {/* AI 预设 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold">AI 预设</h3>
                    <p className="text-sm text-muted-foreground">
                      管理 AI 处理配置（模型 + 提示词）
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setCreatePresetOpen(true)}>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    添加预设
                  </Button>
                </div>
                <AiPresetsList />
              </div>
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
