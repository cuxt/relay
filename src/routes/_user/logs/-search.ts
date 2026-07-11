export type LogsSearch = {
  page: number
  status?: string
  search?: string
  endpointId?: string
  channelType?: string
}

export type LogsSearchInput = Partial<Record<keyof LogsSearch, unknown>>

function normalizeTextParam(value: unknown) {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function normalizePage(value: unknown) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function normalizeLogsSearch(search: LogsSearchInput): LogsSearch {
  return {
    page: normalizePage(search.page),
    status: normalizeTextParam(search.status),
    search: normalizeTextParam(search.search),
    endpointId: normalizeTextParam(search.endpointId),
    channelType: normalizeTextParam(search.channelType)
  }
}

export function buildLogsSearch(search: LogsSearchInput): LogsSearch {
  return normalizeLogsSearch(search)
}
