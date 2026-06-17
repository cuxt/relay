import { Settings, LogOut, ArrowLeftRight } from 'lucide-react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth/client'
import { userRouteContextQueryKey } from '@/lib/query-keys'
import { Avatar } from '@/components/x/avatar'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants'

interface UserMenuProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    role?: string | null
  }
  impersonating?: boolean
}

export function UserMenu({ user, impersonating }: UserMenuProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut()
      if (res.error) throw res.error
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: userRouteContextQueryKey })
      await router.invalidate()
      await navigate({ to: ROUTES.LOGIN })
    },
  })

  const stopImpersonateMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.admin.stopImpersonating()
      if (res.error) throw res.error
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: userRouteContextQueryKey })
      await router.invalidate()
      await navigate({ to: ROUTES.USERS })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
        }
      >
        <Avatar
          id={user.id}
          src={user.image}
          className={cn(impersonating ? 'ring-2 ring-destructive' : '')}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.name}
                {impersonating && (
                  <span className="ml-1.5 text-xs text-muted-foreground">模拟中</span>
                )}
              </p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: ROUTES.PROFILE })}>
          <Settings className="mr-2 h-4 w-4" />
          设置
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {impersonating ? (
          <DropdownMenuItem onClick={() => stopImpersonateMutation.mutate()}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {stopImpersonateMutation.isPending ? '退出中...' : '退出模拟'}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? '退出中...' : '退出登录'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
