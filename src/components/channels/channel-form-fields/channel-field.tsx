import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** 各渠道 fields 组件的统一受控接口 */
export interface ChannelFieldsProps {
  config: Record<string, unknown>
  onChange: (path: string, value: unknown) => void
  errors: Record<string, string>
  disabled?: boolean
}

/**
 * 渠道表单字段包装：受控 Input + Label + 描述 + 错误，替代旧 react-hook-form 的
 * FormField/FormItem/FormLabel/FormControl/FormDescription/FormMessage 组合。
 * 不依赖 `@/components/ui/form`，与模板 endpoint-form 受控范式一致。
 */
interface ChannelFieldProps {
  label: React.ReactNode
  /** 点路径，如 `config.webhook` / `config.smtp.host` */
  path: string
  value: unknown
  onChange: (path: string, value: unknown) => void
  description?: React.ReactNode
  error?: string
  required?: boolean
  type?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
}

export function ChannelField({
  label,
  path,
  value,
  onChange,
  description,
  error,
  required,
  type = 'text',
  placeholder,
  disabled,
  className,
  inputClassName
}: ChannelFieldProps) {
  const id = useId()
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value === undefined || value === null ? '' : (value as string)}
        onChange={e => onChange(path, type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        className={inputClassName}
      />
      {description && (
        <p className="text-[0.8rem] text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
