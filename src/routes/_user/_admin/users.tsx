import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftRight,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { BanModal } from '@/components/users/ban-modal'
import { CreateModal } from '@/components/users/create-modal'
import { DeleteModal } from '@/components/users/delete-modal'
import { EditModal } from '@/components/users/edit-modal'
import { ResetPasswordModal } from '@/components/users/reset-password-modal'
import { SessionsModal } from '@/components/users/sessions-modal'
import { Avatar } from '@/components/x/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ROLES, ROUTES, UI, type Role } from '@/constants'
import { authClient } from '@/lib/auth/client'
import { sessionKey, type Session } from '@/lib/auth/session'

export const Route = createFileRoute('/_user/_admin/users')({
  component: UsersPage,
})

type UserRecord = Session['user']

function UsersPage() {
  const { user: currentUser } = Route.useRouteContext()
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [page, setPage] = useState({ index: 1, size: UI.USER_PAGE_SIZE })
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [banUser, setBanUser] = useState<UserRecord | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null)
  const [sessionsUser, setSessionsUser] = useState<UserRecord | null>(null)
  const [resetUser, setResetUser] = useState<UserRecord | null>(null)

  const usersKey = ['admin', 'users', { page: page.index, size: page.size, q }]

  const { data, isLoading } = useQuery({
    queryKey: usersKey,
    queryFn: async () => {
      const res = await authClient.admin.listUsers({
        query: {
          limit: page.size,
          offset: (page.index - 1) * page.size,
          ...(q
            ? {
                searchField: 'email' as const,
                searchValue: q,
                searchOperator: 'contains' as const,
              }
            : {}),
        },
      })
      return res.data
    },
  })

  const users = data?.users ?? []
  const total = data?.total ?? 0
  const pages = Math.ceil(total / page.size)

  const impersonate = useMutation({
    mutationFn: async (userId: string) => {
      const res = await authClient.admin.impersonateUser({ userId })
      if (res.error) throw res.error
    },
    onSuccess: async () => {
      toast.success('已切换到目标用户视角')
      queryClient.removeQueries({ queryKey: sessionKey })
      await router.invalidate()
      await navigate({ to: ROUTES.DASHBOARD })
    },
  })

  const unban = useMutation({
    mutationFn: async (userId: string) => {
      const res = await authClient.admin.unbanUser({ userId })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('已解封用户')
      invalidateUsers()
    },
  })

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const res = await authClient.admin.setRole({ userId, role })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('角色已更新')
      invalidateUsers()
    },
  })

  function invalidateUsers() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold">用户</h1>
            <p className="mt-1 text-sm text-muted-foreground">管理账户、角色和会话。</p>
          </div>
          <Button className="shrink-0 rounded-full" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            创建用户
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索邮箱..."
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              setPage((prev) => ({ ...prev, index: 1 }))
            }}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto border-y border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">用户</TableHead>
                    <TableHead className="hidden w-32 sm:table-cell">ID</TableHead>
                    <TableHead className="hidden md:table-cell">邮箱</TableHead>
                    <TableHead className="hidden w-16 sm:table-cell">角色</TableHead>
                    <TableHead className="hidden w-16 lg:table-cell">状态</TableHead>
                    <TableHead className="hidden w-16 lg:table-cell">验证</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((record) => (
                    <TableRow key={record.id} className={record.banned ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar id={record.id} src={record.image} size="sm" />
                          <div className="flex min-w-0 flex-col">
                            <span className="max-w-25 truncate font-medium">{record.name}</span>
                            <span className="max-w-30 truncate text-xs text-muted-foreground md:hidden">
                              {record.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                        {record.id}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {record.email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={record.role === ROLES.ADMIN ? 'default' : 'secondary'}
                          className="shrink-0"
                        >
                          {record.role === ROLES.ADMIN ? '管理员' : '用户'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {record.banned && record.banReason ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Badge variant="destructive" className="shrink-0 cursor-default" />
                              }
                            >
                              已封禁
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs break-all">
                              {record.banReason}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge
                            variant={record.banned ? 'destructive' : 'secondary'}
                            className="shrink-0"
                          >
                            {record.banned ? '已封禁' : '正常'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {record.emailVerified ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <UserActions
                          user={record}
                          currentUserId={currentUser.id}
                          setRole={(role) => setRole.mutate({ userId: record.id, role })}
                          impersonate={() => impersonate.mutate(record.id)}
                          unban={() => unban.mutate(record.id)}
                          setEditUser={setEditUser}
                          setBanUser={setBanUser}
                          setDeleteUser={setDeleteUser}
                          setSessionsUser={setSessionsUser}
                          setResetUser={setResetUser}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">共 {total} 名用户</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page.index <= 1}
                  onClick={() => setPage((prev) => ({ ...prev, index: prev.index - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {page.index} / {pages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page.index >= pages}
                  onClick={() => setPage((prev) => ({ ...prev, index: prev.index + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={invalidateUsers}
      />
      <EditModal user={editUser} onClose={() => setEditUser(null)} onSuccess={invalidateUsers} />
      <BanModal user={banUser} onClose={() => setBanUser(null)} onSuccess={invalidateUsers} />
      <DeleteModal
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
        onSuccess={invalidateUsers}
      />
      <SessionsModal user={sessionsUser} onClose={() => setSessionsUser(null)} />
      <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} onSuccess={invalidateUsers} />
    </>
  )
}

function UserActions({
  user,
  currentUserId,
  setRole,
  impersonate,
  unban,
  setEditUser,
  setBanUser,
  setDeleteUser,
  setSessionsUser,
  setResetUser,
}: {
  user: UserRecord
  currentUserId: string
  setRole: (role: Role) => void
  impersonate: () => void
  unban: () => void
  setEditUser: (user: UserRecord) => void
  setBanUser: (user: UserRecord) => void
  setDeleteUser: (user: UserRecord) => void
  setSessionsUser: (user: UserRecord) => void
  setResetUser: (user: UserRecord) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setEditUser(user)}>
          <Pencil className="mr-2 h-4 w-4" />
          编辑资料
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="whitespace-nowrap">
            <Shield className="mr-2 h-4 w-4" />
            切换角色
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={user.role || ROLES.USER}
              onValueChange={(role) => {
                if (role !== (user.role || ROLES.USER)) setRole(role as Role)
              }}
            >
              <DropdownMenuRadioItem value={ROLES.USER}>用户</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={ROLES.ADMIN}>管理员</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => setResetUser(user)}>
          <KeyRound className="mr-2 h-4 w-4" />
          重置密码
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSessionsUser(user)}>
          <Eye className="mr-2 h-4 w-4" />
          会话
        </DropdownMenuItem>
        <DropdownMenuItem onClick={impersonate} disabled={user.id === currentUserId}>
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          模拟登录
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            if (user.banned) {
              unban()
            } else {
              setBanUser(user)
            }
          }}
        >
          <Ban className="mr-2 h-4 w-4" />
          {user.banned ? '解封' : '封禁'}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => setDeleteUser(user)}
          disabled={user.id === currentUserId}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
