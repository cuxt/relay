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

export function WecomAppFields() {
  const form = useFormContext()

  return (
    <>
      <FormField
        control={form.control}
        name="config.corpId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Corp ID
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="企业 ID" {...field} />
            </FormControl>
            <FormDescription>企业微信的企业 ID</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.agentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Agent ID
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="应用 ID" {...field} />
            </FormControl>
            <FormDescription>企业微信应用的 Agent ID</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.secret"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              App Secret
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="应用密钥"
                {...field}
              />
            </FormControl>
            <FormDescription>企业微信应用的密钥</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
