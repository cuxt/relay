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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export function WebhookFields() {
  const form = useFormContext()

  return (
    <>
      <FormField
        control={form.control}
        name="config.webhook"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              URL
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormDescription>
              目标服务的 URL 地址
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>请求方法</FormLabel>
            <Select
              value={field.value || 'POST'}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="POST" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              默认 POST，支持 GET/POST
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.headers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>自定义 Headers</FormLabel>
            <FormControl>
              <Input
                placeholder='{"Authorization": "Bearer ..."}'
                value={
                  typeof field.value === 'object' && field.value !== null
                    ? JSON.stringify(field.value)
                    : field.value || ''
                }
                onChange={e => {
                  const val = e.target.value
                  try {
                    field.onChange(JSON.parse(val))
                  } catch {
                    field.onChange(val)
                  }
                }}
              />
            </FormControl>
            <FormDescription>
              自定义请求头（JSON 格式）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
