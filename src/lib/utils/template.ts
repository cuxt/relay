/**
 * 从对象中根据路径获取值
 * @param obj 源对象
 * @param path 路径字符串，如 "body.data.message"
 * @returns 找到的值或undefined
 */
export function getValueByPath(obj: any, path: string): any {
  const keys = path.split('.')
  let value = obj

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }

  return value
}

/**
 * 替换模板字符串中的占位符
 * @param template 模板字符串，如 "消息：${body.data.message}"
 * @param data 数据对象
 * @returns 替换后的字符串
 */
export function replaceTemplate(template: string, data: any): string {
  // 匹配 ${...} 格式的占位符
  const regex = /\$\{([^}]+)\}/g

  return template.replace(regex, (match, path) => {
    const value = getValueByPath(data, path.trim())

    // 如果值不存在，保留原始占位符
    if (value === undefined || value === null) {
      return match
    }

    // 如果是对象或数组，转为JSON字符串
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  })
}
