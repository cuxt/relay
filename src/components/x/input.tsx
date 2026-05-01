import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input as BaseInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === "password"

  return (
    <div className="relative">
      <BaseInput
        type={isPassword && showPassword ? "text" : type}
        data-slot="input"
        autoComplete={isPassword ? "current-password" : undefined}
        className={cn(isPassword && "pr-9", className)}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={showPassword ? "隐藏密码" : "显示密码"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}

export { Input }
