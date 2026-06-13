import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form'
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

export function TelegramFields() {
  const form = useFormContext()
  const [fetchingChats, setFetchingChats] = useState(false)
  const [telegramChats, setTelegramChats] = useState<
    Array<{ id: number; title: string; type: string }>
  >([])

  async function handleFetchChatId() {
    const botToken = form.getValues('config.botToken')
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

      if (json.error) {
        toast.error(json.error.message)
        return
      }

      const chats = json.data?.chats || []
      if (chats.length === 0) {
        toast.error(
          '未找到聊天记录，请先向机器人发送一条消息或将机器人添加到群组'
        )
        return
      }

      setTelegramChats(chats)
      if (chats.length === 1) {
        form.setValue('config.chatId', String(chats[0].id))
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
      <FormField
        control={form.control}
        name="config.botToken"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Bot Token
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="123456:ABC-DEF..."
                className="font-mono"
                {...field}
              />
            </FormControl>
            <FormDescription>
              通过 @BotFather 获取的 Bot Token
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.chatId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Chat ID
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <div className="flex gap-2">
              <FormControl>
                {telegramChats.length > 1 ? (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择聊天" />
                    </SelectTrigger>
                    <SelectContent>
                      {telegramChats.map(chat => (
                        <SelectItem
                          key={chat.id}
                          value={String(chat.id)}
                        >
                          {chat.title} ({chat.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="聊天 ID" {...field} />
                )}
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={fetchingChats || !form.getValues('config.botToken')}
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
            <FormDescription>
              目标聊天/频道/群组的 ID — 点击「获取」自动查找
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
