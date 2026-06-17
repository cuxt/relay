import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import {
  Plus,
  Search,
  Pencil,
  Ban,
  Trash2,
  Eye,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  KeyRound,
  Shield,
  Check,
  X,
  MoreHorizontal,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { userRouteContextQueryKey } from '@/lib/query-keys'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/x/avatar'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { CreateUserModal } from '@/components/settings/create-user-modal'
import { EditUserModal } from '@/components/settings/edit-user-modal'
import { BanUserModal } from '@/components/settings/ban-user-modal'
import { DeleteUserModal } from '@/components/settings/delete-user-modal'
import { UserSessionsModal } from '@/components/settings/user-sessions-modal'
import { ResetPasswordModal } from '@/components/settings/reset-password-modal'
import { ROLES, ROUTES, UI, type Role } from '@/constants'

export const Route = createFileRoute('/_user/_admin/users')({
  component: UsersSettings,
})

interface UserRecord {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
  banReason: string | null
  banExpires: string | null
  image: string | null
  createdAt: string
  emailVerified: boolean
}

function UsersSettings() {
  const { user: currentUser } = Route.useRouteContext()
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: UI.USER_PAGE_SIZE })

  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [banUser, setBanUser] = useState<UserRecord | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null)
  const [sessionsUser, setSessionsUser] = useState<UserRecord | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<UserRecord | null>(null)

  const usersQueryKey = [
    'admin',
    'users',
    {
      page: pagination.current,
      pageSize: pagination.pageSize,
      search: searchText,
    },
  ]

  const { data: usersData, isLoading } = useQuery({
    queryKey: usersQueryKey,
    queryFn: async () => {
      const res = await authClient.admin.listUsers({
        query: {
          limit: pagination.pageSize,
          offset: (pagination.current - 1) * pagination.pageSize,
          ...(searchText
            ? {
                searchField: 'email' as const,
                searchValue: searchText,
                searchOperator: 'contains' as const,
              }
            : {}),
        },
      })
      return res.data
    },
  })

  const users = (usersData?.users ?? []) as unknown as UserRecord[]
  const total = usersData?.total ?? 0
  const totalPages = Math.ceil(total / pagination.pageSize)

  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await authClient.admin.impersonateUser({ userId })
      if (res.error) throw res.error
    },
    onSuccess: async () => {
      toast.success('已切换到目标用户视角')
      queryClient.removeQueries({ queryKey: userRouteContextQueryKey })
      await router.invalidate()
      await navigate({ to: ROUTES.DASHBOARD })
    },
  })

  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await authClient.admin.unbanUser({ userId })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('已解封用户')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const setRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const res = await authClient.admin.setRole({ userId, role })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('角色已更新')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 mb-4 flex-col sm:flex-row">
            <div className="relative w-full sm:w-auto sm:min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索邮箱..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  setPagination((prev) => ({ ...prev, current: 1 }))
                }}
                className="pl-9"
              />
            </div>
            <Button className="rounded-full shrink-0" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              创建用户
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">用户</TableHead>
                      <TableHead className="w-32 hidden sm:table-cell">ID</TableHead>
                      <TableHead className="hidden md:table-cell">邮箱</TableHead>
                      <TableHead className="w-16 hidden sm:table-cell">角色</TableHead>
                      <TableHead className="w-16 hidden lg:table-cell">状态</TableHead>
                      <TableHead className="w-16 hidden lg:table-cell">验证</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((record) => (
                      <TableRow key={record.id} className={record.banned ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar id={record.id} src={record.image} size="sm" />
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate max-w-25">{record.name}</span>
                              <span className="text-xs text-muted-foreground md:hidden truncate max-w-30">
                                {record.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                          {record.id}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
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
                          <Badge
                            variant={record.banned ? 'destructive' : 'secondary'}
                            className="shrink-0"
                          >
                            {record.banned ? '已封禁' : '正常'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {record.emailVerified ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditUser(record)}>
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
                                    value={record.role || ROLES.USER}
                                    onValueChange={(role) => {
                                      if (role !== (record.role || ROLES.USER)) {
                                        setRoleMutation.mutate({
                                          userId: record.id,
                                          role: role as Role,
                                        })
                                      }
                                    }}
                                  >
                                    <DropdownMenuRadioItem value={ROLES.USER}>用户</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value={ROLES.ADMIN}>
                                      管理员
                                    </DropdownMenuRadioItem>
                                  </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem onClick={() => setResetPasswordUser(record)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                重置密码
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSessionsUser(record)}>
                                <Eye className="mr-2 h-4 w-4" />
                                会话
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => impersonateMutation.mutate(record.id)}
                                disabled={record.id === currentUser.id}
                              >
                                <ArrowLeftRight className="mr-2 h-4 w-4" />
                                模拟登录
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (record.banned) {
                                    unbanMutation.mutate(record.id)
                                  } else {
                                    setBanUser(record)
                                  }
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {record.banned ? '解封' : '封禁'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteUser(record)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border flex-col sm:flex-row gap-4">
                <p className="text-sm text-muted-foreground">共 {total} 名用户</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current <= 1}
                    onClick={() => setPagination((p) => ({ ...p, current: p.current - 1 }))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {pagination.current} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current >= totalPages}
                    onClick={() => setPagination((p) => ({ ...p, current: p.current + 1 }))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={invalidateUsers}
      />
      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={invalidateUsers}
      />
      <BanUserModal user={banUser} onClose={() => setBanUser(null)} onSuccess={invalidateUsers} />
      <DeleteUserModal
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
        onSuccess={invalidateUsers}
      />
      <UserSessionsModal user={sessionsUser} onClose={() => setSessionsUser(null)} />
      <ResetPasswordModal
        user={resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
        onSuccess={invalidateUsers}
      />
    </>
  )
}
