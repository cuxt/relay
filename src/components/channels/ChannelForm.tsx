import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
  FieldDescription
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CHANNEL_TYPES, type ChannelType } from '@/lib/channel'
import type {
  Channel,
  CreateChannelDto,
  UpdateChannelDto
} from '@/lib/channel/types'
import { createChannelSchema } from '@/lib/channel/validation'

interface ChannelFormProps {
  channel?: Channel
  onSubmit: (data: CreateChannelDto | UpdateChannelDto) => Promise<void>
  onCancel: () => void
}

// 渠道类型选项配置
const CHANNEL_OPTIONS: Array<{
  value: ChannelType
  label: string
  disabled?: boolean
}> = [
  { value: CHANNEL_TYPES.FEISHU, label: '飞书' },
  { value: CHANNEL_TYPES.WECOM, label: '企业微信' },
  { value: CHANNEL_TYPES.DINGTALK, label: '钉钉（即将支持）', disabled: true },
  {
    value: CHANNEL_TYPES.TELEGRAM,
    label: 'Telegram（即将支持）',
    disabled: true
  },
  {
    value: CHANNEL_TYPES.DISCORD,
    label: 'Discord（即将支持）',
    disabled: true
  },
  {
    value: CHANNEL_TYPES.WEBHOOK,
    label: 'Webhook（即将支持）',
    disabled: true
  },
  { value: CHANNEL_TYPES.EMAIL, label: '邮件（即将支持）', disabled: true }
]

// 渠道配置字段定义
type ChannelConfigField = {
  name: 'config.webhook' | 'config.secret'
  label: string
  type: 'url' | 'password'
  placeholder: string
  description: string
  required?: boolean
}

// 各渠道的配置字段映射
const CHANNEL_CONFIG_FIELDS: Record<ChannelType, ChannelConfigField[]> = {
  [CHANNEL_TYPES.FEISHU]: [
    {
      name: 'config.webhook',
      label: 'Webhook 地址',
      type: 'url',
      placeholder: 'https://open.feishu.cn/open-apis/bot/v2/hook/...',
      description: '飞书机器人的 Webhook 地址',
      required: true
    },
    {
      name: 'config.secret',
      label: '签名密钥',
      type: 'password',
      placeholder: '输入签名密钥',
      description: '用于验证消息来源的安全密钥',
      required: false
    }
  ],
  [CHANNEL_TYPES.WECOM]: [
    {
      name: 'config.webhook',
      label: 'Webhook 地址',
      type: 'url',
      placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...',
      description: '企业微信机器人的 Webhook 地址',
      required: true
    }
  ],
  // 其他渠道暂时使用空数组
  [CHANNEL_TYPES.DINGTALK]: [],
  [CHANNEL_TYPES.TELEGRAM]: [],
  [CHANNEL_TYPES.DISCORD]: [],
  [CHANNEL_TYPES.WEBHOOK]: [],
  [CHANNEL_TYPES.EMAIL]: [],
  [CHANNEL_TYPES.WECOM_APP]: [],
  [CHANNEL_TYPES.BARK]: []
}

export function ChannelForm({ channel, onSubmit, onCancel }: ChannelFormProps) {
  const form = useForm({
    defaultValues: {
      name: channel?.name || '',
      type: channel?.type || CHANNEL_TYPES.FEISHU,
      config: {
        webhook:
          channel?.config && 'webhook' in channel.config
            ? channel.config.webhook
            : '',
        secret:
          channel?.config && 'secret' in channel.config
            ? channel.config.secret || ''
            : ''
      },
      status: channel?.status || 'active'
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = createChannelSchema.safeParse(value)
        if (!result.success) {
          const errors: Record<string, string> = {}
          result.error.issues.forEach(issue => {
            const path = issue.path.join('.')
            errors[path] = issue.message
          })
          return errors
        }
        return undefined
      }
    },
    onSubmit: async ({ value }) => {
      // 根据渠道类型获取配置字段定义
      const configFields = CHANNEL_CONFIG_FIELDS[value.type] || []

      // 动态构建 config 对象，只包含当前渠道定义的字段
      const config: Record<string, string> = {}

      for (const field of configFields) {
        const fieldName = field.name.split('.')[1] // 'config.webhook' -> 'webhook'
        const fieldValue =
          value.config?.[fieldName as keyof typeof value.config]

        // 必填字段或有值的可选字段才添加到 config 中
        if (field.required || (fieldValue && fieldValue !== '')) {
          config[fieldName] = fieldValue || ''
        }
      }

      await onSubmit({
        ...value,
        config
      } as unknown as CreateChannelDto | UpdateChannelDto)
    }
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto">
        <FieldGroup>
          {/* 渠道名称 */}
          <form.Field
            name="name"
            children={field => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    渠道名称
                    <span className="text-destructive ml-1">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="我的飞书机器人"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          {/* 渠道类型 */}
          <form.Field
            name="type"
            children={field => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    渠道类型
                    <span className="text-destructive ml-1">*</span>
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={value => {
                      field.handleChange(value as typeof field.state.value)
                      // 切换渠道类型时重置 config
                      form.setFieldValue('config', {
                        webhook: '',
                        secret: ''
                      })
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={isInvalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_OPTIONS.map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          {/* 渠道配置 - 根据类型动态渲染 */}
          <form.Subscribe
            selector={state => state.values.type}
            children={selectedType => {
              const configFields = CHANNEL_CONFIG_FIELDS[selectedType] || []

              return (
                <>
                  {configFields.map(fieldConfig => (
                    <form.Field
                      key={fieldConfig.name}
                      name={fieldConfig.name}
                      children={field => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {fieldConfig.label}
                              {fieldConfig.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type={fieldConfig.type}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={e => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder={fieldConfig.placeholder}
                              autoComplete="off"
                            />
                            <FieldDescription>
                              {fieldConfig.description}
                            </FieldDescription>
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  ))}
                </>
              )
            }}
          />

          {/* 状态 */}
          <form.Field
            name="status"
            children={field => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field orientation="horizontal" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>状态</FieldLabel>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {field.state.value === 'active' ? '启用' : '禁用'}
                    </span>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value === 'active'}
                      onCheckedChange={checked =>
                        field.handleChange(checked ? 'active' : 'inactive')
                      }
                      aria-invalid={isInvalid}
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </FieldGroup>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">{channel ? '更新渠道' : '创建渠道'}</Button>
      </div>
    </form>
  )
}
