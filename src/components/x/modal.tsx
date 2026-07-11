import * as React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalProps extends React.ComponentProps<typeof DialogContent> {
  open: boolean
  onClose: () => void
}

function Modal({ open, onClose, className, children, ...props }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn('max-h-[calc(100svh-2rem)] overflow-y-auto', className)}
        {...props}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export { Modal }
