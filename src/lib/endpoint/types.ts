// Endpoint配置类型（JSON字段，可扩展）
export interface EndpointConfig {
  url?: string
  method?: string
  headers?: Record<string, string>
  timeout?: number
  retryCount?: number
  [key: string]: any // 允许自定义配置
}

// Endpoint模型（匹配数据库schema）
export interface Endpoint {
  id: string
  name: string
  config: EndpointConfig | null
  status: 'active' | 'inactive'
  userId: string
  channelId: string
  createdAt: Date
  updatedAt: Date
}

// 扩展类型，包含关联的Channel信息
export interface EndpointWithChannel extends Endpoint {
  channel: {
    id: string
    name: string
    type: string
  }
}

// 创建DTO
export interface CreateEndpointDto {
  name: string
  channelId: string
  config?: EndpointConfig
  status?: 'active' | 'inactive'
}

// 更新DTO
export interface UpdateEndpointDto {
  name?: string
  channelId?: string
  config?: EndpointConfig
  status?: 'active' | 'inactive'
}
