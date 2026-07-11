import { api } from './api'
import { apiInfo } from './meta'
import { auth } from '@/lib/auth/auth'

interface OpenApiSchema {
  openapi: string
  info: Record<string, unknown>
  paths?: Record<string, PathItem>
  tags?: Array<{ name: string; description?: string }>
  components?: Record<string, unknown>
  security?: unknown[]
  servers?: unknown[]
}

type PathItem = Record<string, Operation | unknown>

interface Operation {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
}

export async function openApiSchema(request: Request) {
  const [appSchema, authSchema] = await Promise.all([
    api.handle(new Request(new URL('/openapi/elysia-json', request.url), request)).then(readSchema),
    auth
      .handler(new Request(new URL('/api/auth/open-api/generate-schema', request.url), request))
      .then(readSchema),
  ])

  return Response.json(localizeSchema(mergeOpenApi(appSchema, authSchema, request)))
}

async function readSchema(response: Response) {
  return response.json() as Promise<OpenApiSchema>
}

function mergeOpenApi(app: OpenApiSchema, authSchema: OpenApiSchema, request: Request): OpenApiSchema {
  return {
    ...app,
    info: {
      ...app.info,
      ...apiInfo,
    },
    paths: {
      ...nameAuthPaths(prefixPaths(authSchema.paths, '/api/auth')),
      ...app.paths,
    },
    tags: mergeTags(authSchema.tags, authTags, app.tags),
    components: mergeComponents(authSchema.components, app.components),
    security: app.security,
    servers: [{ url: new URL(request.url).origin }],
  }
}

function prefixPaths(paths: OpenApiSchema['paths'], prefix: string) {
  return Object.fromEntries(
    Object.entries(paths ?? {}).map(([path, value]) => [`${prefix}${path}`, value])
  )
}

function nameAuthPaths(paths: Record<string, PathItem>) {
  for (const [path, item] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(item)) {
      if (!isOperation(method, operation)) continue

      const summary = authSummaries[`${method.toUpperCase()} ${path}`]
      if (!summary) continue

      operation.summary = summary
      operation.description = summary
    }
  }

  return paths
}

function isOperation(method: string, value: unknown): value is Operation {
  return ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method) && isRecord(value)
}

function mergeTags(...groups: Array<OpenApiSchema['tags']>) {
  const tags = new Map<string, { name: string; description?: string }>()

  for (const group of groups) {
    for (const tag of group ?? []) {
      tags.set(tag.name, tag)
    }
  }

  return [...tags.values()]
}

function mergeComponents(
  authComponents: OpenApiSchema['components'],
  appComponents: OpenApiSchema['components']
) {
  return {
    ...authComponents,
    ...appComponents,
    schemas: {
      ...getComponentGroup(authComponents, 'schemas'),
      ...getComponentGroup(appComponents, 'schemas'),
    },
    securitySchemes: {
      ...getComponentGroup(authComponents, 'securitySchemes'),
      ...getComponentGroup(appComponents, 'securitySchemes'),
    },
  }
}

function getComponentGroup(components: OpenApiSchema['components'], key: string) {
  const value = components?.[key]
  return isRecord(value) ? value : {}
}

function localizeSchema<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => localizeSchema(item)) as T
  }

  if (!value || typeof value !== 'object') {
    return translate(value) as T
  }

  const result: Record<string, unknown> = {}

  for (const [key, item] of Object.entries(value)) {
    result[key] = localizeSchema(item)
  }

  return result as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function translate(value: unknown) {
  if (value === 'Default') return '认证'
  if (value === 'Admin') return '管理员'
  if (typeof value !== 'string') return value

  return translations[value] ?? value
}

