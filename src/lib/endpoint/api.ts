import type {
  Endpoint,
  EndpointWithChannel,
  CreateEndpointDto,
  UpdateEndpointDto
} from './types'

const API_BASE = '/api/endpoints'

export async function getEndpoints(): Promise<EndpointWithChannel[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error('获取端点列表失败')
  }
  return response.json()
}

export async function getEndpoint(id: string): Promise<EndpointWithChannel> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) {
    throw new Error('获取端点信息失败')
  }
  return response.json()
}

export async function createEndpoint(
  data: CreateEndpointDto
): Promise<Endpoint> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建端点失败')
  }
  return response.json()
}

export async function updateEndpoint(
  id: string,
  data: UpdateEndpointDto
): Promise<Endpoint> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新端点失败')
  }
  return response.json()
}

export async function deleteEndpoint(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除端点失败')
  }
}
