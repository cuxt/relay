import { Elysia, t } from 'elysia'
import { EMAIL_CONFIG_KEY, EmailConfigSchema, type EmailConfig } from '@/constants'
import { get, set } from '@/lib/config/kv'
import { send } from '@/lib/email/send'
import { requireAdmin } from '@/server/guards'

export const emailRoutes = new Elysia({ name: 'email' })
  .use(requireAdmin)
  .get(
    '/api/email/config',
    async () => (await get<EmailConfig>(EMAIL_CONFIG_KEY)) ?? {},
    {
      detail: {
        tags: ['邮箱'],
        summary: '获取邮件配置',
      },
      requireAdmin: true,
      response: {
        200: t.Union([EmailConfigSchema, t.Object({})]),
      },
    }
  )
  .put(
    '/api/email/config',
    async ({ body }) => {
      await set(EMAIL_CONFIG_KEY, body)
      return body
    },
    {
      detail: {
        tags: ['邮箱'],
        summary: '保存邮件配置',
      },
      requireAdmin: true,
      body: EmailConfigSchema,
      response: {
        200: EmailConfigSchema,
      },
    }
  )
  .post(
    '/api/email/send',
    async ({ body }) => {
      await send({
        to: body.to,
        subject: body.subject,
        html: body.html,
        text: body.text,
      })
      return { ok: true }
    },
    {
      detail: {
        tags: ['邮箱'],
        summary: '发送邮件',
        description: '使用当前邮件配置发送一封邮件，失败将抛错。',
      },
      requireAdmin: true,
      body: t.Object({
        to: t.String(),
        subject: t.String(),
        html: t.String(),
        text: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({ ok: t.Literal(true) }),
      },
    }
  )
