# Changelog

All notable changes to this project will be documented in this file.

## [0.9.0] - 2025-06-13

### ⚠️ Breaking Changes

- **渠道配置架构重构**：渠道配置从数据库扁平列（`webhook_url`、`bot_token` 等 20 列）迁移为单一 JSON `config` 字段。运行迁移前请确保已备份数据库，迁移脚本会自动将旧列数据搬迁至 `config` 字段中。
- **`@/lib/channels/senders/*` 已移除**：旧发送器目录 (`senders/`) 已被 `definitions/` + `senders.server.ts` 替代。如需直接引用发送器，请改为 from `@/lib/channels/sender.server`。
- **`nodemailer` 已移除**：邮件发送改用 `@upyo/core` + `@upyo/smtp` + `@upyo/resend`，如项目外直接依赖了 `nodemailer` 请相应更新。

### Features

- 渠道配置统一为 JSON `config` 字段，支持任意渠道类型的灵活配置 (#0005)
- 构建时自动执行数据库迁移 (`postbuild` → `drizzle-kit migrate`)
- 各渠道类型配置表单组件化，支持字段校验、密码输入、动态选项等

### Refactor

- **客户端/服务端代码隔离**：渠道定义拆分为客户端安全的元数据（`configSchema` + `configFields` + `label` + `color`）和服务端专属的 `sendMessage`，修复浏览器端 `Module "stream" has been externalized` 等错误
  - 含 Node.js 依赖的发送逻辑（飞书 `node:crypto`、钉钉 `node:crypto`、邮件 `nodemailer`/`@upyo/smtp`）拆入 `.server.ts` 文件
  - `senders.server.ts` 统一聚合所有渠道的发送函数
  - `registry.ts` 仅导出客户端安全的 `ChannelMeta`，不再引入 `sendMessage`

- **渠道定义模块重组**：
  - `src/lib/channels/senders/*` → `src/lib/channels/definitions/*.server.ts` + `src/lib/channels/senders.server.ts`
  - 新增 `src/lib/channels/registry.ts`：客户端安全的渠道元数据注册中心
  - 新增 `src/lib/channels/types.ts`：`ChannelMeta` / `SendFn` / `SendResult` 类型定义
  - 各 `definitions/*.ts` 仅导出 `configSchema` + `configFields`，不再含 `sendMessage`

### Dependencies

- ➕ `@upyo/core` ^0.4.0
- ➕ `@upyo/smtp` ^0.4.0
- ➕ `@upyo/resend` ^0.4.0
- ➖ `nodemailer`
- ➖ `@types/nodemailer`

### Database Migrations

- `0005_nosy_archangel`：添加 `config` JSON 列，迁移旧扁平列数据
- `0006_loud_post`：删除 20 个废弃的扁平列
