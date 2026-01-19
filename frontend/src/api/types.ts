// Request/response typings aligned to the FastAPI routers under app/routers/*

type ApiResponse<T> = {
  message: string
  data: T
  meta: Record<string, unknown>
}

export type SummarizeRequest = { text: string }
export type SummarizeResponse = { message: string; data: Record<string, unknown>; meta: Record<string, unknown> }

export type IntentRequest = { text: string }
export type IntentResponse = { message: string; data: Record<string, unknown>; meta: Record<string, unknown> }

export type TaskClassificationRequest = {
  intent: string
  entities?: Record<string, unknown>
  context?: Record<string, unknown>
  original_text?: string
  confidence?: number
  text?: string
}
export type TaskClassificationResponse = { message: string; data: Record<string, unknown>; meta: Record<string, unknown> }

export type TaskCreateRequest = { description: string }
export type TaskUpdateRequest = { description?: string | null; status?: string | null }
export type Task = {
  id: number
  description: string
  status: string
  created_at: string
  updated_at: string
}

export type TaskResponse = ApiResponse<Task>
export type TaskListResponse = ApiResponse<Task[]>
export type TaskDeleteResponse = ApiResponse<null>

export type EmbedRequest = {
  texts: string[]
  user_id?: string
  session_id?: string
  platform?: string
}
export type EmbedResponse = { message: string; data: { embeddings: number[][]; obfuscated_embeddings: number[][] }; meta: Record<string, unknown> }

export type SimilarityRequest = {
  texts1: string[]
  texts2: string[]
  user_id?: string
  session_id?: string
  platform?: string
}
export type SimilarityResponse = { message: string; data: { similarities: number[][] }; meta: Record<string, unknown> }

export type RespondRequest = {
  query: string
  context?: Record<string, unknown>
  model?: string
  decision?: 'respond' | 'bhiv_core'
}
export type RespondResponse = { response?: string; error?: string } & Record<string, unknown>

export type BHIVRequest = { query: string; context?: Record<string, unknown> }
export type BHIVResponse = ApiResponse<{ bhiv_output: unknown }>

export type RLActionRequest = { state: Record<string, unknown>; actions: unknown[] }
export type RLActionResponse = ApiResponse<{ selected_action: unknown; probabilities: unknown; ranking: unknown }>

export type ExternalLLMRequest = { prompt: string; model?: string }
export type ExternalLLMResponse = ApiResponse<{ response: string }>

export type ExternalAppRequest = { app: string; action: string; params?: Record<string, unknown> }
export type ExternalAppResponse = ApiResponse<{ result: unknown }>

export type VoiceTTSRequest = {
  text: string
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  model?: 'gpt-4o-mini-tts' | 'gpt-4o-realtime-tts'
  save_cache?: boolean
}
export type VoiceTTSResponse = ApiResponse<{ audio_base64: string }>

export type VoiceSTTResponse = ApiResponse<{ text: string; language: string; confidence: number | null }>

export type DecisionHubResponse = { message: string; data: Record<string, unknown>; meta: Record<string, unknown> }

export type AssistantRequest = {
  version: string
  input: { message: string }
  context: { platform: string }
}
export type AssistantResponse = ApiResponse<{
  result: {
    response: string
    type: string
    task?: unknown
  }
}>

export type TokenRequest = { username: string }
export type TokenResponse = { access_token: string; token_type: 'bearer' }

