import type { Channel, CreateChannelDto, UpdateChannelDto } from './types'

const API_BASE = '/api/channels'

export async function getChannels(): Promise<Channel[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error('获取渠道列表失败')
  }
  return response.json()
}

export async function getChannel(id: string): Promise<Channel> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) {
    throw new Error('获取渠道信息失败')
  }
  return response.json()
}

export async function createChannel(data: CreateChannelDto): Promise<Channel> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建渠道失败')
  }
  return response.json()
}

export async function updateChannel(
  id: string,
  data: UpdateChannelDto
): Promise<Channel> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新渠道失败')
  }
  return response.json()
}

export async function deleteChannel(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除渠道失败')
  }
}
