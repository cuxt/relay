export interface UploadResult {
  /** 资源访问 URL（经服务端中转，永不过期） */
  accessUrl: string
  /** 对象 key */
  key: string
}

export interface UploadOptions {
  /** 自定义对象 key 前缀，默认 'avatars' */
  prefix?: string
  /** 预签名有效期（秒），默认 600 */
  expires?: number
}

/**
 * 通用上传：向后端申请预签名地址，前端直传到对象存储。
 * 返回经服务端中转的资源访问 URL（永不过期），可直接入库或用于展示。
 */
export async function uploadFile(
  file: File,
  opts: UploadOptions = {}
): Promise<UploadResult> {
  const prefix = opts.prefix ?? 'avatars'
  const key = `${prefix}/${randomKey()}${extOf(file.name)}`

  const presignRes = await fetch('/api/storage/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, contentType: file.type, expires: opts.expires }),
  })
  if (!presignRes.ok) {
    throw new Error('获取上传地址失败')
  }
  const { putUrl, accessUrl } = (await presignRes.json()) as {
    putUrl: string
    accessUrl: string
    key: string
  }

  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!putRes.ok) {
    throw new Error('上传失败')
  }

  return { accessUrl, key }
}

/** 生成 <年月>/<随机串> 形式的对象 key 分段 */
function randomKey(): string {
  const now = new Date()
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 10)
  return `${ym}/${rand}`
}

/** 从文件名取小写扩展名（含点），无扩展名时返回空串 */
function extOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i).toLowerCase() : ''
}
