import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/_app/settings/')({
  component: ProfileSettings,
})

function ProfileSettings() {
  const { user } = Route.useRouteContext()

  const updateMutation = useMutation({
    mutationFn: async ({ name, image }: { name: string; image?: string }) => {
      const res = await authClient.updateUser({ name, image })
      if (res.error) throw res.error
    },
    onSuccess: () => toast.success('个人资料已更新'),
  })

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string).trim()
    if (!name) {
      toast.error('请输入姓名')
      return
    }
    const image = (formData.get('image') as string).trim()
    updateMutation.mutate({ name, image: image || undefined })
  }

  return (
    <Card className="max-w-160">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-lg">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h5 className="font-semibold">{user.name}</h5>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" name="name" placeholder="你的名字" defaultValue={user.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">头像 URL</Label>
            <Input
              id="image"
              name="image"
              placeholder="https://example.com/avatar.png"
              defaultValue={user.image || ''}
            />
          </div>
          <Button type="submit" className="rounded-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            保存更改
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
