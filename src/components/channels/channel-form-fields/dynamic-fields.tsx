import { useId } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getIn } from '@/lib/channels/form-helpers'
import type { ConfigFieldDef } from '@/lib/channels/types'
import type { ChannelFieldsProps } from './channel-field'

interface DynamicChannelFieldsProps extends ChannelFieldsProps {
  fields: ConfigFieldDef[]
}

function FieldLabel({ htmlFor, field }: { htmlFor?: string; field: ConfigFieldDef }) {
  return (
    <Label htmlFor={htmlFor}>
      {field.label}
      {field.required && <span className="ml-1 text-destructive">*</span>}
    </Label>
  )
}

function FieldHelp({ description, error }: { description?: string; error?: string }) {
  return (
    <>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  )
}

function DynamicField({
  field,
  config,
  onChange,
  errors,
  disabled,
}: ChannelFieldsProps & { field: ConfigFieldDef }) {
  const id = useId()
  const path = `config.${field.key}`
  const value = getIn(config, field.key) ?? field.defaultValue
  const error = errors[path]

  if (field.type === 'hidden') return null

  if (field.type === 'select') {
    return (
      <div className="space-y-2">
        <FieldLabel field={field} />
        <Select
          value={value == null ? undefined : String(value)}
          onValueChange={(next) => onChange(path, next)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full sm:max-w-xs" aria-invalid={!!error}>
            <SelectValue placeholder={field.placeholder || `请选择${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldHelp description={field.description} error={error} />
      </div>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(path, checked)}
            disabled={disabled}
            aria-invalid={!!error}
          />
          <FieldLabel htmlFor={id} field={field} />
        </div>
        <FieldHelp description={field.description} error={error} />
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-2">
        <FieldLabel htmlFor={id} field={field} />
        <Textarea
          id={id}
          value={value == null ? '' : String(value)}
          onChange={(event) => onChange(path, event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className="min-h-24 font-mono"
        />
        <FieldHelp description={field.description} error={error} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} field={field} />
      <Input
        id={id}
        type={field.type || 'text'}
        value={value == null ? '' : String(value)}
        onChange={(event) =>
          onChange(
            path,
            field.type === 'number'
              ? event.target.value
                ? Number(event.target.value)
                : undefined
              : event.target.value
          )
        }
        placeholder={field.placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className={field.type === 'url' || field.type === 'password' ? 'font-mono' : undefined}
      />
      <FieldHelp description={field.description} error={error} />
    </div>
  )
}

/** 根据渠道定义中的 configFields 元数据生成连接配置表单。 */
export function DynamicChannelFields({
  fields,
  config,
  onChange,
  errors,
  disabled,
}: DynamicChannelFieldsProps) {
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <DynamicField
          key={field.key}
          field={field}
          config={config}
          onChange={onChange}
          errors={errors}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
