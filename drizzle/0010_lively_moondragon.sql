-- 为 account.issuer 加列（better-auth 1.7+ 要求）
-- 临时 DEFAULT 让存量行通过 NOT NULL 约束，再把默认值收敛到 NULL
ALTER TABLE "account" ADD COLUMN "issuer" text DEFAULT 'local:credential' NOT NULL;--> statement-breakpoint

-- 凭据类账号：local:credential；GitHub OAuth：OIDC issuer 即 https://github.com
UPDATE "account" SET "issuer" = 'local:credential' WHERE "provider_id" = 'credential';--> statement-breakpoint
UPDATE "account" SET "issuer" = 'https://github.com' WHERE "provider_id" = 'github';--> statement-breakpoint

-- 清理临时默认值，新写入由 better-auth 自己提供 issuer
ALTER TABLE "account" ALTER COLUMN "issuer" DROP DEFAULT;
