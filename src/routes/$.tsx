import { createFileRoute, Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center">
      <span className="text-[120px] font-extrabold text-primary/15 leading-none select-none">
        404
      </span>
      <h2 className="text-2xl font-bold -mt-5">页面未找到</h2>
      <p className="text-base text-muted-foreground mt-3 mb-8 max-w-100">
        抱歉，你访问的页面不存在。请检查 URL 或返回首页。
      </p>
      <Link to="/">
        <Button size="lg" className="rounded-full">
          <Home className="mr-1 h-4 w-4" />
          返回首页
        </Button>
      </Link>
    </div>
  )
}
