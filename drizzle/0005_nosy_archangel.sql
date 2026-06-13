ALTER TABLE "channels" ADD COLUMN "config" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint

-- 将旧扁平列数据搬迁到 config JSON
UPDATE "channels" SET "config" =
  CASE "type"
    WHEN 'feishu' THEN jsonb_strip_nulls(jsonb_build_object(
      'webhook', "webhook_url",
      'secret', "secret"
    ))
    WHEN 'wecom' THEN jsonb_strip_nulls(jsonb_build_object(
      'webhook', "webhook_url"
    ))
    WHEN 'wecom_app' THEN jsonb_strip_nulls(jsonb_build_object(
      'corpId', "corp_id",
      'agentId', "agent_id",
      'secret', "app_secret"
    ))
    WHEN 'dingtalk' THEN jsonb_strip_nulls(jsonb_build_object(
      'webhook', "webhook_url",
      'secret', "secret"
    ))
    WHEN 'telegram' THEN jsonb_strip_nulls(jsonb_build_object(
      'botToken', "bot_token",
      'chatId', "chat_id"
    ))
    WHEN 'discord' THEN jsonb_strip_nulls(jsonb_build_object(
      'webhook', "webhook_url"
    ))
    WHEN 'webhook' THEN jsonb_strip_nulls(jsonb_build_object(
      'webhook', "webhook_url",
      'method', "webhook_method",
      'headers', "webhook_headers"
    ))
    WHEN 'email' THEN
      CASE
        WHEN COALESCE("email_provider", 'smtp') = 'resend' THEN jsonb_strip_nulls(jsonb_build_object(
          'provider', 'resend',
          'from', "email_from",
          'to', "email_to",
          'resend', jsonb_build_object('apiKey', "resend_api_key")
        ))
        ELSE jsonb_strip_nulls(jsonb_build_object(
          'provider', 'smtp',
          'from', "email_from",
          'to', "email_to",
          'smtp', jsonb_build_object(
            'host', "smtp_host",
            'port', COALESCE("smtp_port", 465),
            'secure', COALESCE("smtp_secure", true),
            'user', "smtp_user",
            'password', "smtp_password"
          )
        ))
      END
    WHEN 'bark' THEN jsonb_strip_nulls(jsonb_build_object(
      'server', "bark_server_url",
      'key', "bark_device_key"
    ))
    ELSE '{}'::jsonb
  END;