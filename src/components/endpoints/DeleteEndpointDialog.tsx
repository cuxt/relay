import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { EndpointWithChannel } from '@/lib/endpoint/types'

interface DeleteEndpointDialogProps {
  endpoint: EndpointWithChannel | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isLoading: boolean
}

export function DeleteEndpointDialog({
  endpoint,
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: DeleteEndpointDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除端点</DialogTitle>
          <DialogDescription>
            确定要删除"{endpoint?.name}"吗？此操作无法撤销。
            {endpoint && (
              <div className="mt-2 text-sm">
                关联渠道：{endpoint.channel.name}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '删除中...' : '删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
