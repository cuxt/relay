import { useState, useId } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { ChannelFieldsProps } from './channel-field'

export function TelegramFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  const botTokenId = useId()
  const chatIdId = useId()
  const [fetchingChats, setFetchingChats] = useState(false)
  const [telegramChats, setTelegramChats] = useState<
    Array<{ id: number; title: string; type: string }>
  >([])

  const botToken = (config.botToken as string) || ''
  const chatId = (config.chatId as string) || ''

  async function handleFetchChatId() {
    if (!botToken) {
      toast.error('请先输入 Bot Token')
      return
    }

    setFetchingChats(true)
    try {
      const res = await fetch('/api/telegram/get-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken })
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        toast.error(json.error || '请求失败')
        return
      }

      const chats = json.chats || []
      if (chats.length === 0) {
        toast.error('未找到聊天记录，请先向机器人发送一条消息或将机器人添加到群组')
        return
      }

      setTelegramChats(chats)
      if (chats.length === 1) {
        onChange('config.chatId', String(chats[0].id))
        toast.success(`已获取: ${chats[0].title}`)
      }
    } catch {
      toast.error('获取失败，请检查网络连接')
    } finally {
      setFetchingChats(false)
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={botTokenId}>
          Bot Token
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id={botTokenId}
          placeholder="123456:ABC-DEF..."
          className="font-mono"
          value={botToken}
          onChange={e => onChange('config.botToken', e.target.value)}
          disabled={disabled}
          aria-invalid={!!errors['config.botToken']}
        />
        <p className="text-[0.8rem] text-muted-foreground">通过 @BotFather 获取的 Bot Token</p>
        {errors['config.botToken'] && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {errors['config.botToken']}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={chatIdId}>
          Chat ID
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <div className="flex gap-2">
          {telegramChats.length > 1 ? (
            <Select
              value={chatId}
              onValueChange={v => onChange('config.chatId', v ?? '')}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择聊天" />
              </SelectTrigger>
              <SelectContent>
                {telegramChats.map(chat => (
                  <SelectItem key={chat.id} value={String(chat.id)}>
                    {chat.title} ({chat.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={chatIdId}
              placeholder="聊天 ID"
              value={chatId}
              onChange={e => onChange('config.chatId', e.target.value)}
              disabled={disabled}
              aria-invalid={!!errors['config.chatId']}
            />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={fetchingChats || !botToken || disabled}
            onClick={handleFetchChatId}
          >
            {fetchingChats ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="mr-1.5 h-3.5 w-3.5" />
            )}
            获取
          </Button>
        </div>
        <p className="text-[0.8rem] text-muted-foreground">
          目标聊天/频道/群组的 ID — 点击「获取」自动查找
        </p>
        {errors['config.chatId'] && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {errors['config.chatId']}
          </p>
        )}
      </div>
    </>
  )
}
