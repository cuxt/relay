import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, openAPI } from 'better-auth/plugins'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { send } from '@/lib/email/send'
import { AUTH } from '@/constants'

const makeEmailHtml = (title: string, message: string, buttonText: string, buttonUrl: string) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
  <style>
    a { text-decoration: none; color: #2D2A2A; }
    @media (max-width: 480px) {
      .content { padding-left: 0 !important; padding-right: 0 !important; }
      .button td { width: 100% !important; }
      .button a { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FFFFFF; word-spacing: normal;">
  <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <!-- Header -->
    <div style="padding: 48px 25px 24px; text-align: center;">
      <h1 style="font-size: 20px; font-weight: 600; color: #2D2A2A; margin: 0;">${title}</h1>
    </div>

    <!-- Content Card -->
    <div style="background: transparent; border-radius: 12px; padding: 0 24px;">
      <div style="padding: 24px; background: #ffffff; border-radius: 12px;">
        <!-- Greeting -->
        <p style="font-size: 14px; line-height: 25px; color: #2D2A2A; margin: 0 0 16px;">您好，</p>

        <!-- Message -->
        <p style="font-size: 14px; line-height: 25px; color: #2D2A2A; margin: 0 0 24px;">${message}</p>

        <!-- Button -->
        <table class="button" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; line-height: 100%;">
          <tbody>
            <tr>
              <td align="center" bgcolor="#000000" style="border: none; border-radius: 100px; cursor: auto; padding: 0;">
                <a href="${buttonUrl}" target="_blank" style="display: inline-block; background: #000000; color: #ffffff; font-size: 15px; font-weight: 500; margin: 0; text-decoration: none; padding: 12px 32px; border-radius: 100px;">${buttonText}</a>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Spacing -->
        <p style="font-size: 14px; line-height: 25px; color: #2D2A2A; margin: 24px 0;">&nbsp;</p>

        <!-- Fallback Link -->
        <p style="font-size: 14px; line-height: 25px; color: #2D2A2A; margin: 0 0 8px;">如果按钮无法点击，请复制下方链接到浏览器打开：</p>
        <div style="background: #f3f3f3; border-radius: 10px; padding: 12px 20px;">
          <p style="font-family: monospace; font-size: 13px; line-height: 24px; color: #2D2A2A; margin: 0; word-break: break-all;">${buttonUrl}</p>
        </div>

        <!-- Note -->
        <p style="font-size: 12px; line-height: 21px; color: #9ca3af; margin: 24px 0 0;">此链接有效期为 1 小时。</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 24px 25px;">
      <p style="font-size: 12px; line-height: 21px; color: #9ca3af; margin: 0; text-align: center;">此邮件由系统自动发送，请勿回复。</p>
    </div>
  </div>
</body>
</html>`
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? '', 'http://localhost:*'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  session: {
    expiresIn: AUTH.SESSION_EXPIRES_IN,
    updateAge: AUTH.SESSION_UPDATE_AGE,
    cookieCache: {
      enabled: true,
      maxAge: AUTH.COOKIE_CACHE_MAX_AGE,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ newEmail, url }) => {
        try {
          await send({
            to: newEmail,
            subject: '验证邮箱变更',
            html: makeEmailHtml(
              '验证邮箱变更',
              '你正在申请更换邮箱，请点击下方按钮验证你的新邮箱地址。',
              '验证新邮箱',
              url
            ),
          })
        } catch (error) {
          console.error('[Email] 发送邮箱变更确认邮件失败:', error)
          throw error
        }
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await send({
          to: user.email,
          subject: '验证邮箱',
          html: makeEmailHtml(
            '验证邮箱',
            '感谢你注册我们的服务，请点击下方按钮验证你的邮箱地址。',
            '验证邮箱',
            url
          ),
        })
      } catch (error) {
        console.error('[Email] 发送邮箱验证邮件失败:', error)
        throw error
      }
    },
  },
  plugins: [admin(), openAPI({ disableDefaultReference: true })],
})
