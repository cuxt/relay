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

export function BarkFields() {
  const form = useFormContext()

  return (
    <>
      <FormField
        control={form.control}
        name="config.server"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Bark 服务器地址
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="https://api.day.app" {...field} />
            </FormControl>
            <FormDescription>
              自部署的 Bark 服务器地址
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              设备密钥
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="设备密钥" {...field} />
            </FormControl>
            <FormDescription>
              Bark App 中显示的设备密钥
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
