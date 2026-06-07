"use client"

import * as React from "react"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ImageOff, Loader2, X } from "lucide-react"

export interface ImageLightboxProps {
  /** 当前要预览的图片;为 null 时对话框关闭 */
  image: { src: string; alt?: string } | null
  /** 关闭回调 */
  onClose: () => void
}

/**
 * 通用图片预览组件,使用 Dialog 作为可访问性/焦点管理的容器,
 * 内部以 fixed 全屏布局居中展示远程图片,适用于 markdown 渲染后
 * 用户点击 <img> 触发的放大查看场景。
 */
export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  return (
    <Dialog
      open={!!image}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      {image ? (
        <LightboxContent
          src={image.src}
          alt={image.alt ?? ""}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  )
}

function LightboxContent({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  const [loaded, setLoaded] = React.useState(false)
  const [errored, setErrored] = React.useState(false)

  React.useEffect(() => {
    setLoaded(false)
    setErrored(false)
  }, [src])

  React.useEffect(() => {
    if (!imageKey(src)) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
    }
  }, [src, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <DialogTitle className="sr-only">{alt || "图片预览"}</DialogTitle>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="关闭预览"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center justify-center"
        onClick={event => {
          event.stopPropagation()
        }}
      >
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center text-white/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {errored ? (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-black/70 px-6 py-10 text-white">
            <ImageOff className="h-8 w-8" />
            <p className="text-sm">图片加载失败</p>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-white/70 underline underline-offset-2 hover:text-white"
            >
              在新窗口打开
            </a>
          </div>
        ) : (
          // biome-ignore lint/performance/noImgElement: 需要使用原生 <img> 以支持 onError 回调
          <img
            src={src}
            alt={alt}
            onLoad={() => {
              setLoaded(true)
            }}
            onError={() => {
              setErrored(true)
            }}
            className={cn(
              "max-h-[90vh] max-w-[92vw] rounded-md object-contain shadow-2xl transition-opacity duration-200",
              loaded ? "opacity-100" : "opacity-0"
            )}
            draggable={false}
          />
        )}
        {alt ? (
          <p className="mt-3 max-w-[80vw] truncate text-center text-xs text-white/70">
            {alt}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function imageKey(src: string) {
  return src
}
