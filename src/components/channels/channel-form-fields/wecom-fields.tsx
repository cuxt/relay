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

export function WecomFields() {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name="config.webhook"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Webhook 地址
            <span className="text-red-500 ml-1">*</span>
          </FormLabel>
          <FormControl>
            <Input
              placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
              {...field}
            />
          </FormControl>
          <FormDescription>
            企业微信群机器人的 Webhook 地址
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
