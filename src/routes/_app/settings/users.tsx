import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Plus,
  Search,
  MoreHorizontal,
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
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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
import { CreateUserModal } from '@/components/settings/CreateUserModal'
import { EditUserModal } from '@/components/settings/EditUserModal'
import { BanUserModal } from '@/components/settings/BanUserModal'
import { DeleteUserModal } from '@/components/settings/DeleteUserModal'
import { UserSessionsModal } from '@/components/settings/UserSessionsModal'
import { ResetPasswordModal } from '@/components/settings/ResetPasswordModal'

export const Route = createFileRoute('/_app/settings/users')({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
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
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  // Modal states
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
    onSuccess: () => {
      toast.success('已切换到目标用户视角')
      window.location.reload()
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
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-75">
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
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead className="w-25">角色</TableHead>
                    <TableHead className="w-25">状态</TableHead>
                    <TableHead className="w-45">注册时间</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {record.image && <AvatarImage src={record.image} />}
                            <AvatarFallback className="text-xs">
                              {record.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{record.name}</p>
                            <p className="text-xs text-muted-foreground">{record.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.role === 'admin' ? 'default' : 'secondary'}>
                          {record.role === 'admin' ? '管理员' : '用户'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.banned ? 'destructive' : 'secondary'}>
                          {record.banned ? '已封禁' : '正常'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(record.createdAt).toLocaleString('zh-CN')}
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
                              <DropdownMenuSubTrigger>
                                <Shield className="mr-2 h-4 w-4" />
                                切换角色
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup
                                  value={record.role || 'user'}
                                  onValueChange={(role) => {
                                    if (role !== (record.role || 'user')) {
                                      setRoleMutation.mutate({
                                        userId: record.id,
                                        role: role as 'user' | 'admin',
                                      })
                                    }
                                  }}
                                >
                                  <DropdownMenuRadioItem value="user">用户</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="admin">
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
                            <DropdownMenuItem onClick={() => setDeleteUser(record)}>
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
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
