import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { ProfileForm } from '@/components/settings/profile-form'
import { ApiKeysList } from '@/components/settings/api-keys-list'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage
})

function SettingsPage() {
  return (
    <PageContainer
      title="设置"
      description="管理您的账户设置和 API 密钥"
      width="wide"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <ProfileForm />
        </div>
        <div className="lg:col-span-3">
          <ApiKeysList />
        </div>
      </div>
    </PageContainer>
  )
}
