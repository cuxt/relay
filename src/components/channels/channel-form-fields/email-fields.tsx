import { useFormContext, useWatch } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function EmailFields() {
  const form = useFormContext()
  const provider = useWatch({ control: form.control, name: 'config.provider' }) || 'smtp'

  return (
    <>
      {/* 邮件提供商切换 */}
      <FormField
        control={form.control}
        name="config.provider"
        render={({ field }) => (
          <FormItem>
            <FormLabel>邮件提供商</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                {(['smtp', 'resend'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      field.onChange(v)
                      // 切换时初始化子结构
                      if (v === 'smtp' && !form.getValues('config.smtp')) {
                        form.setValue('config.smtp', {
                          host: '',
                          port: 465,
                          secure: true,
                          user: '',
                          password: ''
                        })
                      }
                      if (v === 'resend' && !form.getValues('config.resend')) {
                        form.setValue('config.resend', { apiKey: '' })
                      }
                    }}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      (field.value || 'smtp') === v
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {v === 'smtp' ? 'SMTP' : 'Resend'}
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Resend 配置 */}
      {provider === 'resend' ? (
        <FormField
          control={form.control}
          name="config.resend.apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                API Key
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="re_..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                在 resend.com 控制台获取 API Key
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        /* SMTP 配置 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="config.smtp.host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  SMTP 主机
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="smtp.example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.smtp.port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SMTP 端口</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="465"
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.smtp.user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  SMTP 用户名
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.smtp.password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  SMTP 密码
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="密码"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* 发件人 / 收件人 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
        <FormField
          control={form.control}
          name="config.from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                发件人
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="sender@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="config.to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                收件人
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="多个收件人用逗号分隔"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
