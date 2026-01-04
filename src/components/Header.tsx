import { Link, useNavigate } from '@tanstack/react-router'
import { Moon, Sun, Laptop, LogOut, User, Radio, Network } from 'lucide-react'
import { useTheme } from '@/components/theme'
import { useSession, signOut } from '@/lib/auth/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const { setTheme } = useTheme()
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/auth/login', replace: true })
  }

  const navLinkProps = {
    className: 'flex items-center gap-2 text-sm font-medium transition-all px-1 py-1',
    activeProps: {
      className: 'flex items-center gap-2 text-sm font-medium text-foreground px-1 py-1'
    },
    inactiveProps: {
      className: 'flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground px-1 py-1'
    }
  }

  if (isPending) {
    return (
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Relay Logo" className="h-7 block" />
            <span className="font-semibold text-lg">Relay</span>
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Relay Logo" className="h-7 block" />
            <span className="font-semibold text-lg">Relay</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/endpoints" {...navLinkProps}>
              <Network className="h-4 w-4" />
              <span>端点管理</span>
            </Link>
            <Link to="/channels" {...navLinkProps}>
              <Radio className="h-4 w-4" />
              <span>渠道管理</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">切换主题</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>浅色</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>深色</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>跟随系统</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image ?? undefined}
                      alt={session.user.name ?? '用户'}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
