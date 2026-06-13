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

export function DiscordFields() {
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
              placeholder="https://discord.com/api/webhooks/..."
              {...field}
            />
          </FormControl>
          <FormDescription>
            Discord 频道的 Webhook URL
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