const translations: Record<string, string> = {
  'API Reference for your Better Auth Instance': 'Better Auth 接口文档',
  'Default endpoints that are included with Better Auth by default. These endpoints are not part of any plugin.':
    'Better Auth 默认提供的认证接口。',
  'Sign in with a social provider': '使用第三方账号登录',
  'Sign in with email and password': '使用邮箱和密码登录',
  'Callback URL to redirect to after the user has signed in': '登录成功后的回调地址',
  'Callback URL to redirect to if an error happens': '发生错误时的回调地址',
  'Disable automatic redirection to the provider. Useful for handling the redirection yourself':
    '禁用自动跳转，适合自行处理第三方登录跳转。',
  'The login hint to use for the authorization code request': '授权码请求使用的登录提示。',
  'Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider':
    '显式请求注册，适用于关闭隐式注册的第三方登录。',
  'Array of scopes to request from the provider. This will override the default scopes passed.':
    '向第三方平台请求的权限范围，会覆盖默认范围。',
  'Email of the user': '用户邮箱',
  'Password of the user': '用户密码',
  'Callback URL to use as a redirect for email verification': '邮箱验证后跳转的回调地址',
  'If this is false, the session will not be remembered. Default is `true`.':
    '为 false 时不会记住会话。默认值为 true。',
  'Session token': '会话令牌',
  'Session response when idToken is provided': '提供 idToken 时返回的会话响应',
  'Success - Returns either session details or redirect URL': '成功，返回会话信息或跳转地址',
  'Bad Request. Usually due to missing parameters, or invalid parameters.':
    '请求错误，通常是参数缺失或参数无效。',
  'Unauthorized. Due to missing or invalid authentication.': '未认证，缺少认证信息或认证无效。',
  'Forbidden. You do not have permission to access this resource or to perform this action.':
    '禁止访问，没有访问该资源或执行该操作的权限。',
  'Not Found. The requested resource was not found.': '未找到请求的资源。',
  'Too Many Requests. You have exceeded the rate limit. Try again later.':
    '请求过于频繁，已超过限流，请稍后再试。',
  'Internal Server Error. This is a problem with the server that you cannot fix.':
    '服务器内部错误。',
}

const authTags = [{ name: 'Admin', description: 'Better Auth 管理员接口。' }]

const authSummaries: Record<string, string> = {
  'POST /api/auth/sign-in/social': '第三方账号登录',
  'GET /api/auth/callback/{id}': '处理第三方登录回调',
  'POST /api/auth/callback/{id}': '提交第三方登录回调',
  'GET /api/auth/get-session': '获取当前会话',
  'POST /api/auth/get-session': '获取当前会话',
  'POST /api/auth/sign-out': '退出登录',
  'POST /api/auth/sign-up/email': '邮箱注册',
  'POST /api/auth/sign-in/email': '邮箱密码登录',
  'POST /api/auth/reset-password': '重置密码',
  'POST /api/auth/verify-password': '验证密码',
  'GET /api/auth/verify-email': '验证邮箱',
  'POST /api/auth/send-verification-email': '发送邮箱验证邮件',
  'POST /api/auth/change-email': '修改邮箱',
  'POST /api/auth/change-password': '修改密码',
  'POST /api/auth/update-session': '更新会话',
  'POST /api/auth/update-user': '更新用户信息',
  'POST /api/auth/delete-user': '删除当前用户',
  'POST /api/auth/request-password-reset': '发送密码重置邮件',
  'GET /api/auth/reset-password/{token}': '打开密码重置页面',
  'GET /api/auth/list-sessions': '列出当前用户会话',
  'POST /api/auth/revoke-session': '撤销指定会话',
  'POST /api/auth/revoke-sessions': '撤销全部会话',
  'POST /api/auth/revoke-other-sessions': '撤销其他会话',
  'POST /api/auth/link-social': '绑定第三方账号',
  'GET /api/auth/list-accounts': '列出已绑定账号',
  'GET /api/auth/delete-user/callback': '处理删除用户回调',
  'POST /api/auth/unlink-account': '解绑第三方账号',
  'POST /api/auth/refresh-token': '刷新访问令牌',
  'POST /api/auth/get-access-token': '获取访问令牌',
  'GET /api/auth/account-info': '获取账号信息',
  'GET /api/auth/ok': '认证健康检查',
  'GET /api/auth/error': '认证错误页',
  'POST /api/auth/admin/set-role': '设置用户角色',
  'GET /api/auth/admin/get-user': '获取用户详情',
  'POST /api/auth/admin/create-user': '创建用户',
  'POST /api/auth/admin/update-user': '更新用户信息',
  'GET /api/auth/admin/list-users': '列出用户',
  'POST /api/auth/admin/list-user-sessions': '列出用户会话',
  'POST /api/auth/admin/unban-user': '解除用户封禁',
  'POST /api/auth/admin/ban-user': '封禁用户',
  'POST /api/auth/admin/impersonate-user': '模拟用户登录',
  'POST /api/auth/admin/stop-impersonating': '退出模拟登录',
  'POST /api/auth/admin/revoke-user-session': '撤销用户指定会话',
  'POST /api/auth/admin/revoke-user-sessions': '撤销用户全部会话',
  'POST /api/auth/admin/remove-user': '删除用户',
  'POST /api/auth/admin/set-user-password': '设置用户密码',
  'POST /api/auth/admin/has-permission': '检查用户权限',
}
