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

export function FeishuFields() {
  const form = useFormContext()

  return (
    <>
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
                placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                {...field}
              />
            </FormControl>
            <FormDescription>
              飞书自定义机器人的 Webhook 地址
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.secret"
        render={({ field }) => (
          <FormItem>
            <FormLabel>签名密钥</FormLabel>
            <FormControl>
              <Input
                placeholder="签名密钥（可选）"
                {...field}
              />
            </FormControl>
            <FormDescription>
              如果启用了签名校验，请填写密钥
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
