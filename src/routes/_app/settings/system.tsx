import { useState, useMemo } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { icons, Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AppLogo } from '@/components/layout/AppLogo'
import { updateSiteConfig } from '@/lib/site-config/queries'

function toKebabCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

const allIcons = Object.entries(icons).map(([pascal]) => ({
  pascal,
  kebab: toKebabCase(pascal),
}))

export const Route = createFileRoute('/_app/settings/system')({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SystemSettings,
})

function SystemSettings() {
  const { siteConfig } = Route.useRouteContext()

  const [siteName, setSiteName] = useState(siteConfig.siteName)
  const [iconType, setIconType] = useState(siteConfig.iconType)
  const [iconValue, setIconValue] = useState(siteConfig.iconValue)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [iconSearch, setIconSearch] = useState('')

  const filteredIcons = useMemo(() => {
    const search = iconSearch.toLowerCase()
    return allIcons
      .filter(({ kebab }) => !search || kebab.includes(search))
      .slice(0, 50)
  }, [iconSearch])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSiteConfig({ data: { siteName, iconType, iconValue } }),
    onSuccess: () => {
      toast.success('保存成功，正在刷新…')
      setTimeout(() => window.location.reload(), 500)
    },
    onError: () => {
      toast.error('保存失败')
    },
  })

  const iconTypeOptions = [
    { value: 'lucide', label: 'Lucide 图标' },
    { value: 'url', label: '图片 URL' },
    { value: 'emoji', label: 'Emoji' },
  ]

  const iconValuePlaceholder: Record<string, string> = {
    lucide: '图标名称，如 bubbles、home、settings',
    url: 'https://example.com/icon.png',
    emoji: '🚀',
  }

  const hasChanges =
    siteName !== siteConfig.siteName ||
    iconType !== siteConfig.iconType ||
    iconValue !== siteConfig.iconValue

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>系统配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Site Name */}
          <div className="space-y-2">
            <Label htmlFor="siteName">站点名称</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="输入站点名称"
            />
          </div>

          {/* Icon Type */}
          <div className="space-y-2">
            <Label>图标类型</Label>
            <Select
              value={iconType}
              onValueChange={(val) => {
                if (val) {
                  setIconType(val)
                  setIconValue('')
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {iconTypeOptions.find((opt) => opt.value === iconType)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {iconTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon Value */}
          <div className="space-y-2">
            <Label htmlFor="iconValue">图标值</Label>
            {iconType === 'lucide' ? (
              <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <PopoverTrigger
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground"
                >
                  {iconValue ? (
                    <span className="flex items-center gap-2">
                      {(() => {
                        const match = allIcons.find((i) => i.kebab === iconValue)
                        if (!match) return null
                        const Icon = icons[match.pascal as keyof typeof icons]
                        return Icon ? <Icon className="h-4 w-4" /> : null
                      })()}
                      <span>{iconValue}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">选择图标…</span>
                  )}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[--anchor-width] p-0" align="start">
                  <div className="p-2">
                    <Input
                      placeholder="搜索图标…"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="no-scrollbar max-h-72 overflow-y-auto p-1">
                    {filteredIcons.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        未找到图标
                      </p>
                    ) : (
                      filteredIcons.map(({ pascal, kebab }) => {
                        const Icon = icons[pascal as keyof typeof icons]
                        const selected = iconValue === kebab
                        return (
                          <button
                            key={kebab}
                            type="button"
                            data-checked={selected || undefined}
                            className="flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-checked:bg-accent data-checked:text-accent-foreground"
                            onClick={() => {
                              setIconValue(kebab)
                              setIconPickerOpen(false)
                              setIconSearch('')
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{kebab}</span>
                            {selected && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                id="iconValue"
                value={iconValue}
                onChange={(e) => setIconValue(e.target.value)}
                placeholder={iconValuePlaceholder[iconType] ?? ''}
              />
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>预览</Label>
            <div className="rounded-lg border border-border bg-muted/30">
              <AppLogo siteConfig={{ siteName: siteName || '未命名站点', iconType, iconValue }} />
            </div>
          </div>

          {/* Save */}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={
              saveMutation.isPending ||
              !siteName.trim() ||
              !iconValue.trim() ||
              !hasChanges
            }
          >
            {saveMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            保存
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
