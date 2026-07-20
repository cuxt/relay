import { Check, Palette } from 'lucide-react'
import { themePresets } from '@/config/theme-presets'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function ThemePresetPicker() {
  const { preset: activePreset, setPreset } = useTheme()

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="选择颜色预设" />}>
        <Palette className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="mb-3">
          <p className="text-sm font-medium">颜色预设</p>
          <p className="mt-0.5 text-xs text-muted-foreground">选择界面的整体配色</p>
        </div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="颜色预设">
          {themePresets.map((preset) => {
            const active = preset.value === activePreset

            return (
              <button
                key={preset.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPreset(preset.value)}
                className={cn(
                  'group relative rounded-lg border p-2 text-left outline-none transition-colors',
                  'hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/50',
                  active ? 'border-primary bg-accent/50' : 'border-border'
                )}
              >
                <span
                  className="block h-9 rounded-md ring-1 ring-black/5"
                  style={{
                    background: `linear-gradient(135deg, ${preset.swatches[0]}, ${preset.swatches[1]})`,
                  }}
                />
                <span className="mt-1.5 block truncate text-xs font-medium">{preset.label}</span>
                {active && (
                  <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
