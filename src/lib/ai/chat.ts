import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'

interface ChatCompletionParams {
  baseUrl: string
  apiKey: string
  model: string
  systemPrompt: string
  userMessage: string
  timeoutMs?: number
}

interface ChatCompletionResult {
  success: boolean
  content?: string
  errorMessage?: string
  latencyMs: number
}

export async function chatCompletion({
  baseUrl,
  apiKey,
  model,
  systemPrompt,
  userMessage,
  timeoutMs = 120000
}: ChatCompletionParams): Promise<ChatCompletionResult> {
  const startTime = Date.now()

  const provider = createOpenAICompatible({
    name: 'relay-ai',
    baseURL: baseUrl.replace(/\/+$/, ''),
    apiKey
  })

  try {
    const { text } = await generateText({
      model: provider(model),
      system: systemPrompt,
      prompt: userMessage,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(timeoutMs)
    })

    const latencyMs = Date.now() - startTime

    if (!text) {
      return {
        success: false,
        errorMessage: 'AI API 返回了空内容',
        latencyMs
      }
    }

    return { success: true, content: text, latencyMs }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime
    return {
      success: false,
      errorMessage: `AI 请求失败: ${err.message}`,
      latencyMs
    }
  }
}
