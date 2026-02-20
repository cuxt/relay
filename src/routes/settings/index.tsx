import { Plus } from 'lucide-react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { ProfileForm } from '@/components/settings/profile-form'
import { LinkedAccounts } from '@/components/settings/linked-accounts'
import { ApiKeysList } from '@/components/settings/api-keys-list'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ApiKeyCreateDialog } from '@/components/settings/api-key-create-dialog'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage
})

function SettingsPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <PageContainer
      title="设置"
      description="管理您的账户设置和 API 密钥"
      width="medium"
    >
      <Card>
        <CardContent className="p-6">
          {/* 个人资料 */}
          <div>
            <h3 className="text-base font-semibold">个人资料</h3>
            <p className="text-sm text-muted-foreground mb-4">您的账户信息</p>
            <ProfileForm />
          </div>

          <Separator className="my-6" />

          {/* 关联账户 */}
          <div>
            <h3 className="text-base font-semibold">关联账户</h3>
            <p className="text-sm text-muted-foreground mb-4">管理第三方账户绑定</p>
            <LinkedAccounts />
          </div>

          <Separator className="my-6" />

          {/* API 密钥 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">API 密钥</h3>
                <p className="text-sm text-muted-foreground">管理用于 API 认证的密钥</p>
              </div>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                创建密钥
              </Button>
            </div>
            <ApiKeysList />
          </div>
        </CardContent>
      </Card>

      <ApiKeyCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  )
}
